// GLOBAL VARIABLES 
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
if (self.XMLHttpRequest) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      const res = xhttp.responseText;
      currencies = JSON.parse(res);
      createDb(currencies);
    };
  };
  
  xhttp.open('GET', 'https://free.currencyconverterapi.com/api/v5/currencies', true);
  xhttp.send();
};

// fetch(url).then(res => res.json())
// .then(json => {
//   console.log(json);
//   createDb(json);
// })



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
      if (total !== NaN) {
        document.querySelector('#output').innerHTML = total;
      } else {
        document.querySelector('#output').innerHTML = '0';
      };
    };
  })
  .catch(err => console.log(err))
}

// CREATE DATABASE
function createDb(resp) {
  // create database
  const req = window.indexedDB.open('MPY-CC');
  req.onerror = event => {
    alert(`Database error: ${event.target.errorCode}. Kindly refresh your browser.`)
  }

  req.onupgradeneeded = event => {
    const db = event.target.result;
		const objectStore = db.createObjectStore('currencies', { keyPath : 'id' });
    objectStore.createIndex('id', 'id', { unique : true });
    objectStore.transaction.oncomplete = event => {
      const currencyObjectStore = db.transaction(['currencies'], 'readwrite').objectStore('currencies');
      for (let key in resp.results) {
        const currency = resp.results[key];
        // add currency to db 
        const request = currencyObjectStore.add(currency);
      };
    };
  };

  req.onsuccess = event => {
    const db = event.target.result;
    const currencyObjectStore = db.transaction(['currencies']).objectStore('currencies');
    currencyObjectStore.openCursor().onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        const currency = cursor.value;
        // populate currency list
        document.querySelector('#from-currency').innerHTML += `<option value="${currency.id}">${currency.id}</option>`;document.querySelector('#to-currency').innerHTML += `<option value="${currency.id}">${currency.id}</option>`;

        cursor.continue();
      };
    };
  };
}