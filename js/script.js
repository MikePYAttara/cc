window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};

// REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/cc/sw.js', { scope : '/cc/'})
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

// POPULATE CURRENCY LIST
let currencyListHtml = "";
const url = 'https://free.currencyconverterapi.com/api/v5/currencies';

// fetch(url).then(res => res.json())
// .then(json => {
//   console.log(json);
//   createDb(json);
// })

if (self.XMLHttpRequest) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const res = xhttp.responseText;
      currencies = JSON.parse(res);
      createDb(currencies);
    };
  };
  
  xhttp.open('GET', url, true);
  xhttp.send();
};



// PERFORM CONVERSION
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


// FUNCTION TO CREATE DATABASE
function createDb(json) {
  // store currencies
  const currencies = json['results'];

  // create database
  const req = window.indexedDB.open('MPY-CC');
  req.onerror = event => {
    alert(`Database error: ${event.target.errorCode}`)
  }

  req.onupgradeneeded = event => {
    const db = event.target.result;
		const objectStore = db.createObjectStore('currencies', { keyPath : 'id' });
    objectStore.createIndex('id', 'id', { unique : true });
    objectStore.transaction.oncomplete = event => {
      const currencyObjectStore = db.transaction(['currencies'], 'readwrite').objectStore('currencies');
      currencies.forEach(currency => {
        // add currency to db 
        const request = currencyObjectStore.add(currency);

        request.onsuccess = event => {
          // event.target.result === currency.id
          const currency = event.target.result;
          // build currencyListHtml
          currencyListHtml += `<option value=${currency.id}>${currency.id}</option>`;
        };
      });
    };
  };

  req.onsuccess = event => {
    const db = event.target.result;
  };
}

// populate currency list
document.querySelector('#from-currency').innerHTML =`<option value="">Currency</option>${currencyListHtml}`;
document.querySelector('#to-currency').innerHTML =`<option value="">Currency</option>${currencyListHtml}`;
