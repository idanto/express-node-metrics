'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.helloGET = function helloGET (req, res, next) {
  Default.helloGET(req.swagger.params, res, next);
};

module.exports.helloUserGET = function helloUserGET (req, res, next) {
  Default.helloUserGET(req.swagger.params, res, next);
};
