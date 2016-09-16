# node-metrics
metrics for node+express application

[![NPM](https://nodei.co/npm/express-node-metrics.png)](https://nodei.co/npm/express-node-metrics/)

[![NPM](https://nodei.co/npm-dl/express-node-metrics.png?height=3)](https://nodei.co/npm/express-node-metrics/)

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![MIT License][license-image]][license-url]

# Table of Contents 
<!-- generated with [DocToc](https://github.com/thlorenz/doctoc) -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Features](#features)
- [Install](#install)
- [API](#api)
  - [Middleware](#middleware)
  - [Metrics](#metrics)
- [Examples](#examples)
  - [Middleware](#middleware-1)
  - [Internal metrics](#internal-metrics)
  - [Expose endpoint with all the metrics](#expose-endpoint-with-all-the-metrics)
- [Running Tests](#running-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features
* Middleware for northbound API
* Node process metrics
* Infrastructure to collect internal metrics (like southbound APIs)
* API to retrieve the collected metrics and to reset them.

## Install
```bash
npm install --save express-node-metrics
```

## API
### express_node_metrics
```js
var express_node_metrics = require('express-node-metrics');
```
This creates a new instance of `express_node_metrics`.

### express_node_metrics.middleware

This middleware ....

### express_node_metrics.metrics
Include all the method that collects and retrieves the metrics data.

### express_node_metrics.metrics.getAll(reset)

When you use the `paginate` middleware, it injects a view helper function called `hasNextPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; if the function is executed, it returns a Boolean value (representing if the query has another page of results)

By default, the view helper `paginate.hasNextPages` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a Boolean when executed.

When executed with `req`, it will return a function that accepts two required arguments called `pageCount` and `resultsCount`.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset all the metrics

#### Returned function arguments

* `pageCount` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page

### express_node_metrics.metrics.processMetrics(reset)

When you use the `paginate` middleware, it injects a view helper function called `hasNextPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; if the function is executed, it returns a Boolean value (representing if the query has another page of results)

By default, the view helper `paginate.hasNextPages` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a Boolean when executed.

When executed with `req`, it will return a function that accepts two required arguments called `pageCount` and `resultsCount`.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the process metrics

#### Returned function arguments

* `pageCount` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page

### express_node_metrics.metrics.apiMetrics(reset)

When you use the `paginate` middleware, it injects a view helper function called `hasNextPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; if the function is executed, it returns a Boolean value (representing if the query has another page of results)

By default, the view helper `paginate.hasNextPages` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a Boolean when executed.

When executed with `req`, it will return a function that accepts two required arguments called `pageCount` and `resultsCount`.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the API metrics

#### Returned function arguments

* `pageCount` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page

### express_node_metrics.metrics.internalMetrics(reset)

When you use the `paginate` middleware, it injects a view helper function called `hasNextPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; if the function is executed, it returns a Boolean value (representing if the query has another page of results)

By default, the view helper `paginate.hasNextPages` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a Boolean when executed.

When executed with `req`, it will return a function that accepts two required arguments called `pageCount` and `resultsCount`.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the internal metrics

#### Returned function arguments

* `object` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page

### express_node_metrics.metrics.logInternalMetric(info, err)

When you use the `paginate` middleware, it injects a view helper function called `hasNextPages` as `res.locals.hasPreviousPages`, which you can use in your views for generating pagination `<a>`'s or `<button>`'s &ndash; if the function is executed, it returns a Boolean value (representing if the query has another page of results)

By default, the view helper `paginate.hasNextPages` is already executed with the inherited `req` variable, therefore it becomes a function capable of returning a Boolean when executed.

When executed with `req`, it will return a function that accepts two required arguments called `pageCount` and `resultsCount`.

#### Arguments

* `info` (**required**) &ndash; the request object returned from Express middleware invocation
* `err` &ndash; the request object returned from Express middleware invocation

## Examples
### Middleware
```js
var metricsMiddleware = require('express-node-metrics').middleware;
app.use(metricsMiddleware);

app.get('/users', function(req, res, next) {
    //Do Something
})
app.listen(3000);
```

### Internal metrics
```js
var middleware = require('express-node-metrics').metrics;
var stackTrace = require('stack-trace');
var kafka = require('../helpers/kafkaHelper');
var kafka_topic = process.env.KAFKA_TOPIC || "Sandbox_Apps_Storage_Audit";

function auditResponse(message, next) {
    var methodName = stackTrace.get()[0].getFunctionName();
    var startTime = Date.now();

    kafka.getResponseProducer().send([{
        topic: "kafka_topic",
        messages: message,
        partition: 0 // default 0 
    }], function (err, result) {
        metrics.logInternalMetric({ source: "kafka", startTime: startTime, methodName: methodName }, err);
        return next();
    });
}
```

### Expose endpoint with all the metrics
```js
'use strict'
var express = require("express");
var router = express.Router();
var metrics = require('express-node-metrics').metrics;

router.get('/', function (req, res) {
    res.send(metrics.getAll(req.query.reset));
});
router.get('/process', function (req, res) {
    res.send(metrics.processMetrics(req.query.reset));
});
router.get('/internal', function (req, res) {
    res.send(metrics.internalMetrics(req.query.reset));
});
router.get('/api', function (req, res) {
    res.send(metrics.apiMetrics(req.query.reset));
});

module.exports = router;
```

## Running Tests
Using mocha, istanbul and mochawesome
```bash
npm test
```

[npm-image]: https://img.shields.io/npm/v/express-node-metrics.svg?style=flat
[npm-url]: https://npmjs.org/package/express-node-metrics
[travis-image]: https://travis-ci.org/idanto/node-metrics.svg?branch=master
[travis-url]: https://travis-ci.org/idanto/node-metrics
[coveralls-image]: https://coveralls.io/repos/github/idanto/node-metrics/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/idanto/node-metrics?branch=master
[downloads-image]: http://img.shields.io/npm/dm/express-node-metrics.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-node-metrics
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE