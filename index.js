const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');
const router = express.Router();



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
})


app.post('/pay', async (request, response) => {
  try {
    let intent;
    if (request.body.payment_method_id) {


      intent = await stripe.paymentIntents.create({
        payment_method: request.body.payment_method_id,
        amount: 1099,
        currency: 'usd',
        confirmation_method: 'manual',
        confirm: true
      });
    } else if (request.body.payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        request.body.payment_intent_id
      );
    }


    response.send(generateResponse(intent));
  } catch (e) {


    return response.send({ error: e.message });
  }
});

const generateResponse = (intent) => {
  // Note that if your API version is before 2019-02-11, 'requires_action'
  // appears as 'requires_source_action'.
  if (
    intent.status === 'requires_action' &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    // Tell the client to handle the action
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret
    };
  } else if (intent.status === 'succeeded') {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    return {
      success: true
    };
  } else {
    // Invalid status
    return {
      error: 'Invalid PaymentIntent status'
    }
  }
};


app.listen(4000, () => {console.log(`server is running at port 4000`)});