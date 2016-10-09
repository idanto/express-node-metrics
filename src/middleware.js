'use strict';
var metrics = require('./metrics');

/**
 * middleware for express in order to add start time and decorate the end method
 * at the end it will add the data to the metrics
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
module.exports = function (req, res, next) {
    req.startTime = new Date();
    metrics.incrementCustomMetric("process.run.activeRequests");
    // decorate response#end method from express
    var end = res.end;
    res.end = function () {
        var responseTime = new Date() - req.startTime

        res.setHeader('X-Response-Time', responseTime + 'ms');

        // call to original express#res.end()
        end.apply(res, arguments);

        if (!req.originalUrl.includes('metrics')) {
            var route = req.baseUrl
            if (req.swagger) {
                route = req.swagger.apiPath;
            } else if (req.route) {
                route = route + req.route.path;
            }

            var apiData = {
                route: route,
                method: req.method,
                status: res.statusCode,
                time: responseTime
            }
            
            metrics.addApiData(apiData);
        }

        metrics.decrementCustomMetric("process.run.activeRequests");
    };

    next();
};