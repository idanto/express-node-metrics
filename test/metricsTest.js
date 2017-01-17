'use strict';
var sinon = require("sinon");
var sleep = require("sleep");
var clock = sinon.useFakeTimers();
var should = require('chai').should();
var rewire = require("rewire");
var metricsModel = rewire("../src/metrics");

describe('metrics tests', function () {
    var result;
    after(function () {
        clock.restore();
    });
    describe('getAll', function () {
        before(function () {
            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.logInternalMetric({
                source: 'otherSource',
                methodName: 'otherMethodName',
                startTime: new Date()
            }, new Error());

            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "200",
                time: 10
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "200",
                time: 10
            });

            metricsModel.addCustomGaugeMetric("customNamespace1.customCategory1.customMetricName1", 1);
            metricsModel.addCustomGaugeMetric("customNamespace1.customCategory1.customMetricName2", 2);
            metricsModel.addCustomGaugeMetric("customNamespace1.customCategory2.customMetricName1", 3);
            metricsModel.addCustomGaugeMetric("customNamespace2.customCategory1.customMetricName1", 4);
            metricsModel.addCustomGaugeMetric("customNamespace1.customCategory1.customMetricName1", 5);
            metricsModel.addCustomGaugeMetric("customNamespace1.customCategory1.functionMetric", function () { return process.geteuid() });
            
            metricsModel.incrementCustomMetric("customNamespace1.customCategory1.metricToIncrement");
            metricsModel.incrementCustomMetric("customNamespace1.customCategory1.metricToIncrement");
            metricsModel.incrementCustomMetric("customNamespace1.customCategory1.metricToIncrement");

            metricsModel.addCustomMeterMetric("customNamespace3.customCategory1.customMeter");
            metricsModel.addCustomMeterMetric("customNamespace3.customCategory1.customMeter");

            metricsModel.__get__("memwatch").emit("leak", { test1: 1, test2: 2 });
        });
        describe('without reset', function () {
            before(function () {
                clock.tick(60000);
                result = metricsModel.getAll();
                result = JSON.parse(result);
            });

            it('should have process metrics', function () {
                result.should.have.property("process");

                result.should.have.deep.property('process.memory');
                result.should.have.deep.property('process.eventLoop');
                result.should.have.deep.property('process.cpu');

                result.should.have.deep.property('process.memory.usage');
                result.should.have.deep.property('process.memory.leak');
                result.should.have.deep.property('process.eventLoop.latency');
            });

            it('should have intenral metrics', function () {
                result.should.have.property("internalMetrics");

                result.should.have.deep.property("internalMetrics.source");
                result.should.have.deep.property("internalMetrics.source.global");
                result.should.have.deep.property("internalMetrics.source.methods");
                result.should.have.deep.property("internalMetrics.source.statuses");

                result.should.have.deep.property("internalMetrics.otherSource");
                result.should.have.deep.property("internalMetrics.otherSource.global");
                result.should.have.deep.property("internalMetrics.otherSource.methods");
                result.should.have.deep.property("internalMetrics.otherSource.statuses");

                result.should.have.deep.property("internalMetrics.source.global.all");
                result.should.have.deep.property("internalMetrics.source.methods.methodName");
                result.should.have.deep.property("internalMetrics.source.statuses.success");

                result.should.have.deep.property("internalMetrics.otherSource.global.all");
                result.should.have.deep.property("internalMetrics.otherSource.statuses.failure");
                result.should.have.deep.property("internalMetrics.otherSource.methods.otherMethodName");
            });

            it('should have api metrics', function () {
                result.should.have.property("apiMetrics");

                result.should.have.deep.property("apiMetrics.global");
                result.should.have.deep.property("apiMetrics.statuses");
                result.should.have.deep.property("apiMetrics.methods");
                result.should.have.deep.property("apiMetrics.endpoints");

                result.should.have.deep.property("apiMetrics.global.all");
                result.should.have.deep.property("apiMetrics.statuses.200");
                result.should.have.deep.property("apiMetrics.methods.GET");
                result.should.have.deep.property("apiMetrics.endpoints./v1/applications/testApp|get");
            });

            it('should aggregate metrics', function () {
                result.apiMetrics.global.all.meter.count.should.equal(2)
                result.apiMetrics.methods.GET.meter.count.should.equal(2);
                result.apiMetrics.endpoints['/v1/applications/testApp|get'].meter.count.should.equal(2);
                result.apiMetrics.statuses['200'].meter.count.should.equal(2);
                result.internalMetrics.otherSource.global.all.meter.count.should.equal(1);
                result.internalMetrics.otherSource.methods.otherMethodName.meter.count.should.equal(1);
                result.internalMetrics.otherSource.statuses.failure.meter.count.should.equal(1);
                result.internalMetrics.source.statuses.success.meter.count.should.equal(2);
                result.internalMetrics.source.global.all.meter.count.should.equal(2);
                result.internalMetrics.source.methods.methodName.meter.count.should.equal(2);
            });

            it('should have endpoint per statusCode metrics', function () {
                result.endpoints['/v1/applications/testApp|get']['200'].meter.count.should.equal(2);
                result.should.have.deep.property("endpoints./v1/applications/testApp|get.lastResponseTime");
            });

            it('should have custom metrics', function () {
                result.should.have.property("customNamespace1");
                result.should.have.property("customNamespace2");
                result.should.have.property("customNamespace3");

                result.should.have.deep.property("customNamespace1.customCategory1.customMetricName1");
                result.should.have.deep.property("customNamespace1.customCategory1.customMetricName2");
                result.should.have.deep.property("customNamespace1.customCategory2.customMetricName1");
                result.should.have.deep.property("customNamespace2.customCategory1.customMetricName1");
                result.should.have.deep.property("customNamespace1.customCategory1.metricToIncrement");
                result.should.have.deep.property("customNamespace1.customCategory1.functionMetric");
                result.should.have.deep.property("customNamespace3.customCategory1.customMeter");

                result.customNamespace1.customCategory1.customMetricName1.should.equal(5);
                result.customNamespace1.customCategory1.customMetricName2.should.equal(2);
                result.customNamespace1.customCategory2.customMetricName1.should.equal(3);
                result.customNamespace2.customCategory1.customMetricName1.should.equal(4);
                result.customNamespace1.customCategory1.metricToIncrement.should.equal(3);
                result.customNamespace1.customCategory1.functionMetric.should.equal(process.geteuid());
                result.customNamespace3.customCategory1.customMeter.count.should.equal(2);
            });

        });


        describe('decrement custom metrics', function () {
            before(function () {
                metricsModel.decrementCustomMetric("customNamespace1.customCategory1.metricToIncrement");
                metricsModel.decrementCustomMetric("customNamespace1.customCategory1.metricToIncrement");
                clock.tick(60000);
                result = metricsModel.getAll();
                result = JSON.parse(result);
            });

            it('should have custom metrics', function () {
                result.should.have.property("customNamespace1");
                result.should.have.property("customNamespace2");
                result.should.have.property("customNamespace3");

                result.should.have.deep.property("customNamespace1.customCategory1.customMetricName1");
                result.should.have.deep.property("customNamespace1.customCategory1.customMetricName2");
                result.should.have.deep.property("customNamespace1.customCategory2.customMetricName1");
                result.should.have.deep.property("customNamespace2.customCategory1.customMetricName1");
                result.should.have.deep.property("customNamespace1.customCategory1.metricToIncrement");

                result.customNamespace1.customCategory1.customMetricName1.should.equal(5);
                result.customNamespace1.customCategory1.customMetricName2.should.equal(2);
                result.customNamespace1.customCategory2.customMetricName1.should.equal(3);
                result.customNamespace2.customCategory1.customMetricName1.should.equal(4);
                result.customNamespace1.customCategory1.metricToIncrement.should.equal(1);
                result.customNamespace3.customCategory1.customMeter.count.should.equal(2);

            });
        })

        describe('with reset', function () {
            var resultBeforeReset, resultAfterReset;
            before(function () {
                resultBeforeReset = metricsModel.getAll(true);
                clock.tick(60000);
                resultAfterReset = metricsModel.getAll(false);
                resultBeforeReset = JSON.parse(resultBeforeReset);
                resultAfterReset = JSON.parse(resultAfterReset);
            });
            it('resultBeforeReset and resultAfterReset should not equal', function () {
                resultAfterReset.should.not.deep.equal(resultBeforeReset);
            })
            it('should have process metrics', function () {
                resultAfterReset.should.have.property("process");

                resultAfterReset.should.have.deep.property('process.memory');
                resultAfterReset.should.have.deep.property('process.eventLoop');
                resultAfterReset.should.have.deep.property('process.cpu');

                resultAfterReset.should.have.deep.property('process.memory.usage');
                resultAfterReset.should.have.deep.property('process.eventLoop.latency');
                // result.should.have.deep.property('process.cpu.usage');
            });
            it('should not have intenral metrics', function () {
                resultAfterReset.should.not.have.property("internalMetrics");

                resultAfterReset.should.not.have.deep.property("internalMetrics.source");
                resultAfterReset.should.not.have.deep.property("internalMetrics.source.global");
                resultAfterReset.should.not.have.deep.property("internalMetrics.source.methods");
                resultAfterReset.should.not.have.deep.property("internalMetrics.source.statuses");

                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource");
                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource.global");
                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource.methods");
                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource.statuses");

                resultAfterReset.should.not.have.deep.property("internalMetrics.source.global.all");
                resultAfterReset.should.not.have.deep.property("internalMetrics.source.methods.methodName");
                resultAfterReset.should.not.have.deep.property("internalMetrics.source.statuses.success");

                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource.global.all");
                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource.statuses.failure");
                resultAfterReset.should.not.have.deep.property("internalMetrics.otherSource.methods.otherMethodName");
            });
            it('should not have api metrics', function () {
                resultAfterReset.should.not.have.property("apiMetrics");

                resultAfterReset.should.not.have.deep.property("apiMetrics.global");
                resultAfterReset.should.not.have.deep.property("apiMetrics.statuses");
                resultAfterReset.should.not.have.deep.property("apiMetrics.methods");
                resultAfterReset.should.not.have.deep.property("apiMetrics.endpoints");

                resultAfterReset.should.not.have.deep.property("apiMetrics.global.all");
                resultAfterReset.should.not.have.deep.property("apiMetrics.statuses.200");
                resultAfterReset.should.not.have.deep.property("apiMetrics.methods.GET");
                resultAfterReset.should.not.have.deep.property("apiMetrics.endpoints./v1/applications/testApp|get");
            });

            it('should not have endpoint per statusCode metrics', function () {
                resultAfterReset.should.not.have.property("endpoints");
                resultAfterReset.should.not.have.deep.property("endpoints./v1/applications/testApp|get");
                resultAfterReset.should.not.have.deep.property("endpoints./v1/applications/testApp|get.lastResponseTime");
                resultAfterReset.should.not.have.deep.property("endpoints./v1/applications/testApp|get.200");
            });

            it('should not have custom metrics', function () {
                resultAfterReset.should.not.have.property("customNamespace1");
                resultAfterReset.should.not.have.property("customNamespace2");
                resultAfterReset.should.not.have.property("customNamespace3");
                resultAfterReset.should.not.have.deep.property("customNamespace1.customCategory1.customMetricName1");
                resultAfterReset.should.not.have.deep.property("customNamespace1.customCategory1.customMetricName2");
                resultAfterReset.should.not.have.deep.property("customNamespace1.customCategory2.customMetricName1");
                resultAfterReset.should.not.have.deep.property("customNamespace2.customCategory1.customMetricName1");
                resultAfterReset.should.not.have.deep.property("customNamespace1.customCategory1.metricToIncrement");
                resultAfterReset.should.not.have.deep.property("customNamespace3.customCategory1.customMeter");
            });
        });
    });

    describe('get process metrics', function () {
        before(function () {
            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.logInternalMetric({
                source: 'otherSource',
                methodName: 'otherMethodName',
                startTime: new Date()
            }, new Error());

            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "200",
                time: 10
            });

            metricsModel.__get__("gc").emit("stats", {
                pauseMS: 100,
                diff: { usedHeapSize: 1000 }
            });
        });
        describe('without reset', function () {
            before(function () {
                clock.tick(60000);
                result = metricsModel.processMetrics(false);
                result = JSON.parse(result);
            });

            it('should have process metrics', function () {
                result.should.have.property('memory');
                result.should.have.property('eventLoop');
                result.should.have.property('cpu');
                result.should.have.property('gc');

                result.should.have.deep.property('memory.usage');
                result.should.have.deep.property('eventLoop.latency');
                result.should.have.deep.property('cpu.usage');
                result.should.have.deep.property('gc.lastRun');
                result.should.have.deep.property('gc.time');
                result.should.have.deep.property('gc.releasedMem');
            });

            it('should not have intenral metrics', function () {
                result.should.not.have.property("internalMetrics");

                result.should.not.have.deep.property("internalMetrics.source");
                result.should.not.have.deep.property("internalMetrics.source.global");
                result.should.not.have.deep.property("internalMetrics.source.methods");
                result.should.not.have.deep.property("internalMetrics.source.statuses");

                result.should.not.have.deep.property("internalMetrics.otherSource");
                result.should.not.have.deep.property("internalMetrics.otherSource.global");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses");

                result.should.not.have.deep.property("internalMetrics.source.global.all");
                result.should.not.have.deep.property("internalMetrics.source.methods.methodName");
                result.should.not.have.deep.property("internalMetrics.source.statuses.success");

                result.should.not.have.deep.property("internalMetrics.otherSource.global.all");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses.failure");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods.otherMethodName");
            });

            it('should not have api metrics', function () {
                result.should.not.have.property("apiMetrics");

                result.should.not.have.deep.property("apiMetrics.global");
                result.should.not.have.deep.property("apiMetrics.statuses");
                result.should.not.have.deep.property("apiMetrics.methods");
                result.should.not.have.deep.property("apiMetrics.endpoints");

                result.should.not.have.deep.property("apiMetrics.global.all");
                result.should.not.have.deep.property("apiMetrics.statuses.200");
                result.should.not.have.deep.property("apiMetrics.methods.GET");
                result.should.not.have.deep.property("apiMetrics.endpoints./v1/applications/testApp|get");
            });

            it('should not have endpoint per statusCode metrics', function () {
                result.should.not.have.property("endpoints");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get.lastResponseTime");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get.200");
            });
        });
        describe('with reset', function () {
            var resultBeforeReset, resultAfterReset;
            before(function () {
                resultBeforeReset = metricsModel.processMetrics(true);
                clock.tick(60000);
                resultAfterReset = metricsModel.processMetrics(false);
                resultBeforeReset = JSON.parse(resultBeforeReset);
                resultAfterReset = JSON.parse(resultAfterReset);
            });

            it('should have process metrics', function () {
                result.should.have.property('memory');
                result.should.have.property('eventLoop');
                result.should.have.property('cpu');
                result.should.have.property('gc');

                result.should.have.deep.property('memory.usage');
                result.should.have.deep.property('eventLoop.latency');
                result.should.have.deep.property('cpu.usage');

                result.should.have.deep.property('gc.lastRun');
                result.should.have.deep.property('gc.time');
                result.should.have.deep.property('gc.releasedMem');
            });
            it('should not have intenral metrics', function () {
                result.should.not.have.property("internalMetrics");

                result.should.not.have.deep.property("internalMetrics.source");
                result.should.not.have.deep.property("internalMetrics.source.global");
                result.should.not.have.deep.property("internalMetrics.source.methods");
                result.should.not.have.deep.property("internalMetrics.source.statuses");

                result.should.not.have.deep.property("internalMetrics.otherSource");
                result.should.not.have.deep.property("internalMetrics.otherSource.global");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses");

                result.should.not.have.deep.property("internalMetrics.source.global.all");
                result.should.not.have.deep.property("internalMetrics.source.methods.methodName");
                result.should.not.have.deep.property("internalMetrics.source.statuses.success");

                result.should.not.have.deep.property("internalMetrics.otherSource.global.all");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses.failure");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods.otherMethodName");
            });
            it('should not have api metrics', function () {
                result.should.not.have.property("apiMetrics");

                result.should.not.have.deep.property("apiMetrics.global");
                result.should.not.have.deep.property("apiMetrics.statuses");
                result.should.not.have.deep.property("apiMetrics.methods");
                result.should.not.have.deep.property("apiMetrics.endpoints");

                result.should.not.have.deep.property("apiMetrics.global.all");
                result.should.not.have.deep.property("apiMetrics.statuses.200");
                result.should.not.have.deep.property("apiMetrics.methods.GET");
                result.should.not.have.deep.property("apiMetrics.endpoints./v1/applications/testApp|get");
            });

            it('should not have endpoint per statusCode metrics', function () {
                result.should.not.have.property("endpoints");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get.lastResponseTime");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get.200");
            });
        });
    });

    describe('get internal metrics', function () {
        before(function () {
            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.logInternalMetric({
                source: 'otherSource',
                methodName: 'otherMethodName',
                startTime: new Date()
            }, new Error());

            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "200",
                time: 10
            });
        });
        describe('without reset', function () {
            before(function () {
                result = metricsModel.internalMetrics(false);
                result = JSON.parse(result);
            });

            it('should not have process metrics', function () {
                result.should.not.have.property("process");

                result.should.not.have.deep.property('process.memory');
                result.should.not.have.deep.property('process.eventLoop');
                result.should.not.have.deep.property('process.cpu');

                result.should.not.have.deep.property('process.memory.usage');
                result.should.not.have.deep.property('process.eventLoop.latency');
                result.should.not.have.deep.property('process.cpu.usage');

                result.should.not.have.deep.property('process.gc');
                result.should.not.have.deep.property('process.gc.lastRun');
                result.should.not.have.deep.property('process.gc.time');
                result.should.not.have.deep.property('process.gc.releasedMem');


            });

            it('should have intenral metrics', function () {
                result.should.have.property("source");
                result.should.have.deep.property("source.global");
                result.should.have.deep.property("source.methods");
                result.should.have.deep.property("source.statuses");

                result.should.have.property("otherSource");
                result.should.have.deep.property("otherSource.global");
                result.should.have.deep.property("otherSource.methods");
                result.should.have.deep.property("otherSource.statuses");

                result.should.have.deep.property("source.global.all");
                result.should.have.deep.property("source.methods.methodName");
                result.should.have.deep.property("source.statuses.success");

                result.should.have.deep.property("otherSource.global.all");
                result.should.have.deep.property("otherSource.statuses.failure");
                result.should.have.deep.property("otherSource.methods.otherMethodName");
            });

            it('should not have api metrics', function () {
                result.should.not.have.property("apiMetrics");

                result.should.not.have.deep.property("apiMetrics.global");
                result.should.not.have.deep.property("apiMetrics.statuses");
                result.should.not.have.deep.property("apiMetrics.methods");
                result.should.not.have.deep.property("apiMetrics.endpoints");

                result.should.not.have.deep.property("apiMetrics.global.all");
                result.should.not.have.deep.property("apiMetrics.statuses.200");
                result.should.not.have.deep.property("apiMetrics.methods.GET");
                result.should.not.have.deep.property("apiMetrics.endpoints./v1/applications/testApp|get");
            });

            it('should not have endpoint per statusCode metrics', function () {
                result.should.not.have.property("endpoints");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get.lastResponseTime");
                result.should.not.have.deep.property("endpoints./v1/applications/testApp|get.200");
            });
        });
        describe('with reset', function () {
            var resultBeforeReset, resultAfterReset;

            before(function () {
                resultBeforeReset = metricsModel.internalMetrics(true);
                resultAfterReset = metricsModel.internalMetrics(false);
                resultBeforeReset = JSON.parse(resultBeforeReset);
            });
            it('resultAfterReset should be empty', function () {
                should.not.exist(resultAfterReset);
            });
            it('resultBeforeReset should not be empty', function () {
                should.exist(resultBeforeReset);
            });
        });
    });

    describe('get api metrics', function () {
        before(function () {
            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.logInternalMetric({
                source: 'otherSource',
                methodName: 'otherMethodName',
                startTime: new Date()
            }, new Error());

            metricsModel.logInternalMetric({
                source: 'source',
                methodName: 'methodName',
                startTime: new Date()
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "200",
                time: 10
            });
        });
        describe('without reset', function () {
            before(function () {
                result = metricsModel.apiMetrics(false);
                result = JSON.parse(result);
            });

            it('should not have process metrics', function () {
                result.should.not.have.property("process");

                result.should.not.have.deep.property('process.memory');
                result.should.not.have.deep.property('process.eventLoop');
                result.should.not.have.deep.property('process.cpu');

                result.should.not.have.deep.property('process.memory.usage');
                result.should.not.have.deep.property('process.eventLoop.latency');
                result.should.not.have.deep.property('process.cpu.usage');

                result.should.not.have.deep.property('process.gc');
                result.should.not.have.deep.property('process.gc.lastRun');
                result.should.not.have.deep.property('process.gc.time');
                result.should.not.have.deep.property('process.gc.releasedMem');
            });

            it('should not have intenral metrics', function () {
                result.should.not.have.property("internalMetrics");

                result.should.not.have.deep.property("internalMetrics.source");
                result.should.not.have.deep.property("internalMetrics.source.global");
                result.should.not.have.deep.property("internalMetrics.source.methods");
                result.should.not.have.deep.property("internalMetrics.source.statuses");

                result.should.not.have.deep.property("internalMetrics.otherSource");
                result.should.not.have.deep.property("internalMetrics.otherSource.global");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses");

                result.should.not.have.deep.property("internalMetrics.source.global.all");
                result.should.not.have.deep.property("internalMetrics.source.methods.methodName");
                result.should.not.have.deep.property("internalMetrics.source.statuses.success");

                result.should.not.have.deep.property("internalMetrics.otherSource.global.all");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses.failure");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods.otherMethodName");
            });

            it('should have api metrics', function () {
                result.should.have.property("global");
                result.should.have.property("statuses");
                result.should.have.property("methods");
                result.should.have.property("endpoints");

                result.should.have.deep.property("global.all");
                result.should.have.deep.property("statuses.200");
                result.should.have.deep.property("methods.GET");
                result.should.have.deep.property("endpoints./v1/applications/testApp|get");
            });
        });
        describe('with reset', function () {
            var resultBeforeReset, resultAfterReset;
            before(function () {
                resultBeforeReset = metricsModel.apiMetrics(true);
                resultAfterReset = metricsModel.apiMetrics(false);
                resultBeforeReset = JSON.parse(resultBeforeReset);
            });
            it('resultAfterReset should be empty', function () {
                should.not.exist(resultAfterReset);
            });
            it('resultBeforeReset should not be empty', function () {
                should.exist(resultBeforeReset);
            });
        });
    });




    describe('get endpoints metrics', function () {
        before(function () {
            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "200",
                time: 20
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "GET",
                status: "400",
                time: 10
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "POST",
                status: "200",
                time: 10
            });

            metricsModel.addApiData({
                route: "/v1/applications/testApp",
                method: "POST",
                status: "200",
                time: 50
            });

        });
        describe('without reset', function () {
            before(function () {
                result = metricsModel.endPointMetrics(false);
                result = JSON.parse(result);
            });

            it('should not have process metrics', function () {
                result.should.not.have.property("process");

                result.should.not.have.deep.property('process.memory');
                result.should.not.have.deep.property('process.eventLoop');
                result.should.not.have.deep.property('process.cpu');

                result.should.not.have.deep.property('process.memory.usage');
                result.should.not.have.deep.property('process.eventLoop.latency');
                result.should.not.have.deep.property('process.cpu.usage');

                result.should.not.have.deep.property('process.gc');
                result.should.not.have.deep.property('process.gc.lastRun');
                result.should.not.have.deep.property('process.gc.time');
                result.should.not.have.deep.property('process.gc.releasedMem');
            });

            it('should not have internal metrics', function () {
                result.should.not.have.property("internalMetrics");

                result.should.not.have.deep.property("internalMetrics.source");
                result.should.not.have.deep.property("internalMetrics.source.global");
                result.should.not.have.deep.property("internalMetrics.source.methods");
                result.should.not.have.deep.property("internalMetrics.source.statuses");

                result.should.not.have.deep.property("internalMetrics.otherSource");
                result.should.not.have.deep.property("internalMetrics.otherSource.global");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses");

                result.should.not.have.deep.property("internalMetrics.source.global.all");
                result.should.not.have.deep.property("internalMetrics.source.methods.methodName");
                result.should.not.have.deep.property("internalMetrics.source.statuses.success");

                result.should.not.have.deep.property("internalMetrics.otherSource.global.all");
                result.should.not.have.deep.property("internalMetrics.otherSource.statuses.failure");
                result.should.not.have.deep.property("internalMetrics.otherSource.methods.otherMethodName");
            });

            it('should have api metrics', function () {

                result.should.have.property("\/v1\/applications\/testApp|post");
                result.should.have.property("\/v1\/applications\/testApp|get");

                result.should.have.deep.property("\/v1\/applications\/testApp|post.200");
                result.should.have.deep.property("\/v1\/applications\/testApp|get.200");
                result.should.have.deep.property("\/v1\/applications\/testApp|get.400");
                result.should.have.deep.property("\/v1\/applications\/testApp|post.lastResponseTime");
                result.should.have.deep.property("\/v1\/applications\/testApp|get.lastResponseTime");
                result['\/v1\/applications\/testApp|get'].lastResponseTime.should.equal(10);
                result['\/v1\/applications\/testApp|post'].lastResponseTime.should.equal(50);
            });
        });
        describe('with reset', function () {
            var resultBeforeReset, resultAfterReset;
            before(function () {
                resultBeforeReset = metricsModel.endPointMetrics(true);
                resultAfterReset = metricsModel.endPointMetrics(false);
                resultBeforeReset = JSON.parse(resultBeforeReset);
            });
            it('resultAfterReset should be empty', function () {
                should.not.exist(resultAfterReset);
            });
            it('resultBeforeReset should not be empty', function () {
                should.exist(resultBeforeReset);
            });
        });
    });
});