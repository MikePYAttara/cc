import './jquery'

$(document).ready(() => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js').then(reg => { 
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
	function loadCurrenciesOnline(){
		$("#output").text("Loading currencies...");
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
						$( "#fromCurrency" ).html(`<option value="">Select the From Currency</option>` + currencyListHtml);
						$( "#toCurrency" ).html(`<option value="">Select the To Currency</option>` + currencyListHtml);
					  };

						$("#output").text("Ready...");
					};

					request.onupgradeneeded = event => {
					  var db = event.target.result;
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

							$("#fromCurrency").append(currencyListHtml);
							$("#toCurrency").append(currencyListHtml);

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
	$(document).on("click","#btn-convert", () => {	
		const fromCurrency  = $('#fromCurrency').find(":selected").val();
		const toCurrency    = $('#toCurrency').find(":selected").val();
		const convertVal = fromCurrency + '_' + toCurrency;
		const amount = parseFloat($('#amount').val());

		if ((fromCurrency =="" && toCurrency =="") || amount < 0){
			alert("Oops, both Currency From and Currency To are required and Amount must be a positive number");
		}
		else{
			$("#output").text("Converting...");
			$.ajax({
		        type: 'GET',
		        url: `https://free.currencyconverterapi.com/api/v5/convert?q=${convertSymbol}&compact=y`,
		        data: {},
		        dataType: 'json', 
		        success: response => {
		        	result = response[convertSymbol];
		        	rate = parseFloat(result.val);
		        	convertedAmount = amount * rate;
		        	convertedMsg = `${amount} ${currencyFrom} = ${convertedAmount} ${currencyTo}`;
		        	$("#output").text(convertedMsg);
		        },
		        complete: () => {				       
		        },
		        failure: function(){
		             $("#output").text("Failed...");
		        }
		 	});
	 }
	});
});