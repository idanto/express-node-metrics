'use strict';
var sinon = require("sinon");
var should = require('chai').should();
var measured = require('measured');
var factory = require("../src/factory");

describe('Factory Tests', function () {
    describe('get timer type', function () {
        it('should return measured of type Timer', function () {
            //Act
            var metric = factory.createMetric("timer");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Timer);
        });
    });

    describe('get Timer type', function () {
        it('should return measured of type Timer', function () {
            //Act
            var metric = factory.createMetric("Timer");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Timer);
        });
    });

    describe('get TimEr type', function () {
        it('should return measured of type Timer', function () {
            //Act
            var metric = factory.createMetric("TimEr");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Timer);
        });
    });

    describe('get counter type', function () {
        it('should return measured of type Counter', function () {
            //Act
            var metric = factory.createMetric("counter");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Counter);
        });
    });

    describe('get Counter type', function () {
        it('should return measured of type Counter', function () {
            //Act
            var metric = factory.createMetric("Counter");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Counter);
        });
    });

    describe('get CounTer type', function () {
        it('should return measured of type Counter', function () {
            //Act
            var metric = factory.createMetric("CounTer");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Counter);
        });
    });

    describe('get gauge type', function () {
        it('should return measured of type Gauge', function () {
            //Act
            var metric = factory.createMetric("gauge", function() {});

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Gauge);
        });
    });

    describe('get Gauge type', function () {
        it('should return measured of type Gauge', function () {
            //Act
            var metric = factory.createMetric("Gauge", function() {});

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Gauge);
        });
    });

    describe('get GaUge type', function () {
        it('should return measured of type GaUge', function () {

        });
    });

    describe('get gauge type without function', function () {
        it('should return null', function () {
            //Act
            var metric = factory.createMetric("gauge");

            //Assert
            should.not.exist(metric);
        });
    });

    describe('get meter type', function () {
        it('should return measured of type Counter', function () {
            //Act
            var metric = factory.createMetric("meter");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Meter);
        });
    });

    describe('get Meter type', function () {
        it('should return measured of type Counter', function () {
            //Act
            var metric = factory.createMetric("Meter");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Meter);
        });
    });

    describe('get MetEr type', function () {
        it('should return measured of type Counter', function () {
            //Act
            var metric = factory.createMetric("MetEr");

            //Assert
            should.exist(metric);
            metric.should.be.an.instanceof(measured.Meter);
        });
    });

    describe('get notExists type', function () {
        it('should return null', function () {
            //Act
            var metric = factory.createMetric("notExists");

            //Assert
            should.not.exist(metric);
        });
    });
});
