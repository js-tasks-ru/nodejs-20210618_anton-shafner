const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);
  const pathnameArray = pathname.split('/');
  const nestingLvl = 0 || (Array.isArray(pathnameArray) && pathnameArray.length);
  let isDeleteFile = true;

  const filepath = path.join(__dirname, 'files', pathname);

  req.on('close', (err) => {
    if (isDeleteFile) {
      fs.unlinkSync(filepath, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Server error');
        }
      });
      res.statusCode = 500;
      res.end();
    }
  });

  req.on('error', () => {
    res.statusCode = 500;
    res.end('Server error');
  });

  switch (req.method) {
    case 'POST':
      const limitedStream = new LimitSizeStream({limit: 1048576});
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      req.pipe(limitedStream).pipe(writeStream);
      limitedStream.on('error', (error) => {
        writeStream.destroy();
        limitedStream.destroy();
        fs.unlinkSync(filepath, (err) => {
          if (err) {
            res.statusCode = 500;
            res.end('Server error');
          }
        });
        res.statusCode = error.code === 'LIMIT_EXCEEDED' ? 413 : 500;
        res.end('File is too large');
      });
      writeStream.on('error', (err) => {
        writeStream.destroy();
        limitedStream.destroy();
        if (nestingLvl !== 0 && nestingLvl > 1) {
          res.statusCode = 400;
          res.end('Subfolders not supported');
        } else if (err.code === 'EEXIST') {
          isDeleteFile = false;
          res.statusCode = 409;
          res.end('File already exists');
        } else {
          res.statusCode = 500;
          res.end();
        }
      });
      writeStream.on('finish', () => {
        isDeleteFile = false;
        res.statusCode = 201;
        res.end();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
