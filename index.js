'use strict';

const axios = require('axios');
const chalk = require('chalk');
const express = require('express');
const bodyParser = require('body-parser');
const { handleMessage, handlePostback } = require('./api');

const { VERIFY_TOKEN } = process.env;

const app = express().use(bodyParser.json()); // Creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {
  // Parse the request body from the POST
  const { body } = req;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(entry => {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      const event = entry.messaging[0];
      console.log(event);

      // Get the sender PSID
      const senderId = event.sender.id;
      console.log('Sender PSID: ' + senderId);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (event.message) {
        handleMessage(senderId, event.message);
      } else if (event.postback) {
        handlePostback(senderId, event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  // Parse params from the webhook verification request
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
