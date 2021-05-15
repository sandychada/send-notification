'use strict';

const esign = require('./esign');

module.exports.submit = (event, context, callback) => {
    console.log("Starting to send Notification")
   var message = esign.sendVoice(event.body.toPhone, event.body.link);

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: message,
    };

    callback(null, response);
};