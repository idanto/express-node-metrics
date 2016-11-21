'use strict';
var metrics = require('./metrics'),
    helper = require('./helper');

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

        try {
            res.setHeader('X-Response-Time', responseTime + 'ms');
        } catch(error){
            // This Try/Catch was added to handle error "Can't set headers after they are sent.” 
            // which is thrown when using Restify  
            // TODO: Log error
        }

        // call to original express#res.end()
        end.apply(res, arguments);

        if (!helper.shouldAddMetrics(req)){
            var route = helper.getRoute(req);

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