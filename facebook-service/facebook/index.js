'use strict';

const verify = require('./verify');
const message = require('./message');
const { getSession } = require('../../shared/database');
const { parseS3Event } = require('../../shared/helpers');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports.handler = (event, context, callback) => {
  if (event.httpMethod === 'GET') {
    return callback(null, verify(event));
  } else if (event.httpMethod === 'POST') {
    return message.receiveEntries(JSON.parse(event.body).entry || [])
      .then(() => callback(null, {
        statusCode: 200,
        body: JSON.stringify({ status: 'ok' }),
      }))
      .catch((error) => callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error }),
      }));
  } else if (event.Records && event.Records[0] && event.Records[0].Sns) {
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const {
      id,
      bucket,
      key,
    } = parseS3Event(snsMessage.Records[0].s3);

    return s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise()
      .then((metadataObject) => {
        const metadata = JSON.parse(metadataObject.Body.toString());
        return getSession(id)
          .then(({ Item }) => {
            const { sender } = Item;
            return message.sendGif(sender, { gif: metadata.url })
              .then(() => {
                const text =
                  metadata.labels
                    .map((label) => label.Name)
                    .join(', ');
                return message.sendMessage(sender, { text });
              });
          });
      })
      .then(() => callback(null, 'ok'));
  }

  return callback(null,
    { statusCode: 404, body: JSON.stringify({ error: 'Invalid request.' }) });
};
