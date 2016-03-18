'use strict';

var Buffer = require('buffer').Buffer;

module.exports = BodyReader;

function BodyReader(incoming, opts, callback) {
    this.incoming = incoming;
    this.callback = callback;
    this.buffers = [];
    this.length = 0;
    this.maxBodySize = opts ? opts.maxBodySize : 0;
    this.returned = false;

    var self = this;

    this.bindOnAborted = bindOnAborted;
    function bindOnAborted() {
        self.onAborted();
    }

    this.bindOnClose = bindOnClose;
    function bindOnClose() {
        self.onClose();
    }

    this.bindOnReadable = bindOnReadable;
    function bindOnReadable() {
        self.onReadable();
    }

    this.bindOnEnd = bindOnEnd;
    function bindOnEnd() {
        self.onEnd();
    }

    this.bindOnError = bindOnError;
    function bindOnError(err) {
        self.onError(err);
    }
}

BodyReader.prototype.read = bodyReaderRead;
function bodyReaderRead() {
    var incoming = this.incoming;
    incoming.on('aborted', this.bindOnAborted);
    incoming.on('close', this.bindOnClose);
    incoming.on('readable', this.bindOnReadable);
    incoming.on('end', this.bindOnEnd);
    incoming.on('error', this.bindOnError);
}

BodyReader.prototype.done = bodyReaderDone;
function bodyReaderDone(err, result) {
    var callback = this.callback;
    this.teardown();

    if (err) {
        return callback(err);
    } else {
        return callback(null, result);
    }
}

BodyReader.prototype.onAborted = bodyReaderOnAborted;
function bodyReaderOnAborted() {
    if (this.returned) {
        return;
    }

    this.done(new Error('Incoming body sending was aborted'));
}

BodyReader.prototype.onReadable = bodyReaderOnReadable;
function bodyReaderOnReadable() {
    var incoming = this.incoming;
    var maxBodySize = this.maxBodySize;
    var buf = incoming.read();

    if (!buf) {
        return;
    }

    var length = (this.length += buf.length);

    if (this.returned) {
        return;
    } else if (maxBodySize > 0 && length > maxBodySize) {
        this.done(new Error('Body size is too big'));
    } else {
        this.buffers.push(buf);
    }
}

BodyReader.prototype.onEnd = bodyReaderOnEnd;
function bodyReaderOnEnd(err) {
    var buffers = this.buffers;
    var length = this.length;

    if (this.returned) {
        return;
    } else if (err) {
        this.done(err);
    } else {
        var result = Buffer.concat(buffers, length);
        this.done(null, result);
    }
}

BodyReader.prototype.onError = bodyReaderOnError;
function bodyReaderOnError(err) {
    if (!this.returned) {
        this.done(err || null);
    }
}

BodyReader.prototype.onClose = bodyReaderOnRequestClose;
function bodyReaderOnRequestClose(err) {
    if (!this.returned) {
        this.done(err || null);
    }
}

BodyReader.prototype.teardown = bodyReaderTeardown;
function bodyReaderTeardown() {
    var incoming = this.incoming;
    this.callback = null;
    this.buffers = [];
    this.length = 0;
    this.returned = true;

    incoming.removeListener('aborted', this.bindOnAborted);
    incoming.removeListener('close', this.bindOnClose);
    incoming.removeListener('readable', this.bindOnReadable);
    incoming.removeListener('end', this.bindOnEnd);
    incoming.removeListener('error', this.bindOnError);
}
