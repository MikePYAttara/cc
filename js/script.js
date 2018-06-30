window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/cc/sw.js', { scope: '/cc/'})
  .then(reg => {
    // Registration successful
    console.log('Service Worker registered!')
    if (reg.waiting) {
      self.skipWaiting();  	
        return;
      }

      if (reg.installing) {
        return;}
    
      if (reg.active) {
        return;
      }

  }, err => {
    // Registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });
};         

let currencyInnerHTML = "";
const url = 'https://free.currencyconverterapi.com/api/v5/currencies';
fetch(url)
.then(res => res.json())
.then(data => {
  const currencies = data['results'];
  for (let currency in currencies) {
    currencyInnerHTML += `<option value=${currency}>${currency}</option>`;
  };
  document.querySelector('#from-currency').innerHTML =`<option value="">Currency</option>` + currencyInnerHTML;
  document.querySelector('#to-currency').innerHTML =`<option value="">Currency</option>` + currencyInnerHTML;
})

// Select button
document.querySelector('#convert').addEventListener('click', convertCurrency);

// Conversion process
function convertCurrency() {
  const fc = document.querySelector('#from-currency');
  const tc = document.querySelector('#to-currency');
  const fromCurrency = fc.options[fc.selectedIndex].value;
  const toCurrency = tc.options[tc.selectedIndex].value;
  const query = `${fromCurrency}_${toCurrency}`;
  const amt = parseFloat(document.querySelector('#amount').value);
  const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
  fetch(url)
  .then(res => res.json())
  .then(data => {
    const val = data[query];
    if (val) {
      let total = parseFloat(val) * amt;
      total = Math.round(total * 100) / 100;
      document.querySelector('#output').innerHTML = total;
    }
  })
  .catch(err => console.log(err))
}


function createDb(data) {
  // create database
  const req = window.indexedDB.open('MPY-CC');
  req.onerror = event => {
    alert(`Database error: ${event.target.errorCode}`)
  }

  req.onupgradeneeded = event => {
    const db = event.target.result;
    const objStore = db.createObjectStore('currencies', { keyPath : 'id' });
    objStore.createIndex('symbol', { unique : false });
    objStore.createIndex('id', { unique : true });
    const currencies = data['results']
    objStore.transaction.complete = event => {
      
    }

  }

  req.onsuccess = event => {
    const db = event.target.result;
  }
}
