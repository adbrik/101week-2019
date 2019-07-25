/*
  Copyright 2019 Square Inc.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const express = require('express');
const bodyParser = require('body-parser');
const squareConnect = require('square-connect');

const app = express();
const port = 3000;

// Set the Access Token and Location Id
const accessToken = 'EAAAELN0UeusapsdHbnvVZVJIPBYsMRtAGDBPs8yIOqVSSIetj64lJy85gJTM3Bh';
const locationId = 'CBASEPNEBK-0gC0Ixav9nABuYQ4gAQ';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// Set Square Connect credentials
const defaultClient = squareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = accessToken;

app.post('/process-payment', function(req, res){
  const requestParams = req.body;

  const idempotencyKey = require('crypto').randomBytes(64).toString('hex');

  // Charge the customer's card
  const transactionsApi = new squareConnect.TransactionsApi();
  const requestBody = {
    card_nonce: requestParams.nonce,
    amount_money: {
      amount: 10000, // $1.00 charge
      currency: 'CAD'
    },
    idempotency_key: idempotencyKey
  };
  transactionsApi.charge(locationId, requestBody).then(function(data) {
    const json= JSON.stringify(data);
    console.log(json);
    res.status(200).json({
      'title': 'Payment Successful',
      'result': json
    });
  }, function(error) {
    res.status(500).json({
      'title': 'Payment Failure',
      'result': error.response.text
    });
  });
});

app.listen(
  process.env.PORT || 8080,
  () => console.log(`listening on - http://localhost:${process.env.PORT}`)
);
