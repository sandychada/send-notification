'use strict';

const AWS = require('aws-sdk');
const accountSid = 'AC4fecc83fda6cb66926627cb17976717c';
const authToken = '2e39783a652e8a5dc04a6db2fdeb7875';
const client = require('twilio')(accountSid, authToken);

//creating and using tables in dynamodb
const dynamoDb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
var ddb = new AWS.DynamoDB({apiVersion: "2012-08-10"});

const sendNotification = (event, context, callback) => {
    console.log("event is" + JSON.stringify(event));
    const requestBody = event.body;
    // Generates the Model for esign from requestBody
    let esignInfo = generateEsignInfo(requestBody, context);
    // Validates the inputs
    validateRequest(esignInfo, callback);
    esignInfo.otpCodeSent = generateOTP();
    saveNotification(esignInfo)
        .then(res => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Successfully submitted ESIGN Request for Member with memberId ${esignInfo.memberID}`,
                    esignReferenceId: res.eSignReferenceID
                })
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Unable to submit ESIGN Request for Member with memberId ${esignInfo.memberID}`
                })
            })
        });
    // send Notification depending on notificationType
    const message = "Dear Customer, The OTP is " + esignInfo.otpCodeSent + ". NEVER SHARE IT WITH ANYONE."
    sendSMS(esignInfo, message);
};

const verifyOTP = (event, context, callback) => {
    console.log("event is" + JSON.stringify(event));
    const requestBody = event.body;
    validateOTPVerifyRequest(requestBody, callback);

    let esignInfo = verifyNotification(requestBody.memberID, requestBody.otpCodeSent);
    console.log(esignInfo);
};

const validateRequest = (esignInfo, callback) => {
    if (typeof esignInfo.eSignType !== 'string' || typeof esignInfo.processID !== 'string' || typeof esignInfo.memberID !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t submit notification because of validation errors.'));
        return;
    }
};

const saveNotification = esignRecord => {
    console.log('Saving esignRecord');
    const esignInfo = {
        TableName: process.env.ESIGN_TABLE,
        Item: esignRecord,
    };
    return dynamoDb.put(esignInfo).promise()
        .then(res => esignInfo);
};

const generateEsignInfo = (esignRequest, context) => {
    const timestamp = new Date().getTime();
    return {
        eSignReferenceID: context.awsRequestId,
        processID: esignRequest.processID,
        processType: esignRequest.processType,
        memberID: esignRequest.memberID,
        sentTimeStamp: esignRequest.sentTimeStamp,
        expireTimeStamp: esignRequest.expireTimeStamp,
        otpCodeSent: esignRequest.otpCodeSent,
        otpCodeCaptured: esignRequest.otpCodeCaptured,
        eSignType: esignRequest.eSignType,
        toPhone: esignRequest.toPhone,
        toEmail: esignRequest.toEmail,
        alfrescoDocumentID: esignRequest.alfrescoDocumentID,
        eSignedTimeStamp: timestamp,
        updatedAt: timestamp,
    };
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);

};

const sendVoice =(phoneNumber,link)=>{
    client.calls
        .create({
            record:true,
            url:link ,
            to: phoneNumber,
            from: '+12244326419'
        })
        .then(call => console.log(JSON.stringify(call)))
        .done();
    return 'Your message has been delivered successfully!';
}

const sendSMS = (esignInfo, message) => {
    client.messages.create({
        body: message,
        from: '+12244326419',
        to: esignInfo.toPhone
    })
        .then((message) => {
            console.log(message.sid);
        });
};

function validateOTPVerifyRequest(esignInfo, callback) {
    if (typeof esignInfo.memberID !== 'string' || typeof esignInfo.otpCodeSent !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t submit notification because of validation errors.'));
        return;
    }
}

async function verifyNotification(memberID, otpCodeCaptured) {

    let params = {
        TableName: process.env.ESIGN_TABLE,
        FilterExpression: " memberID  = :memberId",
        ExpressionAttributeValues: {
            ":memberId": memberID
        }
    };

    // ddb.scan = function (params, param2) {
    //
    // }
    // function onScan(err, data) {
    //     if (err) {
    //         console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //         // print all the Products
    //         console.log("Scan succeeded.");
    //         res.status(200).json(data)
    //     }
    // }

    ddb.scan(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
            data.Items.forEach(function (element, index, array) {
                console.log(
                    "printing",
                    element.memberId + " (" + element.otpCodeCaptured + ")"
                );
            });
        }

    });
}
    module.exports.sendVoice = sendVoice;
    module.exports.verifyOTP = verifyOTP;
    module.exports.sendNotification = sendNotification;