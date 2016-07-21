/* global describe: false, beforeEach: false, afterEach: false, it: false */
/* eslint-disable no-unused-expressions, no-invalid-this */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let randomMessage = require('../lib/random-message');
let fs = require('fs');

chai.config.includeStack = true;

describe('random-message tests', () => {

    describe('#split', () => {
        it('should split an mbox file', done => {
            randomMessage.split(__dirname + '/fixtures/test.mbox', __dirname + '/destdata', (err, messages) => {
                expect(err).to.not.exist;
                expect(messages).to.equal(3);

                fs.readdir(__dirname + '/destdata', (err, list) => {
                    expect(err).to.not.exist;
                    expect(list.indexOf('2010-11')).to.be.gte(0);
                    fs.readdir(__dirname + '/destdata/2010-11', (err, list) => {
                        expect(err).to.not.exist;
                        expect(list.length).to.be.gte(3);
                        done();
                    });
                });
            });
        });
    });

    describe('#get', () => {
        it('should get a random message', done => {
            let message = randomMessage.get(__dirname + '/fixtures/parsed');
            let chunks = [];
            message.on('data', chunk => {
                chunks.push(chunk);
            });
            message.on('end', () => {
                let data = Buffer.concat(chunks).toString();
                // all test messages look the same
                expect(data.match(/^>+From /mg).length).to.eq(2);
                expect(data.match(/^From /mg).length).to.eq(1);
                expect(data.match(/^>From /mg).length).to.eq(1);
                expect(data.match(/^>>From /mg).length).to.eq(1);
                done();
            });
        });

        it('should get the same message', done => {
            let message1 = randomMessage.get(__dirname + '/fixtures/parsed', 'abc');
            let chunks1 = [];
            message1.on('data', chunk => {
                chunks1.push(chunk);
            });
            message1.on('end', () => {
                let msg1 = Buffer.concat(chunks1).toString();
                let message2 = randomMessage.get(__dirname + '/fixtures/parsed', 'abc');
                let chunks2 = [];
                message2.on('data', chunk => {
                    chunks2.push(chunk);
                });
                message2.on('end', () => {
                    let msg2 = Buffer.concat(chunks2).toString();
                    expect(msg1).to.equal(msg2);
                    done();
                });
            });
        });
    });
});
