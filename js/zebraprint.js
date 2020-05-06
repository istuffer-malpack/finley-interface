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
function writeToSelectedPrinter(coretag,ulinetag,orderCode,shiftTag,noOfCopies,isUline){
	selected_device = devices[0]; //set default printer
	
	var dataToWrite;	
	
	var arrow = "";
	if (noOfCopies == ''){noOfCopies = 2;}else{noOfCopies = (noOfCopies/2) + 20;}
	
		if(isUline){ //uline
					
			dataToWrite = "^XA"+
						"^PQ" + noOfCopies +
						"^CFA,30"+
						"^FO95,50^A0N46,46^FD"+coretag+"^FS"+
						"^FO90,90^A0N24,24^FDMADE IN CANADA^FS"+
						"^FO95,110"+
						"^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,"+
						"^FS"+
						"^FO220,112^A0N20,20^FD20 ^FS"+
						"^FO100,130^A0N28,28^FD"+ulinetag+"^FS"+
						"^FO110,160^A0N24,24^FD"+orderCode+"^FS"+
						"^FO95,185^A0N22,22^FD"+shiftTag+"^FS"+
						
						"^FO490,50^A0N46,46^FD"+coretag+"^FS"+
						"^FO485,90^A0N24,24^FDMADE IN CANADA^FS"+
						"^FO495,110"+
						"^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,"+
						"^FS"+
						"^FO620,112^A0N20,20^FD20 ^FS"+
						"^FO495,130^A0N28,28^FD"+ulinetag+"^FS"+
						"^FO505,160^A0N24,24^FD"+orderCode+"^FS"+
						"^FO490,185^A0N22,22^FD"+shiftTag+"^FS"+					
						"^XZ";	
		}else{
			dataToWrite = "^XA"+
						"^PQ" + noOfCopies +
						"^CFA,30"+
						"^FO75,55^A0N42,42^FD"+coretag+"^FS"+
						"^FO115,95^A0N24,24^FDMADE IN CANADA^FS"+
						"^FO140,120"+
						"^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,"+
						"^FS"+
						"^FO255,117^A0N20,20^FD20 ^FS"+
						"^FO110,140^A0N28,28^FD"+orderCode+"^FS"+
						"^FO120,170^A0N22,22^FD"+shiftTag+"^FS"+
						
						"^FO470,55^A0N42,42^FD"+coretag+"^FS"+
						"^FO515,95^A0N24,24^FDMADE IN CANADA^FS"+
						"^FO540,120"+
						"^GFA,195,195,13,L08M06M01,L0CM06M018,L0EM07M01C,L0FM078L01E,L0F8L07CL01F,0LFC0LFE01LF8,0LFE0MF03LFC,0MF0MF83LFE,0LFE0MF03LFC,0LFC0LFE03LF8,L0F8L07CL01F,L0FM078L01E,L0EM07M01C,L0CM06M018,L08M06M01,"+
						"^FS"+
						"^FO655,117^A0N20,20^FD20 ^FS"+
						"^FO510,140^A0N28,28^FD"+orderCode+"^FS"+
						"^FO520,170^A0N22,22^FD"+shiftTag+"^FS"+					
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
						//$('.close').trigger('click');
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