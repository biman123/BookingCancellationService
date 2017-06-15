'use strict';

var url = require('url');

var Default = require('./DefaultService');

module.exports.cancelFlightBooking = function cancelFlightBooking (req, res, next) {
  Default.cancelFlightBooking(req.swagger.params, res, next);
};
