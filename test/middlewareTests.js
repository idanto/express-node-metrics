'use strict';
var sinon = require("sinon");
var should = require('chai').should();
var httpMocks = require('node-mocks-http');
var metrics = require("../src/middleware");
var clock;
var metricsModel = require("../src/metrics");
var sandbox;

describe('middleware tests', function () {

    before(function (done) {
        clock = sinon.useFakeTimers();
        done();
    });

    after(function (done) {
        clock.restore();
        done();
    });

    describe('gets regular request', function () {
        var res = httpMocks.createResponse();
        var end = sinon.spy();
        res.end = end;
        var req = httpMocks.createRequest({
            method: 'GET',
            url: '/user/42',
            params: {
                id: 42
            }
        });
        req.baseUrl = '/user';
        req.route = {};
        req.route.path = ':id';
        var metricsModelSpy, metricsModelIncrementCustomMetricSpy, metricsModelDecrementCustomMetricSpy;

        before(function () {
            sandbox = sinon.sandbox.create();
            metricsModelSpy = sandbox.spy(metricsModel, 'addApiData');
            metricsModelIncrementCustomMetricSpy = sandbox.spy(metricsModel, 'incrementCustomMetric');
            metricsModelDecrementCustomMetricSpy = sandbox.spy(metricsModel, 'decrementCustomMetric');
        });

        after(function () {
            sandbox.restore();
        });

        it('should return new end method to res', function (done) {
            metrics(req, res, function () {
                res.end.should.not.be.equal(end);
                done();
            })
        });

        it('should set start time to req', function (done) {
            should.exist(req.startTime);
            req.startTime.should.deep.equal(new Date());
            done();
        });

        it('number of active requests should be 1', function (done) {
            var currentMetrics = metricsModel.getAll();
            currentMetrics = JSON.parse(currentMetrics);
            currentMetrics.process.run.activeRequests.should.equal(1);
            done();
        });

        describe('test the end method of res', function () {
            before(function (done) {
                clock.tick(10);
                res.end();
                done();
            });

            it('should add X-Response-Time header', function (done) {
                should.exist(res.getHeader("X-Response-Time"));
                res.getHeader("X-Response-Time").should.equal("10ms");
                done();
            });

            it('should run the original end method', function (done) {
                end.calledOnce.should.be.true;
                done();
            });

            it('should add metrics data', function (done) {
                metricsModelSpy.calledOnce.should.be.true;
                let actualArg = metricsModelSpy.lastCall.args[0];
                let expectedArg = {
                    route: '/user:id',
                    method: 'GET',
                    status: 200,
                    time: 10
                }
                actualArg.should.eql(expectedArg);
                metricsModelIncrementCustomMetricSpy.calledOnce.should.be.true;
                metricsModelIncrementCustomMetricSpy.calledWith("process.run.activeRequests");
                metricsModelDecrementCustomMetricSpy.calledOnce.should.be.true;
                metricsModelDecrementCustomMetricSpy.calledWith("process.run.activeRequests");
                done();
            });

            it('number of active requests should be 0', function (done) {
                var currentMetrics = metricsModel.getAll();
                currentMetrics = JSON.parse(currentMetrics);
                currentMetrics.process.run.activeRequests.should.equal(0);
                done();
            });
        });
    });

    describe('gets metrics request', function () {
        var res = httpMocks.createResponse();
        var end = sinon.spy();
        res.end = end;
        var req = httpMocks.createRequest({
            method: 'GET',
            url: '/metrics/42',
            params: {
            }
        });
        req.baseUrl = '/metrics';
        req.route = {};
        req.route.path = ':id';
        var metricsModelSpy, metricsModelIncrementCustomMetricSpy, metricsModelDecrementCustomMetricSpy;

        before(function () {
            sandbox = sinon.sandbox.create();
            metricsModelSpy = sandbox.spy(metricsModel, 'addApiData');
            metricsModelIncrementCustomMetricSpy = sandbox.spy(metricsModel, 'incrementCustomMetric');
            metricsModelDecrementCustomMetricSpy = sandbox.spy(metricsModel, 'decrementCustomMetric');
        });

        after(function () {
            sandbox.restore();
        });

        it('should return new end method to res', function (done) {
            metrics(req, res, function () {
                res.end.should.not.be.equal(end);
                done();
            })
        });

        it('should set start time to req', function (done) {
            should.exist(req.startTime);
            req.startTime.should.deep.equal(new Date());
            done();
        });

        it('number of active requests should be 1', function (done) {
            var currentMetrics = metricsModel.getAll();
            currentMetrics = JSON.parse(currentMetrics);
            currentMetrics.process.run.activeRequests.should.equal(1);
            done();
        });

        describe('test the end method of res', function () {

            before(function (done) {
                clock.tick(10);
                res.end();
                done();
            });

            it('should add X-Response-Time header', function (done) {
                should.exist(res.getHeader("X-Response-Time"));
                res.getHeader("X-Response-Time").should.equal("10ms");
                done();
            });

            it('should run the original end method', function (done) {
                end.calledOnce.should.be.true;
                done();
            });

            it('should add metrics data', function (done) {
                metricsModelSpy.calledOnce.should.be.false;
                metricsModelIncrementCustomMetricSpy.calledOnce.should.be.true;
                metricsModelIncrementCustomMetricSpy.calledWith("process.run.activeRequests");
                metricsModelDecrementCustomMetricSpy.calledOnce.should.be.true;
                metricsModelDecrementCustomMetricSpy.calledWith("process.run.activeRequests");
                done();
            });

            it('number of active requests should be 0', function (done) {
                var currentMetrics = metricsModel.getAll();
                currentMetrics = JSON.parse(currentMetrics);
                currentMetrics.process.run.activeRequests.should.equal(0);
                done();
            });
        });
    });

    describe('gets request without route', function () {
        var res = httpMocks.createResponse();
        var end = sinon.spy();
        res.end = end;
        var req = httpMocks.createRequest({
            method: 'GET',
            url: '/user/42',
            params: {
                id: 42
            }
        });
        req.baseUrl = '/user';
        var metricsModelSpy, metricsModelIncrementCustomMetricSpy, metricsModelDecrementCustomMetricSpy;

        before(function () {
            sandbox = sinon.sandbox.create();
            metricsModelSpy = sandbox.spy(metricsModel, 'addApiData');
            metricsModelIncrementCustomMetricSpy = sandbox.spy(metricsModel, 'incrementCustomMetric');
            metricsModelDecrementCustomMetricSpy = sandbox.spy(metricsModel, 'decrementCustomMetric');
        });

        after(function () {
            sandbox.restore();
        });

        it('should return new end method to res', function (done) {
            metrics(req, res, function () {
                res.end.should.not.be.equal(end);
                done();
            })
        });

        it('should set start time to req', function (done) {
            should.exist(req.startTime);
            req.startTime.should.deep.equal(new Date());
            done();
        });

        it('number of active requests should be 1', function (done) {
            var currentMetrics = metricsModel.getAll();
            currentMetrics = JSON.parse(currentMetrics);
            currentMetrics.process.run.activeRequests.should.equal(1);
            done();
        });

        describe('test the end method of res', function () {
            before(function (done) {
                clock.tick(10);
                res.end();
                done();
            });

            it('should add X-Response-Time header', function (done) {
                should.exist(res.getHeader("X-Response-Time"));
                res.getHeader("X-Response-Time").should.equal("10ms");
                done();
            });

            it('should run the original end method', function (done) {
                end.calledOnce.should.be.true;
                done();
            });

            it('should add metrics data', function (done) {
                metricsModelSpy.calledOnce.should.be.true;
                let actualArg = metricsModelSpy.lastCall.args[0];
                let expectedArg = {
                    route: '/user',
                    method: 'GET',
                    status: 200,
                    time: 10
                }
                actualArg.should.eql(expectedArg);
                metricsModelIncrementCustomMetricSpy.calledOnce.should.be.true;
                metricsModelIncrementCustomMetricSpy.calledWith("process.run.activeRequests");
                metricsModelDecrementCustomMetricSpy.calledOnce.should.be.true;
                metricsModelDecrementCustomMetricSpy.calledWith("process.run.activeRequests");
                done();
            });

            it('number of active requests should be 0', function (done) {
                var currentMetrics = metricsModel.getAll();
                currentMetrics = JSON.parse(currentMetrics);
                currentMetrics.process.run.activeRequests.should.equal(0);
                done();
            });
        });
    })

    describe('gets swagger request', function () {
        var res = httpMocks.createResponse();
        var end = sinon.spy();
        res.end = end;
        var req = httpMocks.createRequest({
            method: 'GET',
            url: '/user/42',
            params: {
                id: 42
            }
        });
        req.baseUrl = '/user';
        req.swagger = {
            apiPath: '/user/{userId}'
        }
        var metricsModelSpy, metricsModelIncrementCustomMetricSpy, metricsModelDecrementCustomMetricSpy;

        before(function () {
            sandbox = sinon.sandbox.create();
            metricsModelSpy = sandbox.spy(metricsModel, 'addApiData');
            metricsModelIncrementCustomMetricSpy = sandbox.spy(metricsModel, 'incrementCustomMetric');
            metricsModelDecrementCustomMetricSpy = sandbox.spy(metricsModel, 'decrementCustomMetric');
        });

        after(function () {
            sandbox.restore();
        });

        it('should return new end method to res', function (done) {
            metrics(req, res, function () {
                res.end.should.not.be.equal(end);
                done();
            })
        });

        it('should set start time to req', function (done) {
            should.exist(req.startTime);
            req.startTime.should.deep.equal(new Date());
            done();
        });

        describe('test the end method of res', function () {
            before(function (done) {
                clock.tick(10);
                res.end();
                done();
            });

            it('should add X-Response-Time header', function (done) {
                should.exist(res.getHeader("X-Response-Time"));
                res.getHeader("X-Response-Time").should.equal("10ms");
                done();
            });

            it('should run the original end method', function (done) {
                end.calledOnce.should.be.true;
                done();
            });

            it('should add metrics data', function (done) {
                metricsModelSpy.calledOnce.should.be.true;
                let actualArg = metricsModelSpy.lastCall.args[0];
                let expectedArg = {
                    route: '/user/{userId}',
                    method: 'GET',
                    status: 200,
                    time: 10
                }
                actualArg.should.eql(expectedArg);
                done();
            });
        });
    });

   describe('gets restify request', function () {
        var res = httpMocks.createResponse();
        var end = sinon.spy();
        res.end = end;
        var req = httpMocks.createRequest({
            method: 'GET',
            url: '/user/42',
            params: {
                id: 42
            }
        });
        req.route = {
            path: '/user/{userId}'
        }
        req.originalUrl = undefined;
        var metricsModelSpy, metricsModelIncrementCustomMetricSpy, metricsModelDecrementCustomMetricSpy;

        before(function () {
            sandbox = sinon.sandbox.create();
            metricsModelSpy = sandbox.spy(metricsModel, 'addApiData');
            metricsModelIncrementCustomMetricSpy = sandbox.spy(metricsModel, 'incrementCustomMetric');
            metricsModelDecrementCustomMetricSpy = sandbox.spy(metricsModel, 'decrementCustomMetric');
        });

        after(function () {
            sandbox.restore();
        });

        it('should return new end method to res', function (done) {
            metrics(req, res, function () {
                res.end.should.not.be.equal(end);
                done();
            })
        });

        it('should set start time to req', function (done) {
            should.exist(req.startTime);
            req.startTime.should.deep.equal(new Date());
            done();
        });

        describe('test the end method of res', function () {
            before(function (done) {
                clock.tick(10);
                res.end();
                done();
            });

            it('should add X-Response-Time header', function (done) {
                should.exist(res.getHeader("X-Response-Time"));
                res.getHeader("X-Response-Time").should.equal("10ms");
                done();
            });

            it('should run the original end method', function (done) {
                end.calledOnce.should.be.true;
                done();
            });

            it('should add metrics data', function (done) {
                metricsModelSpy.calledOnce.should.be.true;
                let actualArg = metricsModelSpy.lastCall.args[0];
                let expectedArg = {
                    route: '/user/{userId}',
                    method: 'GET',
                    status: 200,
                    time: 10
                }
                actualArg.should.eql(expectedArg);
                done();
            });
        });
    });

});
