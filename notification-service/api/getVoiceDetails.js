'use strict';

const VoiceResponse = require('twilio').twiml.VoiceResponse;

module.exports.submit = (event, context, callback) => {
    const twiml = new VoiceResponse();
    twiml.say('Hello. This is Victory Capital.');
    const gather = twiml.gather( finishOnKey="1", timeout="5"  );
    gather.say({ voice: 'Polly.Raveena'},'Please press 1 to confirm');
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: twiml.toString(),
    };

    callback(null, response);
};