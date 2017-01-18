# express-node-metrics
[![NPM](https://nodei.co/npm/express-node-metrics.png)](https://nodei.co/npm/express-node-metrics/)

[![NPM](https://nodei.co/npm-dl/express-node-metrics.png?height=3)](https://nodei.co/npm/express-node-metrics/)

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![NSP Status](https://nodesecurity.io/orgs/zooz-test/projects/012e3ff9-f6a8-4eb2-86ef-4173af622196/badge)](https://nodesecurity.io/orgs/zooz-test/projects/012e3ff9-f6a8-4eb2-86ef-4173af622196)
[![MIT License][license-image]][license-url]

This package is a platform for collecting metrics of node and express application.

**Supports Restify framework from version 1.3.0 and above**
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
  - [express_node_metrics.metrics.endPointMetrics(reset)](#express_node_metricsmetricsendpointmetricsreset)
    - [Arguments](#arguments-4)
    - [Returned function arguments](#returned-function-arguments-4)
  - [express_node_metrics.metrics.logInternalMetric(info, err)](#express_node_metricsmetricsloginternalmetricinfo-err)
    - [Arguments](#arguments-5)
  - [express_node_metrics.metrics.addCustomGaugeMetric(metricName, metricValue)](#express_node_metricsmetricsaddcustomgaugemetricmetricname-metricvalue)
    - [Arguments](#arguments-6)
  - [express_node_metrics.metrics.incrementCustomMetric(metricName)](#express_node_metricsmetricsincrementcustommetricmetricname)
    - [Arguments](#arguments-7)
  - [express_node_metrics.metrics.decrementCustomMetric(metricName)](#express_node_metricsmetricsdecrementcustommetricmetricname)
    - [Arguments](#arguments-8)
  - [express_node_metrics.metrics.customMeterMetric(metricName)](#express_node_metricsmetricscustommetermetricmetricname)
    - [Arguments](#arguments-9)
- [How to Use With Docker](#how-to-use-with-docker)
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
In addition it increments a metric which counts the current active incoming requests which can be found under `process.run.activeRequests`

### express_node_metrics.metrics
Include all the method that collects and retrieves the metrics data.

### express_node_metrics.metrics.getAll(reset)
Retrieve all the logged metrics by now.

When execute with reset equals `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset all the metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; an Object representing all of the aggregated metrics. It usually build from the sections: process, api metrics, internal metrics, endpoints metrics and custom metrics if exist.

### express_node_metrics.metrics.processMetrics(reset)

Retrieve the process metrics.
The process metrics include:
* Memory usage - using [node v4 process object] (https://nodejs.org/dist/latest-v4.x/docs/api/process.html#process_process_memoryusage) and [memwatch-next package] (https://www.npmjs.com/package/memwatch-next)
* CPU usage - using [pidusage package] (https://www.npmjs.com/package/pidusage) 
* GC - using [gc-stats package] (https://www.npmjs.com/package/gc-stats) 
* Event loop latency - using [event-loop-stats package] (https://www.npmjs.com/package/event-loop-stats)
* Process usage - process uptime [process.uptime()] and number of current active incoming requests  

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the process metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; an Object representing the process metrics as describe above.
examlpe:
```json
{  "run" : {
       "uptime" : 1090,
       "activeRequests" : 1
  },
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
      "lastRun" : 0,
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

Retrieve all the API metrics that was aggregate until the execution point.ß

When execute with `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the API metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; an Object representing the API metrics that was aggregated by now.
examlpe:
```json
{  
   "global":{  
      "all":{  
         "meter":{  
            "mean":0.011279328252622596,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004215212696015611,
            "5MinuteRate":0.002531936381998388,
            "15MinuteRate":0.001013789342932559
         },
         "histogram":{  
            "min":65,
            "max":65,
            "sum":65,
            "variance":null,
            "mean":65,
            "stddev":0,
            "count":1,
            "median":65,
            "p75":65,
            "p95":65,
            "p99":65,
            "p999":65
         }
      }
   },
   "statuses":{  
      "200":{  
         "meter":{  
            "mean":0.011279345891387335,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004215212696015611,
            "5MinuteRate":0.002531936381998388,
            "15MinuteRate":0.001013789342932559
         },
         "histogram":{  
            "min":65,
            "max":65,
            "sum":65,
            "variance":null,
            "mean":65,
            "stddev":0,
            "count":1,
            "median":65,
            "p75":65,
            "p95":65,
            "p99":65,
            "p999":65
         }
      },
      "201":{  
         "meter":{  
            "mean":0.0126722535655588,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004979685410881516,
            "5MinuteRate":0.0026177566530753717,
            "15MinuteRate":0.001025116480975725
         },
         "histogram":{  
            "min":83,
            "max":83,
            "sum":83,
            "variance":null,
            "mean":83,
            "stddev":0,
            "count":1,
            "median":83,
            "p75":83,
            "p95":83,
            "p99":83,
            "p999":83
         }
      },
      "400":{  
         "meter":{  
            "mean":0.011391758628706297,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004215212696015611,
            "5MinuteRate":0.002531936381998388,
            "15MinuteRate":0.001013789342932559
         },
         "histogram":{  
            "min":6,
            "max":6,
            "sum":6,
            "variance":null,
            "mean":6,
            "stddev":0,
            "count":1,
            "median":6,
            "p75":6,
            "p95":6,
            "p99":6,
            "p999":6
         }
      }
   },
   "methods":{  
      "POST":{  
         "meter":{  
            "mean":0.011279259654897822,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004215212696015611,
            "5MinuteRate":0.002531936381998388,
            "15MinuteRate":0.001013789342932559
         },
         "histogram":{  
            "min":65,
            "max":65,
            "sum":65,
            "variance":null,
            "mean":65,
            "stddev":0,
            "count":1,
            "median":65,
            "p75":65,
            "p95":65,
            "p99":65,
            "p999":65
         }
      },
      "GET":{  
         "meter":{  
            "mean":0.014505734939935762,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.005882803212940022,
            "5MinuteRate":0.0027064858119822763,
            "15MinuteRate":0.0010365701779111729
         },
         "histogram":{  
            "min":17,
            "max":17,
            "sum":17,
            "variance":null,
            "mean":17,
            "stddev":0,
            "count":1,
            "median":17,
            "p75":17,
            "p95":17,
            "p99":17,
            "p999":17
         }
      },
      "PATCH":{  
         "meter":{  
            "mean":0.03726150471483867,
            "count":1,
            "currentRate":0.037261503188937346,
            "1MinuteRate":0.011458136074669108,
            "5MinuteRate":0.0030925140804589166,
            "15MinuteRate":0.001083679073650417
         },
         "histogram":{  
            "min":13,
            "max":13,
            "sum":13,
            "variance":null,
            "mean":13,
            "stddev":0,
            "count":1,
            "median":13,
            "p75":13,
            "p95":13,
            "p99":13,
            "p999":13
         }
      }
   },
   "endpoints":{  
      "/v1/applications/authenticate|post":{  
         "meter":{  
            "mean":0.01127925238596365,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004215212696015611,
            "5MinuteRate":0.002531936381998388,
            "15MinuteRate":0.001013789342932559
         },
         "histogram":{  
            "min":65,
            "max":65,
            "sum":65,
            "variance":null,
            "mean":65,
            "stddev":0,
            "count":1,
            "median":65,
            "p75":65,
            "p95":65,
            "p99":65,
            "p999":65
         }
      },
      "/authenticate|post":{  
         "meter":{  
            "mean":0.011360091853355533,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004215212696015611,
            "5MinuteRate":0.002531936381998388,
            "15MinuteRate":0.001013789342932559
         },
         "histogram":{  
            "min":22,
            "max":22,
            "sum":22,
            "variance":null,
            "mean":22,
            "stddev":0,
            "count":1,
            "median":22,
            "p75":22,
            "p95":22,
            "p99":22,
            "p999":22
         }
      },
      "/v1/applications/|post":{  
         "meter":{  
            "mean":0.012672079014021197,
            "count":1,
            "currentRate":0,
            "1MinuteRate":0.004979685410881516,
            "5MinuteRate":0.0026177566530753717,
            "15MinuteRate":0.001025116480975725
         },
         "histogram":{  
            "min":83,
            "max":83,
            "sum":83,
            "variance":null,
            "mean":83,
            "stddev":0,
            "count":1,
            "median":83,
            "p75":83,
            "p95":83,
            "p99":83,
            "p999":83
         }
      }
   }
}
```

### express_node_metrics.metrics.internalMetrics(reset)

Retrieve all the internal metrics that was aggregate until the execution point.

When execute with `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the internal metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page.
Example:
```json
{  
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

Aggregate date using the `info` object in four different sections under `apiMetrics`:
1. *global* - all the northbound API response times aggregated in one place.
2. *statuses* - The northbound API response time aggregate by http statuses (`info.status` - implemented in the middleware using `res.statusCode`);
3. *methods* - The northbound API response time aggregate by http methods (`info.method` - implemented in the middleware using `req.method`)
4. *endpoints* - The northbound API response time aggregate by route (`info.route` - implemented in the middleware using `req.baseUrl + req.route.path`)

each and every one of the sections is [Timer metric] (https://www.npmjs.com/package/measured#timers)

And additionally aggregate the northbound API response time as `endpoints metrics` in two different sections under `endpoints`:
1. <route&gt;.<method&gt;.<status code&gt; - The northbound API response time aggregate by route, method and status code
2. <route&gt;.<method&gt; - last response time for this endpoint


#### Arguments

* `info` (**required**) &ndash; the info object that include all the information that needed to aggregate the data.
    * `status` - The http status code of the response.
    * `method` - The http method of the request.
    * `route` - Full express route pattern.
    * `time` - Response time of the specific request.
     
     
### express_node_metrics.metrics.endPointMetrics(reset)

Retrieve all the endpoint metrics that was aggregate until the execution point.

When execute with `reset=true` after retrieving the metrics all the logged data will be reset.

#### Arguments

* `reset` &ndash; Boolean that indicates if to reset the internal metrics

#### Returned function arguments

* `metrics` (**required**) &ndash; a Number representing the total number of pages for the given query executed on the page.
Example:     
```json
{
  "\/v1\/applications\/testApp|post" : {
    "200" : {
      "meter" : {
        "mean" : 548.6962422190779,
        "15MinuteRate" : 0,
        "1MinuteRate" : 0,
        "count" : 2,
        "currentRate" : 549.281991325061,
        "5MinuteRate" : 0
      },
      "histogram" : {
        "mean" : 30,
        "p75" : 50,
        "count" : 2,
        "median" : 30,
        "p95" : 50,
        "max" : 50,
        "p999" : 50,
        "variance" : 800,
        "stddev" : 28.2842712474619,
        "p99" : 50,
        "sum" : 60,
        "min" : 10
      }
    },
    "lastResponseTime" : 50
  },
  "\/v1\/applications\/testApp|get" : {
    "200" : {
      "meter" : {
        "mean" : 60.44634944811282,
        "15MinuteRate" : 0.0009751209602447366,
        "1MinuteRate" : 0.002352236831272823,
        "count" : 4,
        "currentRate" : 60.44472174128836,
        "5MinuteRate" : 0.002253124031641734
      },
      "histogram" : {
        "mean" : 10,
        "p75" : 10,
        "count" : 4,
        "median" : 10,
        "p95" : 10,
        "max" : 10,
        "p999" : 10,
        "variance" : 0,
        "stddev" : 0,
        "p99" : 10,
        "sum" : 40,
        "min" : 10
      }
    },
    "400" : {
      "meter" : {
        "mean" : 196.4806772592497,
        "15MinuteRate" : 0,
        "1MinuteRate" : 0,
        "count" : 1,
        "currentRate" : 196.4981671192174,
        "5MinuteRate" : 0
      },
      "histogram" : {
        "mean" : 10,
        "p75" : 10,
        "count" : 1,
        "median" : 10,
        "p95" : 10,
        "max" : 10,
        "p999" : 10,
        "variance" : null,
        "stddev" : 0,
        "p99" : 10,
        "sum" : 10,
        "min" : 10
      }
    },
    "lastResponseTime" : 10
  }
}
```

### express_node_metrics.metrics.logInternalMetric(info, err)

Aggregate date using the `info` object. The aggregation is done by `info.source` three different sections:
1. *global* - all the data that related to the same source in one place.
2. *statuses* - the data that related to the same source split to `success` and `fail` execution.
3. *methods* - the data that related to the same source split by `info.method`.

each and every one of the sections is [Timer metric] (https://www.npmjs.com/package/measured#timers)

When executed with `err`, it will aggregate the info as `failed` execution in the `statuses` section.

#### Arguments

* `info` (**required**) &ndash; the request object returned from Express middleware invocation
    * `source` - The title for the metric data (for example southbound API destination).
    * `methodName` - The method name that is measured.
    * `startTime` - The start time of the measured method.
* `err` &ndash; error if happened during the execution of the measured method.



### express_node_metrics.metrics.addCustomGaugeMetric(metricName, metricValue)

This API allows to add custom metrics.
All custom metrics will be aggregated according to the passed structure.

#### Arguments

* `metricName` (**required**) &ndash; The metric name should be constructed with one of the following structures:
    * <namespace&gt;.<category&gt;.<name&gt; 
    * <namespace&gt;.<category&gt;.<sub category&gt;.<name&gt;
* `metricValue` (**required**) &ndash; can be one of: 
    * A numeric metric value - this can be used for example when updating a metric value on certain events
    * A function that returns a numeric value - this can be used when wanting to set a metric that should query a certain object to get the current value (for example process.uptime())


### express_node_metrics.metrics.incrementCustomMetric(metricName)

This API allows to increment custom metrics - for example count all incoming requests.
All custom metrics will be aggregated according to the passed structure.

#### Arguments

* `metricName` (**required**) &ndash; The metric name should be constructed with one of the following structures:
    * <namespace&gt;.<category&gt;.<name&gt; 
    * <namespace&gt;.<category&gt;.<sub category&gt;.<name&gt;
    
    
### express_node_metrics.metrics.decrementCustomMetric(metricName)

This API allows to decrement custom metrics - for example count all active incoming requests.
This API can only be called after first using the incrementCustomMetric API (minimum value can be 0).
All custom metrics will be aggregated according to the passed structure.

#### Arguments

* `metricName` (**required**) &ndash; The metric name should be constructed with one of the following structures:
    * <namespace&gt;.<category&gt;.<name&gt; 
    * <namespace&gt;.<category&gt;.<sub category&gt;.<name&gt;

### express_node_metrics.metrics.customMeterMetric(metricName)

This API allows to add a custom Meter metric - things that are measured as events / interval.

The structure is:
* mean: The average rate since the meter was started/ last reset.
* count: Count of values added to the meter since was started/ last reset.
* currentRate: The rate of the meter since the last reset.
* 1MinuteRate: The rate of the meter biased towards the last 1 minute.
* 5MinuteRate: The rate of the meter biased towards the last 5 minutes.
* 15MinuteRate: The rate of the meter biased towards the last 15 minutes.

#### Arguments

* `metricName` (**required**) &ndash; The metric name should be constructed with one of the following structures:
    * <namespace&gt;.<category&gt;.<name&gt;
    * <namespace&gt;.<category&gt;.<sub category&gt;.<name&gt;

## How to Use With Docker
In order to use the package inside docker you should add node-gyp installation before 'npm insall' command:
``` dockerfile
RUN apk update && \
    # Install node-gyp dependencies
    apk add --no-cache make gcc g++ python && \
    # npm install
    npm install --production --silent && \
    # Uninstall node-gyp dependencies
    apk del make gcc g++ python
``` 

If you want to use your own fork while you waiting to accept merge request you need to also add git installation commands:
```dockerfile
RUN apk update && \
    # Install git
    apk add --no-cache bash git openssh && \
    # Install node-gyp dependencies
    apk add --no-cache make gcc g++ python && \
    # npm install
    npm install --production --silent && \
    # Uninstall git
    apk del bash git openssh && \
    # Uninstall node-gyp dependencies
    apk del make gcc g++ python
```


## Examples
### Middleware
#### Express
```js
var metricsMiddleware = require('express-node-metrics').middleware;
app.use(metricsMiddleware);

app.get('/users', function(req, res, next) {
    //Do Something
})
app.listen(3000);
```

#### Swagger-Express
```js
// swaggerRouter configuration
var options = {
  controllers: './test/swaggerTest/controllers',
  useStubs: false
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./test/swaggerTest/api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  app.use(metricsMiddleware);

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });
});
```

#### Restify
```js
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
[travis-image]: https://travis-ci.org/idanto/express-node-metrics.svg?branch=master
[travis-url]: https://travis-ci.org/idanto/express-node-metrics
[coveralls-image]: https://coveralls.io/repos/github/idanto/express-node-metrics/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/idanto/express-node-metrics?branch=master
[downloads-image]: http://img.shields.io/npm/dm/express-node-metrics.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-node-metrics
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
