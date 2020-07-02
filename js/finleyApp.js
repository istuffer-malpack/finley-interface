var machineLines = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4', 'LINE 5', 'LINE 6', 'LINE 7', 'LINE 8', 'LINE 9'];
var productionSummary = [], summaryByProductdata = [], qcDataSource = [], qualityIssues = [];				
var app = angular.module("app", []);
app.factory("overviewService", function($http) {
  var service = {};
  var gUrl = "https://script.google.com/macros/s/AKfycbzyStkxfw6osBed6WLbQrdDjv60ukrqxZha1GNnBry3enVXZz88/exec?id=1X9U7ZHQcm6XW6C7qvPOFSVG2YU8qvN-q-Gt2Q_50yT4&sheet=";

  service.getAllOrders = function() {
    return $http.get(gUrl + "schedData");
  };
  
  service.getAllQcData = function() {
    return $http.get(gUrl + "qcData");
  };
  
   service.getProductSummaryData = function() {
    return $http.get(gUrl + "summaryproduction");
  };
  
  service.getDefectsData = function(id) {
    return $http.get(gUrl + "quality_issues");
  };
  
  service.getLineInfoData = function(){
	  return $http.get(gUrl + "MachineCapacity");
  };
  
  service.getMessages = function(){
	  return $http.get(gUrl + "messages");
  };

  return service;
});

app.directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
    };
}).controller("overviewController", [ "$scope","$log","$interval","$timeout","$http","$filter","overviewService",
	
	function($scope, $log, $interval, $timeout, $http, $filter, overviewService) {
		var init = function() {
			$scope.loading = true;
			$scope.schedule;
			$scope.linen = machineLines[0];
			$scope.user = localStorage.shift;
			$scope.productId;
			$scope.qcData;
			$scope.messages;
			$scope.defectsD;
			$scope.totalProduction;
			$scope.summaryByProductdata;
			$scope.keyword;
			$scope.currentTime = new Date();
			var sdate = $scope.currentTime;
			$scope.weekAgo = sdate.setDate(sdate.getDate() - 7);
			$scope.yr = "20"; //sdate.getFullYear().toString().substr(2,2);
			$scope.coretag;
			$scope.ulinetag;
			$scope.orderCode;
			$scope.noOfPrints;
			$scope.linenumber;
			$scope.isUline;
			$scope.skidIdFrom;
			$scope.skidIdTo;
		
			$scope.getOrders = function(){
				overviewService.getAllOrders().then(
					function successCallback(response) {
						$scope.schedule =  response.data.records;	
							$scope.loading = false;			
					},
					function errorCallback(response) {
						$log.log("Error");
					}
				);		  
			};
	  
			$scope.machineLine = machineLines; 
			
			$scope.getQC = function(){
				   overviewService.getAllQcData().then(
					function successCallback(response) {
					  $scope.qcData = response.data.records;					 
					},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			};
			
			$scope.getLineInfo = function(){
			   overviewService.getLineInfoData().then(
				function successCallback(response) {
					$scope.lineData = response.data.records;		 
					productionSummary = $scope.lineData;
				},
				function errorCallback(response) {
				  $log.log("Error");
				}
			  );
			};
	  
			$scope.summaryByProduct = function(){
				overviewService.getProductSummaryData().then(
					function successCallback(response) {
						$scope.summaryByProductdata =  response.data.records;
						summaryByProductdata= $scope.summaryByProductdata;					 
					},
					function errorCallback(response) {
					  $log.log("Error");
					}
				);
			};

			$scope.getMessage = function() {
				overviewService.getMessages().then(
					function successCallback(response) {
						$scope.messages = response.data.records.filter(function(results) { return (results.Timestamp != '')});			 
					},
					function errorCallback(response) {
						$log.log("Error");
					}
				);
			};
			
			$scope.getDefectData = function(){
				overviewService.getDefectsData().then(
					function successCallback(response) {
						$scope.defectsD = response.data.records; //.filter(function(results) { return (results.MACHINE != '') });
						qualityIssues = $scope.defectsD;
					},
					function errorCallback(response) {
					  $log.log("Error");
					}
				);
			};
			
			
			$scope.$watch('schedule', function(newValue, oldValue, scope) {
				return $scope.schedule;
			}, true);
			$scope.$watch('qcData', function(newValue, oldValue, scope) {
				return $scope.qcData;
			}, true);
			
			$scope.getOrders();
			$scope.getQC();
			$scope.getMessage();
			$scope.getDefectData();
			$scope.getLineInfo();
			$scope.summaryByProduct();	
					
			$interval(function() {$scope.getOrders();}, 60 * 1000); 
			$interval(function() {
				$scope.getQC();				
				$scope.getDefectData();
				$scope.getLineInfo();
				$scope.summaryByProduct();
				drawChart2();drawChart();
			}, 5 * 60 * 1000); 
				
			$scope.populateJO = function(data) {
				$scope.currentTime = new Date();
				$scope.currentOrder = data;			
				$scope.coretag = (data.CUSTOMERID == 'ULINE' || data.CUSTOMERID == 'ULINEC') ? ulineCode[data.PRODUCT_ID] : getCoreTag(data.PRODUCT_ID,data.SKID_QTY);
				$scope.ulinetag = (data.CUSTOMERID == 'ULINE' || data.CUSTOMERID == 'ULINEC') ? getCoreTag(data.PRODUCT_ID,data.SKID_QTY) : '';
				
				document.querySelector('.recipe').innerHTML = '<table style="margin: 0 auto;"><tbody>'+data.RECIPECODE+'</tbody></table>';
						
				var modal = document.getElementById("jobOrderModal");
				modal.style.display = "block";
			};
			
			$scope.filmType = function(desc) {
				if (desc != undefined) {
				 if (desc.indexOf('MACHINE') > 0) {
				  return 'Machine Film'
				 } else if (desc.indexOf('CONVERSION') > 0) {
				  return 'Master Roll Film'
				 } else {
				  return 'Hand Film'
				 }
				}
			};
			
			$scope.splitProduct = function(string, nb) {

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
			};
			
			$scope.showCoreTagModal = function(prodID,qty,custid,ordernum,nPrints,lineNumber){
				$scope.currentTime = new Date();
				prodID = prodID.toUpperCase();
				custid = custid.toUpperCase();
				$scope.coretag = (custid == "ULINEC" || custid == "ULINE") ? ulineCode[prodID] : getCoreTag(prodID,qty);
				$scope.ulinetag = (custid == "ULINEC" || custid == "ULINE") ? getCoreTag(prodID,qty) : "";				
				$scope.isUline = (custid == "ULINEC" || custid == "ULINE") ? true : false;
				var suffix = ((prodID.split("-")[5]).indexOf('00') > -1 || (prodID.split("-")[5]).indexOf('Q0') > -1 || (prodID.split("-")[5]).indexOf('C0') > -1 || (prodID.split("-")[5]).indexOf('P0') > -1 || (prodID.split("-")[5]).indexOf('N0') > -1) ? "" : prodID.split("-")[5]
				
				$scope.orderCode = "ORD"+ordernum.toString().toLowerCase().replace("ord","") +""+suffix;
				$scope.noOfPrints = parseInt(nPrints) + 20;
				$scope.linenumber = (lineNumber == undefined) ? $scope.linen : lineNumber;
				
				var modal = document.getElementById("coreTagPrint");
				modal.style.display = "block";
			
			};		

			$scope.printCoreTagLabel = function(coretag,ulinetag,orderCode,noOfPrints,linenum,isUline){
				//$scope.currentTime = new Date();
				var shiftTag = $scope.currentTime.toLocaleTimeString() + ' ' + ((localStorage.shift).split("/")[1]).replace("Shift ","") + '00' + linenum.replace("LINE ","");
				//writeToSelectedPrinter(coretag,order,shift,noOfCopies,prodid,cust){
				writeToSelectedPrinter(coretag,ulinetag,orderCode,shiftTag,noOfPrints - 20,isUline);
			};
			
			$scope.printLabelCTag = function(prod_id,ordnum,totalSkid,noOfPrint,lineNumber){
				
				//check if uline
				var isUline = document.getElementById('isUline').checked;
				var custID = (isUline) ? "ULINE" : "";
				
				//close modal
				closeModal('printLabelCoretag');
				
				//show print modal
				$scope.showCoreTagModal(prod_id,totalSkid,custID,ordnum,noOfPrint,lineNumber,isUline);
				
			};
			
			$scope.printBC = function(skidnumber,prodid,qty){			
					prodid = prodid.toUpperCase();				
				if(skidnumber.length > 0){					
					var skidIdFrom = skidnumber.split(",")[0];
					var skidIdTo = skidnumber.split(",")[(skidnumber.split(",")).length - 1];
					var txt;
					var r = confirm("The following barcodes from "+ skidIdFrom + " to "+ skidIdTo +" will be printed. \nPress OK to confirm.");
					if (r == true) {
					  printBarcode(skidnumber,prodid,qty);
					} else {
					  txt = "You pressed Cancel!";
					}					
					
				}else{					
					$scope.productId = prodid;
					var modal = document.getElementById('skidTagPrint');
					$('.bc-form input').val('');
					modal.style.display = "block";					
				}
			
			};
			
			
			$scope.printBarcodeOverwrite = function(skidnumbers,prodid){
				prodid = prodid.toUpperCase();
				if(skidnumbers == undefined || skidnumbers == ''){
					alert('Please enter barcode ids to print...');
					
				}else{								
													
						var skidIDS = new Array();
						var skidnumberArray = skidnumbers.split(';');				
						
							for(var i=0;i<skidnumberArray.length;i++){							
								
								if(skidnumberArray[i].indexOf('-') > -1){
									
									var skidWithDash = skidnumberArray[i].split('-');						
									var count = (parseInt(skidWithDash[1]) - parseInt(skidWithDash[0])) + 1;
									var start = parseInt(skidWithDash[0]);
									
									for(var j=0;j<count;j++){							
										skidIDS.push(start + j);
									}			
									
								}else{								
									skidIDS.push(parseInt(skidnumberArray[i]));								
								}						
							}
							//console.log(skidIDS.join(','));
							var skidIDdta = (skidIDS.length == 1) ? skidIDS.toString() : skidIDS.join(',');
							printBarcode(skidIDdta,prodid,skidIDS.length);
						
				}
			};
			
			
			//printLabel(x.CUSTOMERNAME,x.PRODUCT_DESCRIPTION,x.SKID_QTY,x.UOM,x.ORDER_PO_NUMBER,prodic)
			$scope.printLabel = function(custname,proddesc,noOfskids,qty,uom,ponum,productid){
				productid = productid.toUpperCase();
				$('#printLabel').html('');
				var  htmlContent ='';
				
				if(proddesc == undefined || proddesc == ''){
					proddesc = productDescription[productid];
				}
				var test = proddesc.slice(0, proddesc.lastIndexOf('('));				
							
				var p = test.substring(test.indexOf('('),test.indexOf(')')+1); //remove second ();
				
				var pp = test.substring(0,test.indexOf('FILM') + 4);
				
				if(test.indexOf('FILM') <= -1){
					pp = test.substring(0,test.indexOf('CORE') + 4);
				}
				
				var ppp = test.replace(p,"").replace(pp,"").replace(/#PLBL/g,"").replace(/#1INCORE/g,"").replace(/STD/g,"");
				
				var pt = productid.slice(0,4);
				var ctag = getCoreTag(productid,noOfskids);
				var utag = ulineCode[productid];
				
				switch (pt){
					case 'AX-M':
						
						for(var i=0;i<noOfskids;i++){					
							htmlContent += '<div class="container">'+
												'<div class="product-logo"><img src="./img/'+pt+'.jpg" alt=""/></div>'+
												'<div class="costumer">'+
													'<h1>'+custname+'</h1>'+
												'</div>'+
												'<div class="product">'+
													'<p>'+ppp+'</p>'+
												'</div>'+										
												'<div class="made">'+										
													'<div class="">'+
														'<p class="qty">'+(qty/noOfskids) +' '+ uom +'S/SKID</p>'+
													'</div>'+
													'<div class="lot-box">'+
														'<h5>Lot Number:</h5>'+
														'<h4>'+ctag+  '<span class="yrcode">'+$scope.yr+'</span></h4>'+
													'</div>'+
													'<div>'+
														'<p class="po">P.O.# '+ponum+'</p>'+						
														'<p class="madeincanada">MADE IN CANADA</p>'+
													'</div>'+											
													'<div class="footer"><img src=\"./img/AX-FOOTER.jpg\"/></div>'+
													'<div class="counter">'+
														'<span>'+(i+1)+'</span>'+
														'<span>'+noOfskids+'</span>'+
													'</div>'+										
												'</div>'+										
											'</div>';
						}		
						paperColor = 'blue';							
						break;
						
					case 'PL-M':
						
						for(var i=0;i<noOfskids;i++){					
							htmlContent += '<div class="container">'+
												'<div class="product-logo"><img src="./img/'+pt+'.jpg" alt=""/></div>'+
												'<div class="costumer">'+
													'<h1>'+custname+'</h1>'+
												'</div>'+
												'<div class="product">'+
													'<p>'+ppp+'</p>'+
												'</div>'+										
												'<div class="made">'+										
													'<div class="">'+
														'<p class="qty">'+(qty/noOfskids) +' '+ uom +'S/SKID</p>'+
													'</div>'+
													'<div class="lot-box">'+
														'<h5>Lot Number:</h5>'+
														'<h4>'+ctag+  '<span class="yrcode">'+$scope.yr+'</span></h4>'+
													'</div>'+
													'<div>'+
														'<p class="po">P.O.# '+ponum+'</p>'+						
														'<p class="madeincanada">MADE IN CANADA</p>'+
													'</div>'+											
													'<div class="footer"><img src=\"./img/AX-FOOTER.jpg\"/></div>'+
													'<div class="counter">'+
														'<span>'+(i+1)+'</span>'+
														'<span>'+noOfskids+'</span>'+
													'</div>'+										
												'</div>'+										
											'</div>';
						}		
						paperColor = 'green';
						break;
						
					case 'PR-M':
						
						if(proddesc.indexOf('MAX 80') > -1){pt += '80';}
					
						for(var i=0;i<noOfskids;i++){					
							htmlContent += '<div class="container">'+
												'<div class="product-logo"><img src="./img/'+pt+'.jpg" alt=""/></div>'+
												'<div class="costumer">'+
													'<h1>'+custname+'</h1>'+
												'</div>'+
												'<div class="product">'+
													'<p>'+ppp+'</p>'+
												'</div>'+										
												'<div class="made">'+										
													'<div class="">'+
														'<p class="qty">'+(qty/noOfskids) +' '+ uom +'S/SKID</p>'+
													'</div>'+
													'<div class="lot-box">'+
														'<h5>Lot Number:</h5>'+
														'<h4>'+ctag+  '<span class="yrcode">'+$scope.yr+'</span></h4>'+
													'</div>'+
													'<div>'+
														'<p class="po">P.O.# '+ponum+'</p>'+						
														'<p class="madeincanada">MADE IN CANADA</p>'+
													'</div>'+											
													
													'<div class="counter">'+
														'<span>'+(i+1)+'</span>'+
														'<span>'+noOfskids+'</span>'+
													'</div>'+										
												'</div>'+										
											'</div>';
						}		
						paperColor = 'yellow';
					break;
					
					default:
						
						if(utag == undefined || utag == ''){
							if(pt == "VX-H"){
								for(var i=0;i<noOfskids;i++){					
									htmlContent += '<div class="container">'+
														'<div class="product-logo" style="text-align:center; font-size: 120px;font-weight:700;line-height:1.1;">FULLER ROAD</div>'+
														
														'<div class="product">'+
															'<p style="font-size:85px;">'+ppp.replace("CONVERSION ROLL ","")+'</p>'+
														'</div>'+										
														'<div class="made">'+															
															'<div class="">'+
																'<p style="font-size: 85px;">'+ordernumber+'</p>'+
																'<p class="big" style="font-size:65px; line-height:1.1;">VMAXX HAND FILM</p>'+
																'<p class="big" style="font-size:65px; line-height:1.1;">CONVERSION ROLLS</p>'+
															'</div>'+														
															'<div>'+
																'<p class="qty">'+(qty/noOfskids) +' '+ uom +'S/SKID</p>'+																					
																
															'</div>'+													
															'<div class="counter down">'+
																'<span>'+(i+1)+'</span>'+
																'<span>'+noOfskids+'</span>'+
															'</div>'+										
														'</div>'+										
													'</div>';
								}
								
							}else{							
								for(var i=0;i<noOfskids;i++){					
									htmlContent += '<div class="container">'+
														'<div class="product-logo"><img src="./img/'+pt+'.jpg" alt=""/></div>'+
														'<div class="costumer">'+
															'<h1>'+custname+'</h1>'+
														'</div>'+
														'<div class="product">'+
															'<p>'+ppp+'</p>'+
														'</div>'+										
														'<div class="made">'+
															'<div class="lot-box middle '+ ((pt.indexOf("H") > -1) ? "no-lot-box" : "") +'">'+
																'<h5>Lot Number:</h5>'+
																'<h4>'+ctag+  '<span class="yrcode">'+$scope.yr+'</span></h4>'+
															'</div>'+
															'<div class="">'+
																'<p class="po">P.O.# '+ponum+'</p>'+
															'</div>'+														
															'<div>'+
																'<p class="qty">'+(qty/noOfskids) +' '+ uom +'S/SKID</p>'+																					
																'<p class="madeincanada">MADE IN CANADA</p>'+
															'</div>'+													
															'<div class="counter">'+
																'<span>'+(i+1)+'</span>'+
																'<span>'+noOfskids+'</span>'+
															'</div>'+										
														'</div>'+										
													'</div>';
								}
							}
							
							
						}else{							
														
							for(var i=0;i<noOfskids;i++){					
									htmlContent += '<div class="container">'+
														'<div class="product-logo" style="font-size:200px;font-size: 200px;font-weight:700;line-height:1;padding:0;line-height:.8;">'+utag+'</div>'+
														'<div class="costumer">'+
															'<h1 style="font-size:82px;line-height:1.1;">'+ppp+'</h1>'+
														'</div>'+
														'<div class="">'+
															'<p class="h2" style="font-size:58px;">MADE IN CANADA</p>'+
														'</div>'+										
														'<div class="made">'+
															'<div class="lot-box middle '+ ((pt.indexOf("H") > -1) ? "no-lot-box" : "") +'">'+
																'<h5>Lot Number:</h5>'+
																'<h4>'+ctag+  '<span class="yrcode">'+$scope.yr+'</span></h4>'+
															'</div>'+
															'<div class="">'+
																'<p class="po">P.O.# '+ponum+'</p>'+
															'</div>'+														
															'<div>'+																																				
																'<p class="big">'+
																	'<img class="uline-barcode barcode" />'+
																'</p>'+
															'</div>'+													
															'<div class="counter">'+
																'<span>'+(i+1)+'</span>'+
																'<span>'+noOfskids+'</span>'+
															'</div>'+										
														'</div>'+										
													'</div>';
								}
							
							
						}
					
						paperColor = 'white';
				}
								
					$('#printLabel').append(htmlContent);	

						if(utag != undefined || utag != ''){
							JsBarcode(".uline-barcode.barcode", utag, {format: "code128",font: "arial",fontSize: 40,textMargin: 0,text: "",height:80,displayValue: false});
						}
										
					setTimeout(function(){	
						alert('REMINDER: Make sure you insert '+paperColor+' paper before you hit the print button.');
						$('#printLabel').printElem('skidLabel',0,0,localStorage.shift,""); 	
							
					},800);
				
			
			};
			
			//autocomplete			
			$scope.datalist = productList;
			
			$scope.showChart = function(line){		 
		 
				var keyw = productionSummary[parseInt(line.replace('LINE ','')) - 1].KEYWORD;	
				
				qcDataSource = $scope.qcData.filter(function(results) { return (results.KEYWORD == keyw && results.LINE == line)});		
				drawChart2();drawChart();
			};	
			
			$scope.ulCode = function(prod){
				return ulineCode[prod];
			};
			
			$scope.addMessage = function() {

			$scope.errortext = "";
			if (!$scope.addMe) {
			 return;
			}
			if ($scope.messages.indexOf($scope.addMe) == -1) {
			 var d = new Date();
			 $scope.messages.push({
			  'Timestamp': d.toISOString(),
			  'Message': $scope.addMe,
			  'Operator': localStorage.shift
			 });
			 //send message to google sheets				
			 var dataUrl = "https://script.google.com/macros/s/AKfycbza85RHYVyl8LGMN6lmqw_8AESHPZ5dVnqRnV00BQba24U4RRI/exec?Message=" +
			  $scope.addMe + "&Operator=" + localStorage.shift;

			 $http.get(dataUrl).then(function(response) {

			  if (response.data.result === 'success') {
			   //console.log("to write localstorage");	
				$('#MessageForm textarea').val("");
				closeModal('sendMessageForm');			   
			  }

			 });

			} else {
			 $scope.errortext = "Your message is already posted.";
			}

		};

	   $scope.removeItem = function(x) {
		$scope.errortext = "";
		$scope.messages.splice(x, 1);
	   };
			
			
	  };
	  init();
	}	
]);

function printBarcode(skidnumber,prodid,qty){
	var noOfCopies = 0;
	var orderNumber = '';	
	$('#printSkids').html('');	
	var skidIDs = new Array();
		skidIDs = (skidnumber.split(',')).filter((v, i, a) => a.indexOf(v) === i);
		
		for(var i=0;i<qty;i++){					
						
			htmlContent = '<div class="bc-div" style="width: 100%;display:block;">'+
							'<p class="bcodelabel" style="width:100%;">'+
								'<span style="float:left;margin-left:5px;">'+skidIDs[i]+'</span>'+
								'<span style="float:right;margin-right:-58px;">'+prodid.replace(/-/g,"")+'</span>'+
							'</p>'+
							'<img class="barcode'+skidIDs[i]+' barcode" style="display:block;margin:0 auto;width:110%;position:relative;top:-8px;"/>'+
							'<p style="width:100%;text-align:center;margin: 10px 0 0 50px;color: #000;font-size: 32px;line-height: 1.25rem;font-family: arial;font-weight: 400;">MADE IN CANADA</p>'+
							'<p style="width:100%;text-align:right;margin-top:180px;color: #000;font-size:40px;font-family: arial;font-weight:700;margin-bottom:0;padding-bottom:30px;">'+
								(i + 1)+' of '+ qty +'</p>'+
							'</div>';				  
								
							
			$('#printSkids').append(htmlContent);

				JsBarcode(".barcode"+skidIDs[i], skidIDs[i], 
							{
								format: "code39",
								font: "arial",
								fontSize: 35,
								textMargin: 0,
								text: skidIDs[i],
								width: 10,
								height: 250,
								displayValue: false	
							});							
		}
			noOfCopies = skidIDs.length;
			var test = 'skidTags1';
			if(noOfCopies > 1){
				test = 'skidTags';
			}
			
			setTimeout(function(){
					
				$('#printSkids').printElem(test,noOfCopies,orderNumber,localStorage.shift,"skidTagPrint")
				
				},1000);
	
}


jQuery.fn.extend({
 printElem: function(a,b,c,d,e) {
  var cloned = this.clone();
  var printSection = $('#printSection');
  if (printSection.length == 0) {
   printSection = $('<div id="printSection" class="container1"></div>');
   $('body').append(printSection);
  }
  printSection.append(cloned);
  var toggleBody = $('body *:visible');
  toggleBody.hide();
  $('#printSection, #printSection *').show();
  
  //append css
  
	var css = '@page { size: 8.5in 11in;margin:15mm 15mm;}body{background: #ffffff!important;color:#000!important;width:785px;height: 980px;page-break-after: avoid;page-break-before: avoid;}.container.job-order-form{width:130%!important;display:block;}.recipe{margin: 0px auto;}',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
	 
	 if(a == 'skidTags'){ 
		css = '@page { size: 11in 8.5in; margin-top: 5.5cm;}body{background: #ffffff!important;width:920px;height: 625px;}';
	 }else if(a == 'skidTags1'){ 
		css = '@page { size: 11in 8.5in; margin-top: 3.5cm;}body{background: #ffffff!important;width:920px;height: 600px;}';
	 }else if(a == 'skidLabel'){
		 css = '@page { size: 11in 8.5in;margin:10mm 15mm;}body{background: #ffffff!important;width:980px;height: auto;color:#000;font-family:"Times New Roman"!important;}'+
				'.container1 *{margin:0;padding:0;}.container1{width:100%;font-weight:600;text-align:center;padding:15px 0 0;margin:0;page-break-inside:avoid;}'+
				'.costumer{margin-bottom: 25px;}h1{font-size:72px;line-height:1.1;text-transform:uppercase;font-weight:700;margin-top:15px;}'+
				'.product p{font-size:80px;line-height:1.1;margin-bottom: 30px;}.po{font-size:65px;}.made{position:relative;}.qty{font-size: 60px;line-height:1.1;margin-top:25px;}'+
				'.made .madeincanada{font-size: 36px;margin-top:-15px;}.made .counter{position:absolute;right: -45px;top: 50px;}.counter.down{top:100px;margin-bottom:20px;}'+
				'.lot-box{position:absolute; left:0;top:50px;padding:10px; text-align:center; border-style: double; }.lot-box.middle{position:relative;top:-20px;margin: 15px auto 0;width: 250px;}.lot-box.middle.no-lot-box{display:none;}'+
				'.h2{font-size:55px;font-weight:700;margin:0}h5{font-weight:700;font-size: 1.5em;}h4{font-weight:700;font-size:1.75em;margin:10px;}h5 span{padding-left:10px}'+
				'.product-logo{padding-top:0px}.product-logo img{height:120px;width:90%;display:block;margin:-15px auto 5px}'+
				'.footer img{height:80px;display:block;margin:50px auto 0;width:75%;}.yrcode{margin-left: 25px;}.big{font-size:50px;font-weight:700;margin:0}'+
				'.counter span{display:block;padding:10px 50px;font-size:50px;border:1px solid #000;}.counter span+span{margin-top:-1px;}'+
				'.underlined{text-decoration: underline;}';
	 }

	style.type = 'text/css';
	style.media = 'print';

	if (style.styleSheet){
	  style.styleSheet.cssText = css;
	} else {
	  style.appendChild(document.createTextNode(css));
	  
	} 
	
	head.appendChild(style);  
	window.print();  
	printSection.remove();  
	toggleBody.show();
  
	window.onafterprint = function(event) { 
	//console.log("done");
	if(a == 'skidTags'){
		//logPrint(a,b,c,d,e);	
	}		
	};
	
	//var modal = document.getElementById("skidTagPrint");
		//modal.style.display = "none";	
  
 }

});




var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}
/* Open when someone clicks on the span element */
function openNav(ele) {
  document.getElementById(ele).style.width = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav(ele) {
  document.getElementById(ele).style.width = "0%";
}
	
	var printEvent = window.matchMedia('print');
	printEvent.addListener(function(printEnd) {
		if (!printEnd.matches) {
			closeModal("skidTagPrint");
		};
	});
		
	function showReport(div){
		var s = document.getElementById(div);
		var a = document.getElementById('axis');
		var pl = document.getElementById('platinum');
		var pr = document.getElementById('promax');
		var st = document.getElementById('stretchmax');
		a.style.display = "none";
		pl.style.display = "none";
		pr.style.display = "none";
		st.style.display = "none";
		s.style.display = "block";
		showModal('customerReturn');
	}	
function showMessage(ele){
		var user = $(ele).find('h6').html();
		var message = $(ele).find('p').html();
		$('#fromUser').empty().html(user);
		$('#messagebody').empty().html(message);
	
		showModal('showMessage');
		
	}
	function checkedRadio(element_id){
	
		//var ele = document.getElementById(element_id);
		//ele.checked = true;		
		$('#'+element_id).parent().find('input[type="radio"]').removeClass('checked').removeAttr('checked','checked');
		$('#'+element_id).addClass('checked').attr('checked','checked');
		
		
	}

// Get the modal
var modal = document.getElementById("myModal");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

function showModal(ele){
	var modal = document.getElementById(ele);
	modal.style.display = "block";
}

	function closeModal(ele) {
		var modal = document.getElementById(ele);
		modal.style.display = "none";
		$('.reset').val('');
		$('textarea').val('');
		document.getElementById('isUline').checked = false;
		
	}
	
	function windowOnClick(event) {
		var ele = event.target.id;
		//alert(ele);
		event.preventDefault();
		if(ele == 'jobOrderModal' || ele == 'skidTagPrint' || ele == 'scheduleModal' || ele == 'printLabelBarcode' || ele == 'printLabelTags' || ele == 'printLabelCoretag' || ele == 'qualityChart' || ele == 'scrapReportForm' || 
			ele == 'sendMessageForm' || ele == 'customerReturn' || ele == 'showMessage' || ele == 'dailyChecklistForm' || ele == 'dailyChecklistReport' || ele == 'printLabelCoretag' || ele == 'coreTagPrint'){				
				closeModal(ele);
		}
		
		
	}
	window.addEventListener("click", windowOnClick);
	
	
//toggle switch
function toggleswitch() {
	
  var checkbox = document.getElementById('isUline');
  //console.log(checkbox.checked);
  if(checkbox.checked){
	  checkbox.checked = false;
  }else{
	  checkbox.checked = true;
  }

  
}	
$( ".formSubmit" ).click(function( event ) {
 
  event.preventDefault();
  $('.error-alert').css("display","none");
 // $('#scrapForm').submit();
  $.ajax({
        url: 'https://script.google.com/macros/s/AKfycby2jBsN1OLqXDBbbHpwXETQDBQHiQA1kpxv6A0LTJfvF4Ce4G05/exec',
        type: 'get',
        dataType: 'json',
        data: $('#scrapForm').serialize(),
        success: function(data) {
			if(data.result === "success"){
				$('.submitted-alert').css("display","block");
				$('#scrapForm').trigger("reset");
				setTimeout(function(){$('#scrapReportForm .close').trigger('click');}, 2000);
				
			}else{
				$('.error-alert').css("display","block");
				//alert("Ooppsss... Something went wrong, please resubmit your entry.");
			}
        }
    }); 
});
$( ".sendMsg" ).click(function( event ) { 
 
  event.preventDefault();
 
 var message = $(this).prev().text();
  if(message != ""){
  $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbza85RHYVyl8LGMN6lmqw_8AESHPZ5dVnqRnV00BQba24U4RRI/exec',
        type: 'get',
        dataType: 'json',
        data: $('#MessageForm').serialize(),
        success: function(data) {
			
			$('#MessageForm textarea').val("");
			closeModal('sendMessageForm');
			
        }
    });
  }
  
});
	
$('input[type="checkbox"]').click(function(){	
	
	var checked = $(this).attr('checked');
	
	if(checked === undefined){
		$(this).attr('checked','checked');
		$(this).addClass('checked');
		$(this).parent().addClass('checkBoxChecked');
		
	}else{
		$(this).removeAttr('checked');
		$(this).removeClass('checked');
		$(this).parent().removeClass('checkBoxChecked');
	}		
	
});

function resetDailyChecklistForm(){
	$('#dailyChecklistForm input').removeAttr('checked').removeClass('checked');
	$('#dailyChecklistForm label').removeClass('checkBoxChecked');
	$('#dailyChecklistForm select, #dailyChecklistForm textarea, #dailyChecklistForm input[name="submitby"]').val('');
}

$('input[name="question6a"]').click(function(){$(this).next().trigger('click');});
$('input[name="question8a"]').click(function(){$(this).next().trigger('click');});

$( ".dailyChecklistFormSubmit" ).click(function( e ) { 
  e.preventDefault();
  $('.show-success-msg, .show-error-msg').css("display","none");
  //get values
  var line = $('#lineDropdown').find(':selected').val();
  var question6 = ($('input[name="question6"]').hasClass('checked')) ? $('input[name="question6a"].checked').val() : "";
  var question7 = ($('input[name="question7"]').hasClass('checked')) ? $('input[name="question7"]').val() : "";
  var question8 = ($('input[name="question8"]').hasClass('checked')) ? $('input[name="question8a"].checked').val() : "";
  var question9 = ($('input[name="question9"]').hasClass('checked')) ? $('input[name="question9"]').val() : "";
  var comment = $('textarea[name="comment"]').val();
  var submittedby = $('input[name="submitby"]').val();
  var shift = $('input[name="shift"]').val();
  var flagged = true;
  //console.log(line+" "+question6+" "+question7+" "+question8+" "+question9+" "+comment+" "+submittedby);  
	var data = "line="+line+"&q6="+question6+"&q7="+question7+"&q8="+question8+"&q9="+question9+"&comment="+comment+"&submittedby="+submittedby+"&shift="+shift;
	//if(line != '' && question6 != '', )
		if(question6 == undefined){
			alert('Please select Die/Lip, Cast Roll Cleaning whether it is "Scheduled" or "Quality Issue".');
			flagged = false;
		}
		if(question8 == undefined){
			alert('Please select changed blades whether it is "New Blades" or "Flipped".');
			flagged = false;
		}
		if(line == ''){
			alert('Please select machine line.');
			flagged = false;
		}
		if(submittedby == ''){
			alert('Please enter operator name.');
			flagged = false;
		}
		if(question6 == '' && question7 == '' && question8 == '' && question9 ==''){
			alert('Please at least one of the items to be reported.');
			flagged = false;
		}
		
	if(flagged){
		
		$.ajax({
			url: 'https://script.google.com/macros/s/AKfycbza85RHYVyl8LGMN6lmqw_8AESHPZ5dVnqRnV00BQba24U4RRI/exec?fromForm=checklist&'+data,
			type: 'get',
			dataType: 'json',
			success: function(data) {
				if(data.result === "success"){
					$('.show-success-msg').css("display","block");				
					setTimeout(function(){$('.show-success-msg').css("display","none");}, 5000);
					resetDailyChecklistForm();
				}else{
					$('.show-error-msg').css("display","block");				
					setTimeout(function(){$('.show-error-msg').css("display","none");}, 5000);
				}
			}
		});
		
	}
});
