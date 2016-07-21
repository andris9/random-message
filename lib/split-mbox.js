'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (input, destination, callback) => {
    let mbox = fs.createReadStream(input);
    let index = 0;
    let returned = false;
    let remainder = '';
    let curstream;
    let processing = false;
    let lastLine = '';
    let lines = [];

    let genFilename = date => (date.getTime() * 0x1000 + (++index & 0xfff)) + '.eml'; //eslint-disable-line no-bitwise

    let createNext = (date, next) => {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let folder = path.join(destination, year + '-' + (month < 10 ? '0' : '') + month);
        mkdirp(folder, err => {
            if (err) {
                mbox = null;
                return callback(err);
            }
            let filename = genFilename(date);
            curstream = fs.createWriteStream(path.join(folder, filename));
            processing = false;
            next();
        });
        return false;
    };

    let processChunk = (chunk, readNext) => {
        if (chunk) {
            lines = (remainder + chunk.toString('binary')).split(/\r?\n/);
            remainder = lines.pop();
        }

        for (let i = 0, len = lines.length; i < len; i++) {
            let line = lines[i];
            // next message!
            if (!lastLine && line.substr(0, 5) === 'From ') {
                if (curstream) {
                    curstream.end();
                    curstream = false;
                }
                let parts = line.split(/\s+/);
                parts.shift(); // From
                parts.shift(); // address
                lines.splice(0, i + 1);
                processing = true;
                lastLine = line;
                return createNext(new Date(parts.join(' ')), () => processChunk(null, readNext));
            } else if (line.charAt(0) === '>' && /^>+From /.test(line)) {
                line = line.substr(1); // remove first >
            }

            if (curstream) {
                curstream.write(Buffer.from(line + '\r\n', 'binary'));
            }

            lastLine = line;
        }

        if (!chunk) {
            readNext();
        }

        return true;
    };

    let readNext = () => {
        let chunk;
        if (processing) {
            return;
        }
        while ((chunk = mbox.read()) !== null) {
            if (!processChunk(chunk, readNext)) {
                processing = true;
                break;
            }
        }
    };

    mbox.on('readable', readNext);

    mbox.on('error', err => {
        if (returned) {
            return;
        }
        returned = true;
        callback(err);
    });

    mbox.on('end', () => {
        if (curstream) {
            curstream.end(remainder ? Buffer.from(remainder, 'binary') : Buffer.alloc(0));
            curstream = false;
        }
        callback(null, index);
    });
};
