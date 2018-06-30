const resources = [
  '/',
  '/css/bootstrap.min.css',
  '/css/style.css',
  '/css/manifest/*',
  '/js/jquery.js',
  '/js/bootstrap.min.js',
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