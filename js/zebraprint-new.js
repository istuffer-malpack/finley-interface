var selected_device;
var devices = [];
function setup()
{
	//Get the default device from the application as a first step. Discovery takes longer to complete.
	BrowserPrint.getDefaultDevice("printer", function(device)
			{

				selected_device = device;
				devices.push(device);

				var html_select = document.getElementById("selected_device");
				var html_select2 = document.getElementById("selected_device2");
				var option = document.createElement("option");
				option.text = device.name;
				var option2 = document.createElement("option");
				option2.text = device.name;
				html_select.add(option);
				//html_select2.add(option2);

				//Discover any other devices available to the application
				BrowserPrint.getLocalDevices(function(device_list){
					for(var i = 0; i < device_list.length; i++)
					{
						//Add device to list of devices and to html select element
						var device = device_list[i];
						if(!selected_device || device.uid != selected_device.uid)
						{
							devices.push(device);
							var option = document.createElement("option");
							option.text = device.name;
							option.value = device.uid;
							var option2 = document.createElement("option");
							option2.text = device.name;
							option2.value = device.uid;
							html_select.add(option);
							//html_select2.add(option);

						}
					}

				}, function(){console.log("Error getting local devices")},"printer");

			}, function(error){
				//console.log("line 41: error-"+error);
			})
}
function getConfig(){
	BrowserPrint.getApplicationConfiguration(function(config){
		alert(JSON.stringify(config))
	}, function(error){
		alert(JSON.stringify(new BrowserPrint.ApplicationConfiguration()));
	})
}
function splitProductID(string, nb) {

	if (string != undefined) {
	 var array = string.split('-');
	 //return array[nb];
	 if (array[nb].indexOf('X') > 0) {
		return array[nb].replace('X', '') + ' in'
	 } else if (array[nb].indexOf('K') > 0) {
		return parseFloat(array[nb].replace('K', '.')) * 1000
	 } else if (array[nb].indexOf('M') > 0) {
		return parseInt(array[nb].replace('M', '')) * 3.28
	 }else {
		return array[nb]
	 }
	}
}
function writeToSelectedPrinter(coretag,ulinetag,orderCode,shiftTag,noOfPrints,customLabel,customerName,productId){
	selected_device = devices[0]; //set default printer
	var dataToWrite;
	var arrow = "";
	var noOfCopies = Number(noOfPrints) - 20;
	var rollWidthThicknessFootage = splitProductID(productId,2) + "MM " + Number(splitProductID(productId,3)) + "GA " + splitProductID(productId,4) + "'";
	if (noOfCopies == 0){noOfCopies = 2;}else{noOfCopies = (noOfCopies/2) + 20;}
	
	var noOfRolls = 0;
	let ml = shiftTag.substr((shiftTag.length - 1),1); 
console.log(ml);
		if(customLabel == 'Uline'){ //uline

			dataToWrite = "^XA"+
								"^PQ"+ noOfCopies +
								"^CFA,30"+
								"^FO"+((coretag.length > 6) ? 90 : 98)+",45^A0N48,48^FD"+coretag+"^FS"+
								"^FO95,90^A0N24,24^FDMADE IN CANADA^FS"+
								"^FO110,113^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,^FS"+
								"^FO230,113^A0N20,20^FD22^FS"+
								"^FO98,135^A0N28,28^FD"+ulinetag+"^FS"+
								"^FO"+((orderCode.length > 11) ? 95 : 115)+",165^A0N26,26^FD"+orderCode+"^FS"+   //95 for osc1
								"^FO108,190^A0N22,22^FD"+shiftTag+"^FS"+
								"^FO"+((coretag.length > 6) ? 490 : 498)+",45^A0N48,48^FD"+coretag+"^FS"+
								"^FO495,90^A0N24,24^FDMADE IN CANADA^FS"+
								"^FO510,113^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,^FS"+
								"^FO630,113^A0N20,20^FD22 ^FS"+
								"^FO498,135^A0N28,28^FD"+ulinetag+"^FS"+
								"^FO"+((orderCode.length > 11) ? 495 : 515)+",165^A0N26,26^FD"+orderCode+"^FS"+   //495 for osc1
								"^FO508,190^A0N22,22^FD"+shiftTag+"^FS"+
								"^XZ";

	  }else if(customLabel == 'Custom'){

			if(customerName.toUpperCase().indexOf('MORRIS') > -1){
				dataToWrite = "^XA"+
							"^PQ"+ noOfCopies +
							"^CFA,30"+
							"^FO75,50^A0N42,42^FD"+coretag+"^FS"+
							"^FO115,90^A0N24,24^FDMADE IN CANADA^FS"+
							"^FO135,115"+
							"^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,"+
							"^FS"+
							"^FO250,115^A0N20,20^FD22 ^FS"+
							"^FO95,138^A0N28,28^FD"+rollWidthThicknessFootage+"^FS"+
							"^FO"+((orderCode.length > 11) ? 110 : 135)+",167^A0N28,28^FD"+orderCode+"^FS"+
							"^FO130,195^A0N22,22^FD"+shiftTag+"^FS"+
							"^FO470,50^A0N42,42^FD"+coretag+"^FS"+
							"^FO515,90^A0N24,24^FDMADE IN CANADA^FS"+
							"^FO535,115"+
							"^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,"+
							"^FS"+
							"^FO650,115^A0N20,20^FD22 ^FS"+
							"^FO495,138^A0N28,28^FD"+rollWidthThicknessFootage+"^FS"+
							"^FO"+((orderCode.length > 11) ? 510 : 535)+",167^A0N28,28^FD"+orderCode+"^FS"+
							"^FO530,195^A0N22,22^FD"+shiftTag+"^FS"+
							"^XZ";
			}else{
				var dateToday = new Date();
				dataToWrite = "^XA"+
								"^PQ"+ noOfCopies +
								"^CFA,30"+
								"^FO80,40^A0N24,24^FD15312077PACKSYS MEXICO^FS"+
								"^FO175,65^A0N24,24^FDSA DE CV.^FS"+
								"^FO125,90^A0N28,28^FDGCAS: 90852754^FS"+
								"^FO80,120^A0N30,30^FDLOTE-"+coretag+"^FS"+
								"^FO95,150^A0N24,24^FDFETCHA DE PRODUCTION^FS"+
								"^FO150,175^A0N28,28^FD"+dateToday.toLocaleDateString().replace(/(^|\D)(\d)(?!\d)/g, '$10$2')+"^FS"+
								"^FO175,200^A0N24,24^FD"+orderCode.replace('ORD','')+"^FS"+

								"^FO480,40^A0N24,24^FD15312077PACKSYS MEXICO^FS"+
								"^FO575,65^A0N24,24^FDSA DE CV.^FS"+
								"^FO525,90^A0N28,28^FDGCAS: 90852754^FS"+
								"^FO480,120^A0N30,30^FDLOTE-"+coretag+"^FS"+
								"^FO495,150^A0N24,24^FDFETCHA DE PRODUCTION^FS"+
								"^FO550,175^A0N28,28^FD"+dateToday.toLocaleDateString().replace(/(^|\D)(\d)(?!\d)/g, '$10$2')+"^FS"+
								"^FO575,200^A0N24,24^FD"+orderCode.replace('ORD','')+"^FS"+

								"^XZ";
				
			}
			


		}else{
			dataToWrite = "^XA"+
							"^PQ" + noOfCopies +
							"^CFA,30"+
							"^FO75,55^A0N42,42^FD"+coretag+"^FS"+
							"^FO125,95^A0N24,24^FDMADE IN CANADA^FS"+
							"^FO140,120^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,^FS"+
							"^FO255,119^A0N20,20^FD22 ^FS"+
							"^FO"+((orderCode.length > 11) ? 80 : 120)+",143^A0N34,34^FD"+orderCode+"^FS"+   // 75 FOR OSC1
							"^FO135,175^A0N22,22^FD"+shiftTag+"^FS"+
							"^FO475,55^A0N42,42^FD"+coretag+"^FS"+
							"^FO525,95^A0N24,24^FDMADE IN CANADA^FS"+
							"^FO540,120^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,^FS"+
							"^FO655,119^A0N20,20^FD22 ^FS"+
							"^FO"+((orderCode.length > 11) ? 480 : 520)+",143^A0N34,34^FD"+orderCode+"^FS"+ //475 FOR OSC1
							"^FO535,175^A0N22,22^FD"+shiftTag+"^FS"+
							"^XZ";
		}

//console.log(dataToWrite);
selected_device.send(dataToWrite, undefined, errorCallback);

	//send log
	$.ajax({
			url: 'https://script.google.com/macros/s/AKfycbyfyv_0mWpNkMTTsaXCxR6NGYRVPJHhaMq1758jfk76krsWhLE/exec',
			type: 'get',
			dataType: 'json',
			data: {
				'document_type':'coretags',
				'noOfCopies':noOfCopies,
				'orderNumber':orderCode,
				'Operator':shiftTag
			},
			success: function(data) {
				console.log("print logged.");
			}
	});
}

var readCallback = function(readData) {
	if(readData === undefined || readData === null || readData === "")
	{
		alert("No Response from Device");
	}
	else
	{
		alert(readData);
	}

}
var errorCallback = function(errorMessage){
	alert("Error: " + errorMessage);
}
function readFromSelectedPrinter()
{

	selected_device.read(readCallback, errorCallback);

}
function getDeviceCallback(deviceList)
{
	alert("Devices: \n" + JSON.stringify(deviceList, null, 4))
}

function sendImage(imageUrl)
{
	url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
	url = url + "/" + imageUrl;
	selected_device.sendUrl(url, undefined, errorCallback)
}
function sendImageHttp(imageUrl)
{
	url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
	url = url + "/" + imageUrl;
	url = url.replace("https", "http");
	selected_device.sendUrl(url, undefined, errorCallback)
}
function onDeviceSelected(selected)
{
	for(var i = 0; i < devices.length; ++i){
		if(selected.value == devices[i].uid)
		{
			selected_device = devices[i];
			return;
		}
	}
}

window.onload = setup;
