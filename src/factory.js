'use strict';
var measured = require('measured');

module.exports.createMetric = function (name, func) {
    switch (name.toLowerCase()) {
        case "timer":
            {
                return new measured.Timer();
            }
        case "counter":
            {
                return new measured.Counter();
            }
        case "meter":
        {
            return new measured.Meter();
        }
        case "gauge":
            if (func) {
                return new measured.Gauge(func);
            }
        default:
            return null;
    }
}