$(document).ready(() => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js')
		.then(reg => { 
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
		});
	}


	let currencyListHtml = "";
	loadCurrenciesOnline();

	// Populating the select controls
	function loadCurrenciesOnline() {
		$.ajax({
		        type: 'GET',
		        url: "https://free.currencyconverterapi.com/api/v5/currencies",
		        data: {},
		        dataType: 'json', 
		        success: response => {	
					const request = window.indexedDB.open("AppDB", 1);
					request.onerror = event => {
							$("#output").text("Sorry, we hard a problem. Kindly refresh your browser.");
					};
					request.onsuccess = event => {
					  const db = event.target.result;
					  const currencyObjectStore = db.transaction("Currencies", "readwrite").objectStore("Currencies");
					  let indexID = currencyObjectStore.index("id");

					  indexID.openCursor().onsuccess = event => {
						  const cursor = event.target.result;
						  if (cursor) {
						    objRecord = cursor.value;
						    currencyListHtml += `<option value=${objRecord.id}> [${objRecord.id}] ${objRecord.currencyName} </option>`;
						    cursor.continue();
						  }
						$( "#from-currency" ).html(`<option value="">Select the From Currency</option>` + currencyListHtml);
						$( "#to-currency" ).html(`<option value="">Select the To Currency</option>` + currencyListHtml);
					  };

						$("#output").text("Ready...");
					};

					request.onupgradeneeded = event => {
					  const db = event.target.result;
					  objectStore = db.createObjectStore("Currencies", { keyPath: "id" });
					  objectStore.createIndex("id", "id", { unique: true });
					  objectStore.transaction.oncomplete = event => {
					    const currencyObjectStore = db.transaction("Currencies", "readwrite").objectStore("Currencies");
					    for (let key in response.results) {
						     objRecord = response.results[key];
						     currencyObjectStore.add(objRecord);
						}


						let indexID = currencyObjectStore.index("id");
						  indexID.openCursor().onsuccess = event => {
							  let cursor = event.target.result;
							  if (cursor) {
							    objRecord = cursor.value;
							    currencyListHtml += `<option value=${objRecord.id}> [${objRecord.id}] ${objRecord.currencyName} </option>`;
							    cursor.continue();
							  }

							$("#from-currency").append(currencyListHtml);
							$("#to-currency").append(currencyListHtml);

						  };

						 $("#output").text("Ready...");  
					  };
					}
		        },
		        complete: () => {				       
		        },
		        failure: () => {
		             $("#output").text("A problem occured, refresh browser...");
		        }
		 });
	}


	// Conversion process
	$("#convert").on("click", () => {	
		const fc  = $('#from-currency');
		const fromCurrency = fc.options[fc.selectedIndex].value;
		const tc = $('#to-currency');
		const toCurrency = tc.options[tc.selectedIndex].value;
		const convertVal = fromCurrency + '_' + toCurrency;
		const amount = parseFloat($('#amount').val());

		if ((fromCurrency == "" && toCurrency == "") || amount < 0){
			alert("Oops, both Currency From and Currency To are required and Amount must be a positive number");
		}
		else{
			$.ajax({
		        type: 'GET',
		        url: `https://free.currencyconverterapi.com/api/v5/convert?q=${convertSymbol}&compact=y`,
		        data: {},
		        dataType: 'json', 
		        success: response => {
		        	result = response[convertSymbol];
		        	rate = parseFloat(result.val);
		        	convertedAmount = amount * rate;
		        	$("#output").text(convertedAmount);
		        },
		        complete: () => {				       
		        },
		        failure: function(){
		            $("#output").text("Sorry, try again later.");
		        }
		 	});
	 }
	});
});