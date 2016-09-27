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
    // decorate response#end method from express
    var end = res.end;
    res.end = function () {
        var responseTime = new Date() - req.startTime

        res.setHeader('X-Response-Time', responseTime + 'ms');

        // call to original express#res.end()
        end.apply(res, arguments);

        var route = req.baseUrl
        if(req.route) {
            route = route + req.route.path;
        }

        if (!req.originalUrl.includes('metrics')) {
            metrics.addApiData({
                route: route,
                method: req.method,
                status: res.statusCode,
                time: responseTime
            });
        }
    };

    next();
}