const axios = require('axios');

const { PAGE_ACCESS_TOKEN } = process.env;

const sendMessage = (senderId, response) => {
  // Construct the message body
  const body = {
    recipient: {
      id: senderId
    },
    message: response
  };

  // Send the HTTP request to the Messenger Platform
  return axios({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    body
  })
    .then(res => {
      console.log('message sent!', res);
    })
    .catch(err => {
      console.error('Unable to send message:' + err);
    });
};

const handleMessage = (senderId, message) => {
  let response;

  // Checks if the message contains text
  if (message.text) {
    // Creates the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      text: `You sent the message: "${
        message.text
      }". Now send me an attachment!`
    };
  } else if (message.attachments) {
    // Gets the URL of the message attachment
    const attachmentUrl = message.attachments[0].payload.url;
    console.log('Attachment');
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Is this the right picture?',
              subtitle: 'Tap a button to answer.',
              image_url: attachmentUrl,
              buttons: [
                {
                  type: 'postback',
                  title: 'Yes!',
                  payload: 'yes'
                },
                {
                  type: 'postback',
                  title: 'No!',
                  payload: 'no'
                }
              ]
            }
          ]
        }
      }
    };
  }

  // Sends the response message
  return sendMessage(senderId, response);
};

const handlePostback = (senderId, postback) => {
  let response;

  // Get the payload for the postback
  const { payload } = postback;

  // Set the response based on the postback payload
  switch (payload) {
    case 'yes':
      response = { text: 'Thanks!' };
      break;
    case 'no':
      response = { text: 'Oops, try sending another image.' };
      break;
    default:
      return;
  }

  // Send the message to acknowledge the postback
  sendMessage(senderId, response);
};

module.exports = {
  handleMessage,
  handlePostback
};
