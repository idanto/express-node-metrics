'use strict';

var app = require('./index');
var request = require('request');
var expect = require('chai').expect;
var sinon = require('sinon');
var metrics = require('../../index').metrics;

describe('test middleware for swagger-express framework', function () {
    describe('test path without variables', function () {
        var addApiDataSpy;
        before(function (done) {
            addApiDataSpy = sinon.spy(metrics, "addApiData");

            request('http://localhost:3001/hello', function (error, response, body) {
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

            request('http://localhost:3001/hello/username', function (error, response, body) {
                if (error) {
                    throw error;
                }
                done();
            })
        });

        it("should call addApiData with the right route", function () {
            expect(addApiDataSpy.calledOnce).to.be.true;
            let actualArg = addApiDataSpy.lastCall.args[0];
            expect(actualArg.route).to.equal('/hello/{user}');
            expect(actualArg.method).to.equal('GET');
            expect(actualArg.status).to.equal(200);
        });

        after(function () {
            addApiDataSpy.restore();
        });
    });
});
