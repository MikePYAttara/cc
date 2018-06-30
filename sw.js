window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};

function openDataBase() {
  window.indexedDB.open('mpy-ccDB', 1);
} 

const resources = [
  '/',
  '/manifest.json',
  '/browserconfig.xml',
  '/css/style.css',
  '/css/manifest/',
  '/js/script.js',
  'https://free.currencyconverterapi.com/api/v5/currencies',        
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open("appcache")
    .then(cache => cache.addAll(resources))
    .catch(err => console.log(err))
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