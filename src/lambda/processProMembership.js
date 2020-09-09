require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_LIVE); //STRIPE_SECRET_KEY_TEST //STRIPE_SECRET_KEY_LIVE
const axios = require("axios");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST",
};

var body;
var stripeCustomerId;
var stripePaymentMethodId;
var priceTier;

function handleRequest(event, context, callback) {
  try {
    body = JSON.parse(event.body);
  } catch {
    sendErrorMessage(400, "Body not formatted in JSON.", callback);
    console.log(body.raw);
  }

  if (!hasValidBody()) {
    sendErrorMessage(
      400,
      "Please fill out all required information.",
      callback
    );
  }

  createStripePaymentMethod()
    .then(createStripeCustomer)
    .then(createStripeSubscription)
    .then(postFormSubmission)
    .then(() => {
      callback(null, {
        statusCode: 200,
      });
    })
    .catch(error => {
      sendErrorMessage(400, error, callback);
    });
}

function hasValidBody() {
  priceTier = body.priceTierId;

  return (
    body.firstName &&
    body.lastName &&
    body.companyName &&
    body.email &&
    body.ccNumber &&
    body.ccExpirationMonth &&
    body.ccExpirationYear &&
    body.ccCardHolderName &&
    body.cvv &&
    isValidPriceTierId
  );
}

function sendErrorMessage(statusCode, message, callback) {
  console.error(message);

  callback(null, {
    statusCode,
    headers,
    body: JSON.stringify({ message }),
  });
}

function postFormSubmission() {
  var request = `form-name=warmup&firstName=${body.firstName}&lastName=${body.lastName}&email=${body.email}&companyName=${body.companyName}&priceTierId=${body.priceTierId}`;
  return axios.post("https://www.tridigitalmarketing.com/", request);
}

function createStripeCustomer() {
  return new Promise((resolve, reject) => {
    var customer = {
      email: body.email,
      description: body.companyName,
      payment_method: stripePaymentMethodId,
      invoice_settings: {
        default_payment_method: stripePaymentMethodId,
      },
    };

    stripe.customers.create(customer, (error, customer) => {
      if (customer) {
        stripeCustomerId = customer.id;
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

function createStripePaymentMethod() {
  return new Promise((resolve, reject) => {
    var card = {
      type: "card",
      card: {
        number: body.ccNumber,
        exp_month: body.ccExpirationMonth,
        exp_year: body.ccExpirationYear,
        cvc: body.cvv,
      },
    };

    stripe.paymentMethods.create(card, (error, paymentMethod) => {
      if (paymentMethod) {
        stripePaymentMethodId = paymentMethod.id;
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

function createStripeSubscription() {
  return new Promise((resolve, reject) => {
    resolve();

    stripe.subscriptions.create(
        {
          customer: stripeCustomerId,
          items: [
            { plan: /*PlanID*/ },
          ],
        },
        (error, subscription) => {
          if (subscription) {
            resolve();
          } else {
            reject(error);
          }
        }
      );
    }
  );
}

exports.handler = handleRequest;
