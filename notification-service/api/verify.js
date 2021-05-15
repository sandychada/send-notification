'use strict';

const esign = require('./esign');

module.exports.submit = (event, context, callback) => {
    console.log("Starting to verify Notification")
    esign.verifyOTP(event, context, callback);
};