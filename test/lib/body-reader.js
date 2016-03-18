'use strict';

module.exports = BodyReader;

function BodyReader(incoming, opts, callback) {
    this.incoming = incoming;
    this.callback = callback;
    this.buffers = [];
    this.length = 0;
    this.maxBodySize = opts ? opts.maxBodySize || 0;
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
    incoming.on('aborted', bindOnAborted);
    incoming.on('close', bindOnClose);
    incoming.on('readable', bindOnReadable);
    incoming.on('end', this.bindOnEnd);
    incoming.on('error', this.bindOnError);
}

BodyReader.prototype.done = bodyReaderDone;
function bodyReaderDone(err, result) {
    var callback = this.callback;

    if (err) {
        this.teardown();
        callback(err);
    } else {
        this.teardown();
        callback(null, result);
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
    var req = this.req;
    var maxBodySize = this.maxBodySize;
    var buf = req.read();
    var length = (this.length += buf.length);

    if (this.returned) {
        return;
    } else if (maxBodySize > 0 && length > maxBodySize) {
        this.done((new Error('Body size is too big'));
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
        this.done(err);
    }
}

BodyReader.prototype.onClose = bodyReaderOnRequestClose;
function bodyReaderClose() {
    if (!this.returned) {
        this.done(err);
    }
}

BodyReader.prototype.teardown = bodyReaderTeardown;
function bodyReaderTeardown() {
    var incoming = this.incoming;

    incoming.removeListener('aborted', this.bindOnAborted);
    incoming.removeListener('close', this.bindOnClose);
    incoming.removeListener('readable', this.bindOnReadable);
    incoming.removeListener('end', this.bindOnEnd);
    incoming.removeListener('error', this.bindOnError);
}
