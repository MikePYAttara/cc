const resources = [
  '/',
  '/css/style.css',
  '/js/script.js',
  'https://free.currencyconverterapi.com/api/v5/currencies',        
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('mpy-cc-cache').then(cache => cache.addAll(resources))
    .catch(err => console.log(err))
  )
})


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(response => {
        let responseClone = response.clone();
        caches.open('mpy-cc-cache').then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    }).catch(err => {
      return err;
    })
  );
});