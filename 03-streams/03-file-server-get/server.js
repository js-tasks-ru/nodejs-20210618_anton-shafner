const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);
  const pathnameArray = pathname.split('/');
  const nestingLvl = 0 || (Array.isArray(pathnameArray) && pathnameArray.length);

  const filepath = path.join(__dirname, 'files', pathname);
  const stream = fs.createReadStream(filepath);
  stream.on('error', () => {
    if (nestingLvl !== 0 && nestingLvl > 1) {
      res.statusCode = 400;
      res.end('Subfolders not supported');
    } else {
      res.statusCode = 404;
      res.end('File not found');
    }
    stream.destroy();
  });

  req.on('error', () => {
    res.statusCode = 500;
    res.end('Server error');
    stream.destroy();
  });


  switch (req.method) {
    case 'GET':
      stream.pipe(res);
      stream.on('end', () => {
        res.end();
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
