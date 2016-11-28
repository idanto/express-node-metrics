'use strict';

var express = require("express");
var request = require('request');
var expect = require('chai').expect;
var sinon = require('sinon');
var metricsMiddleware = require("../../index").middleware;
var metrics = require('../../index').metrics;
var serverPort = 3000;

var app = express();
app.use(metricsMiddleware);
app.get('/hello/:user', function(req, res, next) {
    res.send('hello world');
});
app.get('/hello', function(req, res, next) {
    res.send('hello world');
});

describe('test middleware for express framework', function() {
    var server
    before(function(done) {
        server = app.listen(serverPort, function() {
            console.log('App listening on port ' + serverPort);
            done();
        });
    });

    after(function() {
        server.close();
    });

    describe('test path without variables', function() {
        var addApiDataSpy;
        before(function(done) {
            addApiDataSpy = sinon.spy(metrics, "addApiData");

            //request
            request('http://localhost:3000/hello', function(error, response, body) {
                if (error) {
                    throw error;
                }
                done();
            })
        });

        it("should call addApiData with the right route", function() {
            expect(addApiDataSpy.calledOnce).to.be.true;
            let actualArg = addApiDataSpy.lastCall.args[0];
            expect(actualArg.route).to.equal('/hello');
            expect(actualArg.method).to.equal('GET');
            expect(actualArg.status).to.equal(200);
        });

        after(function() {
            addApiDataSpy.restore();
        });
    });

    describe('test path with variables', function() {
        var addApiDataSpy;
        before(function(done) {
            addApiDataSpy = sinon.spy(metrics, "addApiData");

            //request
            request('http://localhost:3000/hello/username', function(error, response, body) {
                if (error) {
                    throw error;
                }
                done();
            })
        });

        it("should call addApiData with the right route", function() {
            expect(addApiDataSpy.calledOnce).to.be.true;
            let actualArg = addApiDataSpy.lastCall.args[0];
            expect(actualArg.route).to.equal('/hello/:user');
            expect(actualArg.method).to.equal('GET');
            expect(actualArg.status).to.equal(200);
        });

        after(function() {
            addApiDataSpy.restore();
        });
    });
});
