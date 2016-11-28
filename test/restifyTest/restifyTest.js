'use strict';

var restify = require("restify");
var request = require('request');
var expect = require('chai').expect;
var sinon = require('sinon');
var metricsMiddleware = require("../../index").middleware;
var metrics = require('../../index').metrics;
var serverPort = 3002;

var server = restify.createServer({
    name: 'Hello World'
});
server.use(metricsMiddleware);
server.use(restify.queryParser({ mapParams: true }));
server.use(restify.bodyParser({ mapParams: true }));
server.get('/hello/:user', function (req, res, next) {
    res.send('hello world');
});
server.get('/hello', function (req, res, next) {
    res.send('hello world');
});

server.listen(serverPort, function () {
    console.log('%s listening at %s', server.name, server.url);
});


describe('test middleware for restify framework', function () {
    before(function (done) {
        server.listen(serverPort, function () {
            console.log('%s listening at %s', server.name, server.url);
            done();
        });
    });


    after(function () {
        server.close();
    });

    describe('test path without variables', function () {
        var addApiDataSpy;
        before(function (done) {
            addApiDataSpy = sinon.spy(metrics, "addApiData");

            request('http://localhost:3002/hello', function (error, response, body) {
                if (error) {
                    throw error;
                }
                done();
            })
        });

        it("should call addApiData with the right route", function () {
            expect(addApiDataSpy.calledOnce).to.be.true;
            let actualArg = addApiDataSpy.lastCall.args[0];
            expect(actualArg.route).to.equal('/hello');
            expect(actualArg.method).to.equal('GET');
            expect(actualArg.status).to.equal(200);
        });

        after(function () {
            addApiDataSpy.restore();
        });
    });

    describe('test path with variables', function () {
        var addApiDataSpy;
        before(function (done) {
            addApiDataSpy = sinon.spy(metrics, "addApiData");

            request('http://localhost:3002/hello/username', function (error, response, body) {
                if (error) {
                    throw error;
                }
                done();
            })
        });

        it("should call addApiData with the right route", function () {
            expect(addApiDataSpy.calledOnce).to.be.true;
            let actualArg = addApiDataSpy.lastCall.args[0];
            expect(actualArg.route).to.equal('/hello/:user');
            expect(actualArg.method).to.equal('GET');
            expect(actualArg.status).to.equal(200);
        });

        after(function () {
            addApiDataSpy.restore();
            server.close();
        });
    });
});
