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
let currencyListHTML = "";
const url = 'https://free.currencyconverterapi.com/api/v5/currencies';
fetch(url)
.then(res => res.json())
.then(data => {
  createDb(data);
})


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
function createDb(data) {
  // create database
  const req = window.indexedDB.open('MPY-CC', 1);
  req.onerror = event => {
    alert(`Database error: ${event.target.errorCode}`)
  }

  req.onsuccess = event => {// db = event.target.result;
    const db = event.target.result;
		const currencyObjectStore = db.transaction("currencies", "readwrite").objectStore("currencies");
    const indexID = currencyObjectStore.index("id");
    
    indexID.openCursor().onsuccess = event => {
      const cursor = event.target.result;
      console.log(cursor);
      if (cursor) {
        currencyRecord = cursor.value;

        // build currencyListHtml
        currencyListHtml += `<option value=${currencyRecord.id}>${currencyRecord.id}</option>`;

        cursor.continue();
      };
      // populate currency list
      document.querySelector('#from-currency').innerHTML =`<option value="">Currency</option>` + currencyListHTML;
      document.querySelector('#to-currency').innerHTML =`<option value="">Currency</option>` + currencyListHTML;
    };
  };

  req.onupgradeneeded = event => {
    db = event.target.result;
    const objectStore = db.createObjectStore("currencies", { keyPath: "id" });
    objectStore.createIndex("id", "id", { unique: true });
    objectStore.transaction.complete = event => {
      const currencyObjectStore = db.transaction("currencies", "readwrite").objectStore("currencies");

      // add individual currencies to object store
      for (var currency in data.results) {
        currencyRecord = data.results[currency];
        currencyObjectStore.add(currencyRecord);
      }
      const indexID = currencyObjectStore.index("id");
			indexID.openCursor().onsuccess = event => {
        const cursor = event.target.result;
        console.log(cursor);
        if (cursor) {
          currencyRecord = cursor.value;

          // build currencyListHtml
          currencyListHtml += `<option value=${currencyRecord.id}>${currencyRecord.id}</option>`;

          cursor.continue();
        };
			};
      currencyObjectStore.openCursor().onsuccess = event => {
        const cursor = data['results'];
        if (cursor) {
          currencyObjectStore.add(currency);

          // build currencyListHtml
          currencyListHtml += `<option value=${objRecord.id}>${objRecord.id}</option>`;

          cursor.continue();
        }
        // populate currency list
        document.querySelector('#from-currency').innerHTML =`<option value="">Currency</option>` + currencyListHTML;
        document.querySelector('#to-currency').innerHTML =`<option value="">Currency</option>` + currencyListHTML;
      };
    };
  };
}
