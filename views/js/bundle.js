// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"card.js":[function(require,module,exports) {
/*eslint-disable*/
let stripe;
let customer;
let price;
let card;
let publishableKey;
const priceInfo = {
  basic: {
    amount: '9000',
    name: 'basic',
    interval: 'yearly',
    currency: 'USD'
  },
  premium: {
    amount: '90000',
    name: 'premium',
    interval: 'yearly',
    currency: 'USD'
  }
}; //

function stripeElements(publishableKey) {
  //console.log("key in stripe elements: "+ publishableKey)
  stripe = Stripe(String(publishableKey));

  if (document.getElementById('card-element')) {
    const elements = stripe.elements(); // Card Element styles

    const style = {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#a0aec0'
        }
      }
    };
    card = elements.create('card', {
      style: style
    });
    card.mount('#card-element');
    card.on('focus', function () {
      const el = document.getElementById('card-element-errors');
      el.classList.add('focused');
    });
    card.on('blur', function () {
      const el = document.getElementById('card-element-errors');
      el.classList.remove('focused');
    });
    card.on('change', function (event) {
      displayError(event);
    });
  }

  const signupForm = document.getElementById('signup-form');

  if (signupForm) {
    signupForm.addEventListener('submit', function (evt) {
      evt.preventDefault();
      changeLoadingState(true); // Create customer

      createCustomer().then(result => {
        customer = result.customer;
        window.location.href = `/prices.ejs?customerId=${customer.id}`;
      }).catch(err => {
        console.log(err);
      });
    });
  }

  const paymentForm = document.getElementById('payment-form');

  if (paymentForm) {
    paymentForm.addEventListener('submit', function (evt) {
      evt.preventDefault();
      changeLoadingStatePrices(true); // If a previous payment was attempted, get the lastest invoice

      const latestInvoicePaymentIntentStatus = localStorage.getItem('latestInvoicePaymentIntentStatus');

      if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
        const invoiceId = localStorage.getItem('latestInvoiceId');
        const isPaymentRetry = true; // create new payment method & retry payment on invoice with new payment method

        createPaymentMethod({
          card,
          isPaymentRetry,
          invoiceId
        });
      } else {
        // create new payment method & create subscription
        createPaymentMethod({
          card
        });
      }
    });
  }
}

function displayError(event) {
  changeLoadingStatePrices(false);
  const displayError = document.getElementById('card-element-errors');

  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
} //signinform logic


const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:5000/api/users/login',
      data: {
        email,
        password
      }
    });

    if (res.status == 'success') {
      alert('Logged in succesfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
document.getElementById('signin-btn').addEventListener('click', function () {
  location.href = '/user/signin';
}); //Open Signin Page
// function getSignin(){
//   location.href = '/user/signin';
// }

function createPaymentMethod({
  card,
  isPaymentRetry,
  invoiceId
}) {
  const params = new URLSearchParams(document.location.search.substring(1));
  const customerId = params.get('customerId'); // Set up payment method for recurring usage

  const billingName = document.querySelector('#name').value;
  const priceId = document.getElementById('priceId').innerHTML.toUpperCase(); //console.log(priceId);

  stripe.createPaymentMethod({
    type: 'card',
    card: card,
    billing_details: {
      name: billingName
    }
  }).then(result => {
    if (result.error) {
      displayError(result);
    } else if (isPaymentRetry) {
      // Update the payment method and retry invoice payment
      retryInvoiceWithNewPaymentMethod({
        customerId: customerId,
        paymentMethodId: result.paymentMethod.id,
        invoiceId: invoiceId,
        priceId: priceId
      });
    } else {
      // Create the subscription
      createSubscription({
        customerId: customerId,
        paymentMethodId: result.paymentMethod.id,
        priceId: priceId
      });
    }
  });
}

function goToPaymentPage(priceId) {
  // Show the payment screen
  document.querySelector('#payment-form').classList.remove('hidden');
  document.getElementById('total-due-now').innerText = getFormattedAmount(priceInfo[priceId].amount); // Add the price selected

  document.getElementById('price-selected').innerHTML = `${'→ Subscribing to ' + '<span id="priceId" class="font-bold">'}${priceInfo[priceId].name}</span>`; // Show which price the user selected

  if (priceId === 'premium') {
    document.querySelector('#submit-premium-button-text').innerText = 'Selected';
    document.querySelector('#submit-basic-button-text').innerText = 'Select';
  } else {
    document.querySelector('#submit-premium-button-text').innerText = 'Select';
    document.querySelector('#submit-basic-button-text').innerText = 'Selected';
  } // Update the border to show which price is selected


  changePriceSelection(priceId);
}

function changePrice() {
  demoChangePrice();
}

function switchPrices(newPriceIdSelected) {
  const params = new URLSearchParams(document.location.search.substring(1));
  const currentSubscribedpriceId = params.get('priceId');
  const customerId = params.get('customerId');
  const subscriptionId = params.get('subscriptionId'); // Update the border to show which price is selected

  changePriceSelection(newPriceIdSelected);
  changeLoadingStatePrices(true); // Retrieve the upcoming invoice to display details about
  // the price change

  retrieveUpcomingInvoice(customerId, subscriptionId, newPriceIdSelected).then(upcomingInvoice => {
    // Change the price details for price upgrade/downgrade
    // calculate if it's upgrade or downgrade
    document.getElementById('current-price-subscribed').innerHTML = capitalizeFirstLetter(currentSubscribedpriceId);
    document.getElementById('new-price-selected').innerText = capitalizeFirstLetter(newPriceIdSelected);
    document.getElementById('new-price-price-selected').innerText = `$${upcomingInvoice.amount_due / 100}`;
    const nextPaymentAttemptDateToDisplay = getDateStringFromUnixTimestamp(upcomingInvoice.next_payment_attempt);
    document.getElementById('new-price-start-date').innerHTML = nextPaymentAttemptDateToDisplay;
    changeLoadingStatePrices(false);
  });

  if (currentSubscribedpriceId != newPriceIdSelected) {
    document.querySelector('#price-change-form').classList.remove('hidden');
  } else {
    document.querySelector('#price-change-form').classList.add('hidden');
  }
}

function confirmPriceChange() {
  const params = new URLSearchParams(document.location.search.substring(1));
  const subscriptionId = params.get('subscriptionId');
  const newPriceId = document.getElementById('new-price-selected').innerHTML;
  updateSubscription(newPriceId.toUpperCase(), subscriptionId).then(result => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('priceId', newPriceId.toUpperCase());
    searchParams.set('priceHasChanged', true);
    window.location.search = searchParams.toString();
  });
}

function createCustomer() {
  const billingEmail = document.querySelector('#email').value;
  return fetch('/api/purchases/create-customer', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: billingEmail
    })
  }).then(response => {
    return response.json();
  }).then(result => {
    return result;
  }).catch(err => {
    console.log(err);
  });
}

function handlePaymentThatRequiresCustomerAction({
  subscription,
  invoice,
  priceId,
  paymentMethodId,
  isRetry
}) {
  if (subscription && subscription.status === 'active') {
    // subscription is active, no customer actions required.
    return {
      subscription,
      priceId,
      paymentMethodId
    };
  } // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
  // If it's a retry, the payment intent will be on the invoice itself.


  const paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;

  if (paymentIntent.status === 'requires_action' || isRetry === true && paymentIntent.status === 'requires_payment_method') {
    return stripe.confirmCardPayment(paymentIntent.client_secret, {
      payment_method: paymentMethodId
    }).then(result => {
      if (result.error) {
        // start code flow to handle updating the payment details
        // Display error message in your UI.
        // The card was declined (i.e. insufficient funds, card has expired, etc)
        throw result;
      } else if (result.paymentIntent.status === 'succeeded') {
        // There's a risk of the customer closing the window before callback
        // execution. To handle this case, set up a webhook endpoint and
        // listen to invoice.paid. This webhook endpoint returns an Invoice.
        return {
          priceId: priceId,
          subscription: subscription,
          invoice: invoice,
          paymentMethodId: paymentMethodId
        };
      }
    });
  } // No customer action needed


  return {
    subscription,
    priceId,
    paymentMethodId
  };
}

function handleRequiresPaymentMethod({
  subscription,
  paymentMethodId,
  priceId
}) {
  if (subscription.status === 'active') {
    // subscription is active, no customer actions required.
    return {
      subscription,
      priceId,
      paymentMethodId
    };
  }

  if (subscription.latest_invoice.payment_intent.status === 'requires_payment_method') {
    // Using localStorage to store the state of the retry here
    // (feel free to replace with what you prefer)
    // Store the latest invoice ID and status
    localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
    localStorage.setItem('latestInvoicePaymentIntentStatus', subscription.latest_invoice.payment_intent.status);
    alert('Your card was declined.');
  } else {
    return {
      subscription,
      priceId,
      paymentMethodId
    };
  }
}

function onSubscriptionComplete(result) {
  //console.log(result);
  // Payment was successful. Provision access to your service.
  // Remove invoice from localstorage because payment is now complete.
  clearCache(); // Change your UI to show a success message to your customer.

  onSubscriptionSampleDemoComplete(result); // Call your backend to grant access to your service based on
  // the product your customer subscribed to.
  // Get the product by using result.subscription.price.product
}

function createSubscription({
  customerId,
  paymentMethodId,
  priceId
}) {
  //console.log(priceId);
  return fetch('/api/purchases/create-subscription', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      customerId: customerId,
      paymentMethodId: paymentMethodId,
      priceId: priceId
    })
  }).then(response => {
    return response.json();
  }) // If the card is declined, display an error to the user.
  .then(result => {
    if (result.error) {
      // The card had an error when trying to attach it to a customer
      throw result;
    }

    return result;
  }) // Normalize the result to contain the object returned
  // by Stripe. Add the addional details we need.
  .then(result => {
    return {
      // Use the Stripe 'object' property on the
      // returned result to understand what object is returned.
      subscription: result,
      paymentMethodId: paymentMethodId,
      priceId: priceId
    };
  }) // Some payment methods require a customer to do additional
  // authentication with their financial institution.
  // Eg: 2FA for cards.
  .then(handlePaymentThatRequiresCustomerAction) // If attaching this card to a Customer object succeeds,
  // but attempts to charge the customer fail. You will
  // get a requires_payment_method error.
  .then(handleRequiresPaymentMethod) // No more actions required. Provision your service for the user.
  .then(onSubscriptionComplete).catch(error => {
    // An error has happened. Display the failure to the user here.
    // We utilize the HTML element we created.
    displayError(error);
  });
}

function retryInvoiceWithNewPaymentMethod({
  customerId,
  paymentMethodId,
  invoiceId,
  priceId
}) {
  return fetch('/api/purchases/retry-invoice', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      customerId: customerId,
      paymentMethodId: paymentMethodId,
      invoiceId: invoiceId
    })
  }).then(response => {
    return response.json();
  }) // If the card is declined, display an error to the user.
  .then(result => {
    if (result.error) {
      // The card had an error when trying to attach it to a customer
      throw result;
    }

    return result;
  }) // Normalize the result to contain the object returned
  // by Stripe. Add the addional details we need.
  .then(result => {
    return {
      // Use the Stripe 'object' property on the
      // returned result to understand what object is returned.
      invoice: result,
      paymentMethodId: paymentMethodId,
      priceId: priceId,
      isRetry: true
    };
  }) // Some payment methods require a customer to be on session
  // to complete the payment process. Check the status of the
  // payment intent to handle these actions.
  .then(handlePaymentThatRequiresCustomerAction) // No more actions required. Provision your service for the user.
  .then(onSubscriptionComplete).catch(error => {
    // An error has happened. Display the failure to the user here.
    // We utilize the HTML element we created.
    displayError(error);
  });
}

function retrieveUpcomingInvoice(customerId, subscriptionId, newPriceId) {
  return fetch('/api/purchases/retrieve-upcoming-invoice', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      customerId: customerId,
      subscriptionId: subscriptionId,
      newPriceId: newPriceId
    })
  }).then(response => {
    return response.json();
  }).then(invoice => {
    return invoice;
  });
}

function cancelSubscription() {
  changeLoadingStatePrices(true);
  const params = new URLSearchParams(document.location.search.substring(1));
  const subscriptionId = params.get('subscriptionId');
  return fetch('/api/purchases/cancel-subscription', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscriptionId: subscriptionId
    })
  }).then(response => {
    return response.json();
  }).then(cancelSubscriptionResponse => {
    return subscriptionCancelled(cancelSubscriptionResponse);
  });
}

function updateSubscription(priceId, subscriptionId) {
  return fetch('/api/purchases/update-subscription', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      subscriptionId: subscriptionId,
      newPriceId: priceId
    })
  }).then(response => {
    return response.json();
  }).then(response => {
    return response;
  });
}

function retrieveCustomerPaymentMethod(paymentMethodId) {
  return fetch('/api/purchases/retrieve-customer-payment-method', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      paymentMethodId: paymentMethodId
    })
  }).then(response => {
    return response.json();
  }).then(response => {
    return response;
  });
}

function getConfig() {
  return fetch('/api/purchases/config', {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    return response.json();
  }).then(response => {
    //console.log("res from /config: "+JSON.stringify(response));
    publishableKey = response.publishableKey; // Set up Stripe Elements

    stripeElements(response.publishableKey);
  });
}

getConfig();
/* ------ Sample helpers ------- */

/* ---- HTML Implementation ---- */

function getFormattedAmount(amount) {
  // Format price details and detect zero decimal currencies
  var amount = amount;
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol'
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;

  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }

  amount = zeroDecimalCurrency ? amount : amount / 100;
  const formattedAmount = numberFormat.format(amount);
  return formattedAmount;
}

function capitalizeFirstLetter(string) {
  const tempString = string.toLowerCase();
  return tempString.charAt(0).toUpperCase() + tempString.slice(1);
}

function getDateStringFromUnixTimestamp(date) {
  const nextPaymentAttemptDate = new Date(date * 1000);
  const day = nextPaymentAttemptDate.getDate();
  const month = nextPaymentAttemptDate.getMonth() + 1;
  const year = nextPaymentAttemptDate.getFullYear();
  return `${month}/${day}/${year}`;
} // For demo purpose only


function getCustomersPaymentMethod() {
  const params = new URLSearchParams(document.location.search.substring(1));
  const paymentMethodId = params.get('paymentMethodId');

  if (paymentMethodId) {
    retrieveCustomerPaymentMethod(paymentMethodId).then(function (response) {
      document.getElementById('credit-card-last-four').innerText = `${capitalizeFirstLetter(response.card.brand)} •••• ${response.card.last4}`;
      document.getElementById('subscribed-price').innerText = capitalizeFirstLetter(params.get('priceId'));
    });
  }
}

getCustomersPaymentMethod(); // Shows the cancellation response

function subscriptionCancelled() {
  document.querySelector('#subscription-cancelled').classList.remove('hidden');
  document.querySelector('#subscription-settings').classList.add('hidden');
}
/* Shows a success / error message when the payment is complete */


function onSubscriptionSampleDemoComplete({
  priceId,
  subscription,
  paymentMethodId,
  invoice
}) {
  let subscriptionId;
  let currentPeriodEnd;
  let customerId;

  if (subscription) {
    subscriptionId = subscription.id;
    currentPeriodEnd = subscription.current_period_end;

    if (typeof subscription.customer === 'object') {
      customerId = subscription.customer.id;
    } else {
      customerId = subscription.customer;
    }
  } else {
    const params = new URLSearchParams(document.location.search.substring(1));
    subscriptionId = invoice.subscription;
    currentPeriodEnd = params.get('currentPeriodEnd');
    customerId = invoice.customer;
  }

  window.location.href = `/account.html?subscriptionId=${subscriptionId}&priceId=${priceId}&currentPeriodEnd=${currentPeriodEnd}&customerId=${customerId}&paymentMethodId=${paymentMethodId}`;
}

function demoChangePrice() {
  document.querySelector('#basic').classList.remove('border-pasha');
  document.querySelector('#premium').classList.remove('border-pasha');
  document.querySelector('#price-change-form').classList.add('hidden'); // Grab the priceId from the URL
  // This is meant for the demo, replace with a cache or database.

  const params = new URLSearchParams(document.location.search.substring(1));
  const priceId = params.get('priceId').toLowerCase(); // Show the change price screen
  //console.log(priceId);

  document.querySelector('#prices-form').classList.remove('hidden');
  document.querySelector(`#${priceId.toLowerCase()}`).classList.add('border-pasha');
  const elements = document.querySelectorAll(`#submit-${priceId}-button-text`);

  for (let i = 0; i < elements.length; i++) {
    elements[0].childNodes[3].innerText = 'Current';
  }

  if (priceId === 'premium') {
    document.getElementById('submit-premium').disabled = true;
    document.getElementById('submit-basic').disabled = false;
  } else {
    document.getElementById('submit-premium').disabled = false;
    document.getElementById('submit-basic').disabled = true;
  }
} // Changes the price selected


function changePriceSelection(priceId) {
  document.querySelector('#basic').classList.remove('border-pasha');
  document.querySelector('#premium').classList.remove('border-pasha');
  document.querySelector(`#${priceId.toLowerCase()}`).classList.add('border-pasha');
} // Show a spinner on subscription submission


function changeLoadingState(isLoading) {
  if (isLoading) {
    document.querySelector('#button-text').classList.add('hidden');
    document.querySelector('#loading').classList.remove('hidden');
    document.querySelector('#signup-form button').disabled = true;
  } else {
    document.querySelector('#button-text').classList.remove('hidden');
    document.querySelector('#loading').classList.add('hidden');
    document.querySelector('#signup-form button').disabled = false;
  }
} // Show a spinner on subscription submission


function changeLoadingStatePrices(isLoading) {
  if (isLoading) {
    document.querySelector('#button-text').classList.add('hidden');
    document.querySelector('#loading').classList.remove('hidden');
    document.querySelector('#submit-basic').classList.add('invisible');
    document.querySelector('#submit-premium').classList.add('invisible');

    if (document.getElementById('confirm-price-change-cancel')) {
      document.getElementById('confirm-price-change-cancel').classList.add('invisible');
    }
  } else {
    document.querySelector('#button-text').classList.remove('hidden');
    document.querySelector('#loading').classList.add('hidden');
    document.querySelector('#submit-basic').classList.remove('invisible');
    document.querySelector('#submit-premium').classList.remove('invisible');

    if (document.getElementById('confirm-price-change-cancel')) {
      document.getElementById('confirm-price-change-cancel').classList.remove('invisible');
      document.getElementById('confirm-price-change-submit').classList.remove('invisible');
    }
  }
}

function resetDemo() {
  clearCache();
  window.location.href = '/';
}

function clearCache() {
  localStorage.clear();
}
},{}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "44403" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","card.js"], null)
//# sourceMappingURL=/bundle.js.map