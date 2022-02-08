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

  if (nestingLvl !== 0 && nestingLvl > 1) {
    res.statusCode = 400;
    res.end('Subfolders not supported');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File doesn`t exists');
          } else {
            res.statusCode = 500;
            res.end('Server error');
          }
          return;
        }

        res.end();
      })
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
