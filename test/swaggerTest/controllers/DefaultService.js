'use strict';

exports.helloGET = function(args, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end('hello world');
}

exports.helloUserGET = function(args, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end('hello world');
}

