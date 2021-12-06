const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.endStr = '';
  }

  _transform(chunk, encoding, callback) {
    let str = chunk.toString('utf-8');
    if (this.endStr) {
      str = this.endStr + str;
    }
    const arr = str.split(os.EOL);
    if (!str.endsWith(os.EOL)) {
      const lastIndex = arr.length - 1;
      this.endStr = arr[lastIndex];
      arr.splice(lastIndex, 1);
    }
    for (const str of arr) {
      this.push(str);
    }
    callback();
  }

  _flush(callback) {
    this.push(this.endStr);
    callback();
  }
}

module.exports = LineSplitStream;
