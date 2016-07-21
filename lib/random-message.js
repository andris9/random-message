'use strict';

const fs = require('fs');
const pathlib = require('path');
const buffered = new Map();
const crypto = require('crypto');
const split = require('./split-mbox');

function readdir(folder, callback) {
    if (buffered.has(folder)) {
        return setImmediate(() => callback(null, buffered.get(folder)));
    }
    fs.readdir(folder, (err, list) => {
        if (err) {
            return callback(err);
        }
        buffered.set(folder, list);
        return callback(null, list);
    });
}

module.exports.split = split;

module.exports.get = function (rootdir, seed, callback) {
    if (!callback && typeof seed === 'function') {
        callback = seed;
        seed = null;
    }

    seed = seed || crypto.randomBytes(10);
    let hash = crypto.createHash('sha1').update(seed).digest('hex');
    let dirIndex = parseInt(hash.substr(0, 8), 16);
    let messageIndex = parseInt(hash.substr(-8), 16);

    readdir(rootdir, (err, list) => {
        if (err) {
            return callback(err);
        }

        list = list.filter(folder => /^\d{4}\-\d{2}$/.test(folder));
        let folder = list[dirIndex % list.length];

        readdir(pathlib.join(rootdir, folder), (err, list) => {
            if (err) {
                return callback(err);
            }
            list = list.filter(file => /\.eml$/.test(file));
            let message = list[messageIndex % list.length];
            callback(null, fs.createReadStream(pathlib.join(rootdir, folder, message)));
        });
    });
};
