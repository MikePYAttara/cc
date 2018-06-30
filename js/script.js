if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
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
  })
};         

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
