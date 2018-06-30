window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

function openDataBase() {
  window.indexedDB.open('mpy-ccDB', 1);
} 

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        // Registration successful
        if (reg.waiting) {
          self.skipWaiting();  	
            return;
          }
  
          if (reg.installing) {
            return;
        }
        
          if (reg.active) {
            return;
          }

      }, err => {
        // Registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

  let currencyListHtml = "";
  const url = 'https://free.currencyconverterapi.com/api/v5/currencies';
  fetch(url)
  .then(res => res.json())
  .then(data => openDataBase(data))
  .catch(err => console.log('Sorry we could not get data from ', url))


// Populate IndexDB function
  function saveToDB(data) {
    //Init Database
    const db = openDataBase();

    // On success add data
    db.onsuccess = event => {
        // Query for data
        const query = event.target.result;

        // Check if data exist in Database
        const currency = query.transaction('currencies').objectStore('currencies').get(data.symbol);

        currency.onsuccess = event => {
            const dbData = event.target.result;
            const store = query.transaction('currencies', 'readwrite').objectStore('currencies');
            currencies.array.forEach(element => {
                if (!dbData) {
                    // Save data
                    store.add(data, data.symbol);
                } else {
                    //Update data
                    store.put(data, data.symbol);
                }; 
            });
           
            store.openCursor().onsuccess = event => {
                const cursor = event.target.result;
                if (cursor) {
                    const currency = cursor.value;
          currencyListHtml += `<option value=${currency.id}> [${currency.id}] ${currency.currencyName} </option>`;
          cursor.continue();
                }
                document.querySelector('#from-currency').innerHTML(`<option value="">Select the From Currency</option>` + currencyListHtml);
                document.querySelector('#to-currency').innerHTML(`<option value="">Select the From Currency</option>` + currencyListHtml);
            }
        }

        currency.onerror = err => console.log('Sorry, we could not add the currency to the database.');
    }

    db.onerror = err => console.log('Sorry, we encountered an error', err);
}


document.querySelector('#convert').on('click', convertCurrency());
// Conversion process
function convertCurrency() {
  const fc = document.querySelector('#from-currency');
  const tc = document.querySelector('#to-currency');
  const fromCurrency = fc.options[fc.selectedIndex].value;
  const toCurrency = tc.options[tc.selectedIndex].value;
  const query = `${fromCurrency}_${toCurrency}`;
  const amt = parseFloat(document.querySelector('#amount').value);
  const url = `https://www.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
  fetch(url)
  .then(res => {
    let body = "";
    res.on('data', chunk => {
      body += chunk;
    });
    res.on('end', () => {
      const jsonObj = JSON.parse(body);
      const val = jsonObj[query];
      if (val) {
        const total = val * amt;
        Math.round(total * 100) / 100;
      } else {
        const err = new Error(`Value not found for ${query}`);
        console.log(err);
      };
    });
  })
  .catch(err => console.log(err))
}
