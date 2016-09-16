# node-metrics
metrics for node+express application

[![NPM](https://nodei.co/npm/express-node-metrics.png)](https://nodei.co/npm/express-node-metrics/)

[![NPM](https://nodei.co/npm-dl/express-node-metrics.png?height=3)](https://nodei.co/npm/express-node-metrics/)

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![MIT License][license-image]][license-url]


## Install
```bash
npm install --save express-node-metrics
```

## API


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

```

### Expose Endpoint With all the metrics
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

## License

[MIT][license-url]


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