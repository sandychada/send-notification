'use strict';

const esign = require('./esign');

module.exports.submit = (event, context, callback) => {
    console.log("Starting to send Notification")
    esign.sendNotification(event, context, callback);

};