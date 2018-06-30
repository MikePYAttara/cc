window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};

const resources = [
  '/',
  '/css/style.css',
  '/js/script.js',
  'https://free.currencyconverterapi.com/api/v5/currencies',        
]

const dbName = 'mpy-cc'

self.addEventListener('install', event => {
  // Open Database
  const request = window.indexedDB.open(dbName, 1);
  event.waitUntil(
    // On success add data
    db.onsuccess = event => {
      // Query for data
      const query = event.target.result;

      // Check if data exist in Database
      const currency = query.transaction('currencies').objectStore('currencies').get(data.symbol);

      currency.onsuccess = event => {
          const dbData = event.target.result;
          const store = query.transaction('currencies', 'readwrite').objectStore('currencies');
          if (!dbData) {
              // Save data
              store.add(data, data.symbol);
          } else {
              //Update data
              store.put(data, data.symbol);
          };
      }
  } 
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(cachedResponse => {	
    	if(!cachedResponse) {
        return fetch(event.request)
        .then(onlineResponse => {
    			clonedOnlineResponse = onlineResponse.clone();
          caches.open("appcache")
          .then(cache => cache.put(event.request.url, clonedOnlineResponse));
    			return onlineResponse;
        }).catch(err => {
    			console.log(err);
    		});
    	}
      return cachedResponse;
    })
  );
});