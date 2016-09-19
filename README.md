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
  - [express_node_metrics](#express_node_metrics)
  - [express_node_metrics.middleware](#express_node_metricsmiddleware)
  - [express_node_metrics.metrics](#express_node_metricsmetrics)
  - [express_node_metrics.metrics.getAll(reset)](#express_node_metricsmetricsgetallreset)
    - [Arguments](#arguments)
    - [Returned function arguments](#returned-function-arguments)
  - [express_node_metrics.metrics.processMetrics(reset)](#express_node_metricsmetricsprocessmetricsreset)
    - [Arguments](#arguments-1)
    - [Returned function arguments](#returned-function-arguments-1)
  - [express_node_metrics.metrics.apiMetrics(reset)](#express_node_metricsmetricsapimetricsreset)
    - [Arguments](#arguments-2)
    - [Returned function arguments](#returned-function-arguments-2)
  - [express_node_metrics.metrics.internalMetrics(reset)](#express_node_metricsmetricsinternalmetricsreset)
    - [Arguments](#arguments-3)
    - [Returned function arguments](#returned-function-arguments-3)
  - [express_node_metrics.metrics.addApiData(info, err)](#express_node_metricsmetricsaddapidatainfo-err)
  - [express_node_metrics.metrics.logInternalMetric(info, err)](#express_node_metricsmetricsloginternalmetricinfo-err)
    - [Arguments](#arguments-4)
- [Examples](#examples)
  - [Middleware](#middleware)
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

This middleware adds start time to the request, and decorate the end method of express with a new one.
At the new end method it add 'X-Response-Time' to the response and the response time to the API metrics using [metrics.addApiData](#express_node_metricsmetricsaddapidatainfo-err) method

### express_node_metrics.metrics
Include all the method that collects and retrieves the metrics data.

### express_node_metrics.metrics.getAll(reset)
Retrieve all the logged metrics by now.

When execute with reset equals `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset all the metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; an Object representing all of the aggregated metrics. It usually build from three different sections: process, API and internal metrics.

### express_node_metrics.metrics.processMetrics(reset)

Retrieve the process metrics.
The process metrics include:
* Memory usage - using [node v4 process object] (https://nodejs.org/dist/latest-v4.x/docs/api/process.html#process_process_memoryusage) and [memwatch-next package] (https://www.npmjs.com/package/memwatch-next)
* CPU usage - using [pidusage package] (https://www.npmjs.com/package/pidusage) 
* GC - using [gc-stats package] (https://www.npmjs.com/package/gc-stats) 
* Event loop latency - using [event-loop-stats package] (https://www.npmjs.com/package/event-loop-stats)

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the process metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; an Object representing the process metrics as describe above.
examlpe:
```json
{  
   "cpu":{  
      "usage":10.220903395976991
   },
   "memory":{  
      "usage":{  
         "rss":107847680,
         "heapTotal":83625840,
         "heapUsed":60391624
      }
   },
   "eventLoop":{  
      "latency":{  
         "min":0,
         "max":23,
         "num":6242,
         "sum":1581
      }
   },
   "gc":{  
      "time":{  
         "meter":{  
            "mean":0.010381926827711163,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.0035681005137041095,
            "5MinuteRate":0.0024489296340649987,
            "15MinuteRate":0.0010025873653551841
         },
         "histogram":{  
            "min":1,
            "max":1,
            "sum":1,
            "variance":null,
            "mean":1,
            "stddev":0,
            "count":1,
            "median":1,
            "p75":1,
            "p95":1,
            "p99":1,
            "p999":1
         }
      },
      "releasedMem":{  
         "meter":{  
            "mean":0.010382177399303055,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.0035681005137041095,
            "5MinuteRate":0.0024489296340649987,
            "15MinuteRate":0.0010025873653551841
         },
         "histogram":{  
            "min":-1606976,
            "max":-1606976,
            "sum":-1606976,
            "variance":null,
            "mean":-1606976,
            "stddev":0,
            "count":1,
            "median":-1606976,
            "p75":-1606976,
            "p95":-1606976,
            "p99":-1606976,
            "p999":-1606976
         }
      }
   }
}
```

### express_node_metrics.metrics.apiMetrics(reset)


When execute with `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the API metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; an Object representing the API metrics that was aggregated by now.
examlpe:
```json
```

### express_node_metrics.metrics.internalMetrics(reset)

Retrieve all the internal metrics that was aggregate untill the execution point.

When execute with `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the internal metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page.
Examlpe:
```json
   "kafka":{  
      "global":{  
         "all":{  
            "meter":{  
               "mean":0.011275864297885328,
               "count":1,
               "currentRate":0,
               "1MinuteRate":0.004215212696015611,
               "5MinuteRate":0.002531936381998388,
               "15MinuteRate":0.001013789342932559
            },
            "histogram":{  
               "min":38,
               "max":38,
               "sum":38,
               "variance":null,
               "mean":38,
               "stddev":0,
               "count":1,
               "median":38,
               "p75":38,
               "p95":38,
               "p99":38,
               "p999":38
            }
         }
      },
      "statuses":{  
         "success":{  
            "meter":{  
               "mean":0.011275889368290304,
               "count":1,
               "currentRate":0,
               "1MinuteRate":0.004215212696015611,
               "5MinuteRate":0.002531936381998388,
               "15MinuteRate":0.001013789342932559
            },
            "histogram":{  
               "min":38,
               "max":38,
               "sum":38,
               "variance":null,
               "mean":38,
               "stddev":0,
               "count":1,
               "median":38,
               "p75":38,
               "p95":38,
               "p99":38,
               "p999":38
            }
         }
      },
      "methods":{  
         "auditRequest":{  
            "meter":{  
               "mean":0.011275899122149878,
               "count":1,
               "currentRate":0,
               "1MinuteRate":0.004215212696015611,
               "5MinuteRate":0.002531936381998388,
               "15MinuteRate":0.001013789342932559
            },
            "histogram":{  
               "min":38,
               "max":38,
               "sum":38,
               "variance":null,
               "mean":38,
               "stddev":0,
               "count":1,
               "median":38,
               "p75":38,
               "p95":38,
               "p99":38,
               "p999":38
            }
         },
         "auditResponse":{  
            "meter":{  
               "mean":0.011280750820217424,
               "count":1,
               "currentRate":0,
               "1MinuteRate":0.004215212696015611,
               "5MinuteRate":0.002531936381998388,
               "15MinuteRate":0.001013789342932559
            },
            "histogram":{  
               "min":9,
               "max":9,
               "sum":9,
               "variance":null,
               "mean":9,
               "stddev":0,
               "count":1,
               "median":9,
               "p75":9,
               "p95":9,
               "p99":9,
               "p999":9
            }
         }
      }
   }
```
### express_node_metrics.metrics.addApiData(info)

Aggregate date using the `info` object in four different sections:
1. *global* - all the northbound API response times aggregated in one place.
2. *statuses* - The northbound API response time aggregate by http statuses (`info.status` - implemented in the middleware using `res.statusCode`);
3. *methods* - The northbound API response time aggregate by http methods (`info.method` - implemented in the middleware using `req.method`)
4. *endpoints* - The northbound API response time aggregate by http statuses (`info.route` - implemented in the middleware using `req.baseUrl + req.route.path`)

each and every one of the sections is [Timer metric] (https://www.npmjs.com/package/measured#timers)

#### Arguments

* `info` (**required**) &ndash; the info object that include all the information that needed to aggregate the data.
    * `status` - 
    * `method` - 
    * `route` - 
    * `time` - 

### express_node_metrics.metrics.logInternalMetric(info, err)

Aggregate date using the `info` object. The aggregation is done by `info.source` three different sections:
1. *global* - all the data that related to the same source in one place.
2. *statuses* - the data that related to the same source split to `success` and `fail` execution.
3. *methods* - the data that related to the same source split by `info.method`.

each and every one of the sections is [Timer metric] (https://www.npmjs.com/package/measured#timers)

When executed with `err`, it will aggregate the info as `failed` execution in the `statuses` section.

#### Arguments

* `info` (**required**) &ndash; the request object returned from Express middleware invocation
    * `source` - 
    * `methodName` - 
    * `startTime` - 
* `err` &ndash; error if happened during the execution of the measured method.

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