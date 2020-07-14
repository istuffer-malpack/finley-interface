function getCoreTag(prodID,noOfSkid){	
			
	let product = prodID.split("-");
	let thickness = parseInt(product[3]);
	let length = product[4];
		
	let coretagCode = ((noOfSkid < 10) ?  '0'+noOfSkid : noOfSkid) + '-' + productType[product[0]];
	
	//thickness
	if(thickness < 100){
		coretagCode += coreCode[Math.floor(thickness/10)] + '' + coreCode[(thickness % 10 == 0) ? 24 : thickness % 10]; 
	}else{
		coretagCode += coreCode[(thickness % 10 == 0) ? thickness/10 : Math.floor(thickness/10)] + '' + coreCode[(thickness % 10 == 0) ? 24 : thickness % 10]; 
	}
			
			//length
	if(length.indexOf('K') > -1){
		var kCode = length.split('K'); 
		var fstdigit = parseInt(kCode[0]);
		var secondDigit = (kCode[1] == '') ? 24 : parseInt(kCode[1]);
				
		coretagCode += coreCode[fstdigit] + '' + coreCode[secondDigit];
				
	}else{
	
		var testing = (Math.floor(length/100)) > 26 ? Math.floor(length/1000) : Math.floor(length/100);
		var fstdigit = (length/100) % 5 == 0 ? coreCode[Math.floor(length/1000)] : coreCode[testing];
		
		var secondDigit = (length/100) % 5 == 0 ? coreCode[Math.floor((length % 1000)/100)] : coreCode[Math.floor((length % 1000)/10)];					
			
		if(secondDigit == undefined) secondDigit = coreCode[Math.floor((length/100) % 10)];
			//'X';
		
		coretagCode += fstdigit+''+secondDigit;
		//console.log(coretagCode);
	}
			
	//date
	var today = new Date();
	coretagCode += dateCode[today.getMonth()] + '' + today.getDate().toString().padStart(2, "0"); //(today.getDate() < 10 ) ? "0" + today.getDate() : today.getDate();
	
	return coretagCode;
}
