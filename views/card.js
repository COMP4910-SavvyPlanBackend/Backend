const stripe = Stripe('pk_test_51Hje1GFgYf0t2TbmoAIWFjcusGnnEvN941iBiaTCRM6BdOkSKnnVMspqm9rhzjhnf05rwjyTTxae2Xyjd8gyOOxe00H73fnHSI'); // Your Publishable Key
const elements = stripe.elements();

// Create our card inputs
var style = {
  base: {
    color: "#fff"
  }
};
//to delete
//Sample purchase item
var purchase = {

  items: [{ id: "xl-tshirt" }],
  //amount: document.getElementsByName("amount"),

};

fetch("/api/purchases/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(purchase)
})
  .then(function (result) {
    return result.json();
  })
  .then(function (data) {
    //var amount = body.amount;
    var elements = stripe.elements();
    var style = {
      base: {
        color: "white",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d"
        }
      },
      invalid: {
        fontFamily: 'Arial, sans-serif',
        color: "#fa755a",
        iconColor: "#fa755a"
      }

    };

    var card = elements.create("card", { style: style });

    // Stripe injects an iframe into the DOM

    card.mount("#card-element");

    card.on("change", function (event) {

      // Disable the Pay button if there are no card details in the Element

      document.querySelector("button").disabled = event.empty;

      document.querySelector("#card-error").textContent = event.error ? event.error.message : "";

    });

    var form = document.getElementById("payment-form");

    //var paymentAmount = document.getElementsByName("amount");

    form.addEventListener("submit", function (event) {

      event.preventDefault();

      // Complete payment when the submit button is clicked

      payWithCard(stripe, card, data.clientSecret);

    });

  });

// Calls stripe.confirmCardPayment

// If the card requires authentication Stripe shows a pop-up modal to

// prompt the user to enter authentication details without leaving your page.

var payWithCard = function (stripe, card, clientSecret) {

  loading(true);

  stripe.confirmCardPayment(clientSecret, {

      payment_method: {

        card: card

      }

    }).then(function (result) {

      if (result.error) {

        // Show error to your customer

        showError(result.error.message);

      } else {

        // The payment succeeded!

        orderComplete(result.paymentIntent.id);

      }

    });

};

/* ------- UI helpers ------- */

// Shows a success message when the payment is complete

var orderComplete = function (paymentIntentId) {

  loading(false);

  document.querySelector(".result-message a")
  .setAttribute(

      "href",

      "https://dashboard.stripe.com/test/payments/" + paymentIntentId

    );

  document.querySelector(".result-message").classList.remove("hidden");

  document.querySelector("button").disabled = true;

};

// Show the customer the error from Stripe if their card fails to charge

var showError = function (errorMsgText) {

  loading(false);

  var errorMsg = document.querySelector("#card-error");

  errorMsg.textContent = errorMsgText;

  setTimeout(function () {

    errorMsg.textContent = "";

  }, 4000);

};

// Show a spinner on payment submission

var loading = function (isLoading) {

  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }

};


/*
const card = elements.create('card', { style });
card.mount('#card-element');

var cardholderName = document.getElementById('cardholder-name');
var cardButton = document.getElementById('card-button');
var clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', function(ev) {

  stripe.confirmCardSetup(
    clientSecret,
    {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardholderName.value,
        },
      },
    }
  ).then(function(result) {
    if (result.error) {
      // Display error.message in your UI.
    } else {
      // The setup has succeeded. Display a success message.
    }
  });
});





const form = document.querySelector('form');
const errorEl = document.querySelector('#card-errors');



// Create token from card data
form.addEventListener('submit', e => {
  e.preventDefault();

  stripe.createToken(card).then(res => {
    if (res.error) errorEl.textContent = res.error.message;
    else stripeTokenHandler(res.token);
  })
});

// Give our token to our form
const stripeTokenHandler = token => {
  const hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  form.submit();
};*/