var machineLines = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4', 'LINE 5', 'LINE 6', 'LINE 7', 'LINE 8', 'LINE 9'];
var productionSummary = [], summaryByProductdata = [], qcDataSource = [], qualityIssues = [];
var app = angular.module("app", []);
app.factory("overviewService", function($http) {
  var service = {};
  var gUrl = "https://script.google.com/macros/s/AKfycby0ogE4p9Yj9Ke9OpZExmHB7silCuLW0McKcjFuYC76tHyhu4A/exec?sheet=";

  service.getAllOrders = function() {
    return $http.get(gUrl + "schedData");
  };

  service.getAllQcData = function() {
    return $http.get(gUrl + "QC_IMPORT");
  };

   service.getProductSummaryData = function() {
    return $http.get(gUrl + "summaryproduction");
  };

  service.getDefectsData = function(id) {
    //return $http.get(gUrl + "quality_issues");
  };

  service.getLineInfoData = function(){
	  return $http.get(gUrl + "MACHINE_DATA&endRow=10");
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
			$scope.customerID;
			$scope.qcData;
			$scope.messages;
			$scope.defectsD;
			$scope.totalProduction;
			$scope.summaryByProductdata;
			$scope.keyword;
			$scope.currentTime = new Date();
			var sdate = $scope.currentTime;
			$scope.weekAgo = sdate.setDate(sdate.getDate() - 7);
			$scope.yr = "21"; //sdate.getFullYear().toString().substr(2,2);
			$scope.coretag;
			$scope.ulinetag;
			$scope.orderCode;
			$scope.noOfPrints;
			$scope.linenumber;
			$scope.isUline;
			$scope.skidIdFrom;
			$scope.skidIdTo;
			$scope.ordnumber;
			$scope.noOfSkids;
			$scope.loadingInfo = true;
			$scope.showQcChart = false;
			$scope.customLabel = 'Standard';
			//$scope.yesterday = $scope.currentTime.setDate($scope.currentTime.getDate() - 1);
			
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
					$scope.loadingInfo = false;
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

			/* $scope.getDefectData = function(){
				overviewService.getDefectsData().then(
					function successCallback(response) {
						$scope.defectsD = response.data.records; 
						qualityIssues = $scope.defectsD;
					},
					function errorCallback(response) {
					  $log.log("Error");
					}
				);
			}; */


			$scope.$watch('schedule', function(newValue, oldValue, scope) {
				return $scope.schedule;
			}, true);
			$scope.$watch('qcData', function(newValue, oldValue, scope) {
				return $scope.qcData;
			}, true);

			$scope.getOrders();
			$scope.getQC();
			$scope.getMessage();
			//$scope.getDefectData();
			$scope.getLineInfo();
			$scope.summaryByProduct();

			$interval(function() {$scope.getOrders();}, 60 * 1000);
			$interval(function() {
				$scope.getQC();
				//$scope.getDefectData();
				$scope.getLineInfo();
				$scope.summaryByProduct();
				
					drawChart2();//drawChart();	
					
				
			}, 5 * 60 * 1000);

			$scope.populateJO = function(data) {
				$scope.currentTime = new Date();
				$scope.currentOrder = data;
				$scope.coretag = (data.CUSTOMERID == 'ULINE' || data.CUSTOMERID == 'ULINEC') ? ulineCode[data.PRODUCT_ID] : getCoreTag(data.PRODUCT_ID,data.SKID_QTY);
				$scope.ulinetag = (data.CUSTOMERID == 'ULINE' || data.CUSTOMERID == 'ULINEC') ? getCoreTag(data.PRODUCT_ID,data.SKID_QTY) : '';

				document.querySelector('.recipe').innerHTML = '<table style="margin: 0 auto;"><tbody>'+data.RECIPECODE+'</tbody></table>';
				var oCodeSuffix = ((data.PRODUCT_ID.split("-")[5]).indexOf('00') > -1 || (data.PRODUCT_ID.split("-")[5]).indexOf('Q0') > -1 || (data.PRODUCT_ID.split("-")[5]).indexOf('C0') > -1 || (data.PRODUCT_ID.split("-")[5]).indexOf('P0') > -1 || (data.PRODUCT_ID.split("-")[5]).indexOf('N0') > -1) ? "" : data.PRODUCT_ID.split("-")[5];

				var oCode = data.ORDER_NUMBER+''+oCodeSuffix;
				var tDiv = $('#jobOrderModal .coretag-label').html();
				if((data.CUSTOMERID == "PXYS" && data.PRODUCT_ID=='PR-M-500-051-5000-Q050')){
					tDiv = 	'<div class="row madeInCanada" style="line-height:1.1;">'+
							'<span>15312077PACKSYS MEXICO</span><br><span>SA DE CV.</span></div>'+
								'<div class="row arrow-yr">'+
									'<span class="year">GCAS: 90852754</span>'+
								'</div>'+
								'<div class="row ulineCode">LOTE-'+$scope.coretag+'</div>'+
								'<div class="row orderNumber ng-binding">FECHA DE PRODUCTION</div>'+
								'<div class="row shift"><span>'+$scope.currentTime.toLocaleDateString().replace(/(^|\D)(\d)(?!\d)/g, '$10$2')+
								'</span><br><span>'+oCode.replace("ORD","")+'</span></div>';
							
				}else{
					tDiv = '<div class="row coretag ng-binding">'+$scope.coretag+'</div>'+
							'<div class="row madeInCanada">MADE IN CANADA</div>'+
							'<div class="row arrow-yr">'+
								'<img class="arrow" src="./img/arrow.png" alt="--> --> -->">'+
								'<span class="year ng-binding">'+$scope.yr+'</span>'+
							'</div>'+
							'<div class="row ulineCode ng-binding">'+$scope.ulinetag+'</div>'+
							'<div class="row text-bold ng-binding" style="line-height: 1;">'+
							(data.CUSTOMERID == "MORRIS" ? splitProductID(data.PRODUCT_ID,2) + "MM " + Number(splitProductID(data.PRODUCT_ID,3)) + "GA " + splitProductID(data.PRODUCT_ID,4) + "'" : "")+'</div>'+
							'<div class="row orderNumber ng-binding">'+oCode+'</div>'+
							'<div class="row shift ng-binding">'+$scope.timestamped(data.SCHEDULED_LINE)+'</div>';
						
				}
				
				//$('#jobOrderModal .coretag-label').html(tDiv);
				//var modal = document.getElementById("jobOrderModal");
				//modal.style.display = "block";
				showModal('job_order');
			};

			$scope.filmType = function(desc) {
				if (typeof desc !== 'undefined') {
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

				if (typeof string !== 'undefined') {
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
				$scope.isUline = (custid == "ULINEC" || custid == "ULINE") ? "Uline" : ((custid == "MORRIS" || (custid == "PXYS" && prodID=='PR-M-500-051-5000-Q050')) ? "Custom" : "Standard");
				$scope.productId = prodID;
				$scope.customerID = custid;
				$scope.ordnumber = ordernum;
				$scope.noOfSkids = qty;
				var suffix = ((prodID.split("-")[5]).indexOf('00') > -1 || (prodID.split("-")[5]).indexOf('Q0') > -1 || (prodID.split("-")[5]).indexOf('C0') > -1 || (prodID.split("-")[5]).indexOf('P0') > -1 || (prodID.split("-")[5]).indexOf('N0') > -1) ? "" : prodID.split("-")[5]

				$scope.orderCode = "ORD"+ordernum.toString().toLowerCase().replace("ord","") +""+suffix;
				$scope.noOfPrints = parseInt(nPrints) + 20;
				$scope.linenumber = (typeof lineNumber === 'undefined') ? $scope.linen : lineNumber;
				
				var tDiv = $('#coreTagPrint .coretag-label').html();
				if((custid == "PXYS" && prodID=='PR-M-500-051-5000-Q050')){
					tDiv = 	'<div class="row madeInCanada" style="line-height:1.1;">'+
							'<span>15312077PACKSYS MEXICO</span><br><span>SA DE CV.</span></div>'+
								'<div class="row arrow-yr">'+
									'<span class="year">GCAS: 90852754</span>'+
								'</div>'+
								'<div class="row ulineCode">LOTE-'+$scope.coretag+'</div>'+
								'<div class="row orderNumber ng-binding">FECHA DE PRODUCTION</div>'+
								'<div class="row shift"><span>'+$scope.currentTime.toLocaleDateString().replace(/(^|\D)(\d)(?!\d)/g, '$10$2')+
								'</span><br><span>'+$scope.orderCode.replace("ORD","")+'</span></div>';
							
				}else{
					tDiv = '<div class="row coretag ng-binding">'+$scope.coretag+'</div>'+
							'<div class="row madeInCanada">MADE IN CANADA</div>'+
							'<div class="row arrow-yr">'+
								'<img class="arrow" src="./img/arrow.png" alt="--> --> -->">'+
								'<span class="year ng-binding">'+$scope.yr+'</span>'+
							'</div>'+
							'<div class="row ulineCode ng-binding">'+$scope.ulinetag+'</div>'+
							'<div class="row text-bold ng-binding" style="line-height: 1;">'+
							(custid == "MORRIS" ? splitProductID(prodID,2) + "MM " + Number(splitProductID(prodID,3)) + "GA " + splitProductID(prodID,4) + "'" : "")+'</div>'+
							'<div class="row orderNumber ng-binding">'+$scope.orderCode+'</div>'+
							'<div class="row shift ng-binding">'+$scope.timestamped($scope.linenumber)+'</div>';
						
				}
				
				$('#coreTagPrint .coretag-label').html(tDiv);
				//var modal = document.getElementById("coreTagPrint");
				//modal.style.display = "block";
				showModal('coreTagPrint');

			};

			$scope.printCoreTagLabel = function(ordnum,qty,noOfPrints,shiftTag,customLabel,customerName,prod_id){
				prod_id = prod_id.toUpperCase();
				if(typeof noOfPrints === 'undefined'){
					noOfPrints = 20;
				}	
				var coretag = (customLabel == "Uline") ? ulineCode[prod_id] : getCoreTag(prod_id,qty);
				var ulinetag = (customLabel == "Uline") ? getCoreTag(prod_id,qty) : "";
				var suffix = ((prod_id.split("-")[5]).indexOf('00') > -1 || (prod_id.split("-")[5]).indexOf('Q0') > -1 || (prod_id.split("-")[5]).indexOf('C0') > -1 || (prod_id.split("-")[5]).indexOf('P0') > -1 || (prod_id.split("-")[5]).indexOf('N0') > -1) ? "" : prod_id.split("-")[5]

				var orderCode = "ORD"+ordnum.toString().toLowerCase().replace("ord","") +""+suffix;
				//console.log(coretag+"/"+ulinetag+"/"+orderCode+"/"+shiftTag+"/"+noOfPrints+"/"+customLabel+"/"+customerName+"/"+prod_id);
				writeToSelectedPrinter(coretag,ulinetag,orderCode,shiftTag,noOfPrints,customLabel,customerName,prod_id);
				
			};

			

			$scope.printBC = function(skidnumbers,prodid,qty,isManualPrint){
				
					prodid = prodid.toUpperCase();
					
					if(isManualPrint){
						
						if(typeof skidnumbers === 'undefined' || skidnumbers == ''){
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
									skidnumbers = (skidIDS.length == 1) ? skidIDS.toString() : skidIDS.join(',');
									//console.log(skidIDdta+";"+prodid+";"+skidIDS.length);
									qty = skidIDS.length;
									//printBarcode(skidIDdta,prodid,qty);
									

						}
						
						$('.ui.modal.skidTagPrint').modal('hide');
						
						
					}
						
						if(skidnumbers.length > 0){
							var skidIdFrom = skidnumbers.split(",")[0];
							var skidIdTo = skidnumbers.split(",")[(skidnumbers.split(",")).length - 1];
							var txt;
							var r = confirm("The following barcodes from "+ skidIdFrom + " to "+ skidIdTo +" will be printed. \nPress OK to confirm.");
							if (r == true) {
								
							  printBarcode(skidnumbers,prodid,qty);
							  
							} else {
							  txt = "You pressed Cancel!";
							}

						}else{
							$scope.productId = prodid;
							//var modal = document.getElementById('skidTagPrint');
							$('#skidtag .form input').val('');
							//modal.style.display = "block";
							showModal('skidTagPrint');
						}

			};

			
			
			$scope.coretags = function(prod_id,totalSkid,customLabel){ $scope.currentTime = new Date();  return (customLabel == "Uline") ? ulineCode[prod_id] : getCoreTag(prod_id,totalSkid)};
			$scope.ulineTags = function(prod_id,totalSkid,customLabel){return (customLabel == "Uline") ? getCoreTag(prod_id,totalSkid) : ""};
			$scope.timestamped = function(linenum){return $scope.currentTime.toLocaleTimeString() + ' ' + ((localStorage.shift).split("/")[1]).replace("Shift ","") + '00' + linenum.replace("LINE ","")};
				
			$scope.printLabel = function(custname,proddesc,noOfskids,qty,uom,ponum,productid,orderno){
				
				productid = productid.toUpperCase();
				$('#printLabel').html('');
				var htmlContent = '';
				var ppp = '';

				if(typeof proddesc === 'undefined' || proddesc == ''){
							//proddesc = productDescription[productid];
				  //20" X 55GA / 14MIC X 6500'
				  var wd = productid.split("-")[2];
				  if(wd.indexOf('X') > -1){
					wd = wd.replace('X','') +'" ';
				  }else if(wd.substr(0,1) == '0'){
					wd = Number(wd) +'&#39; '
				  }else{
					wd = wd +'MM ';
				  }
				  var pcode = ((productid.split("-")[5]).substr(0,1) == 'Q' || (productid.split("-")[5]).substr(0,1) == 'P' || (productid.split("-")[5]).substr(0,1) == '0') ? '' : (productid.split("-")[5]).substr(0,3);
				  //TO INCLUDE K 
				  ppp = wd + Number(productid.split("-")[3]) +'GA X '+ productid.split("-")[4] +'&#39;' + pcode;

				}else{
					
				  var test = proddesc.slice(0, proddesc.lastIndexOf('('));
						var p = test.substring(test.indexOf('('),test.indexOf(')')+1); //remove second ();
						var pp = test.substring(0,test.indexOf('FILM') + 4);
						if(test.indexOf('FILM') <= -1){
							pp = test.substring(0,test.indexOf('CORE') + 4);
						}
						ppp = test.replace(p,"").replace(pp,"").replace(/#PLBL/g,"").replace(/#1INCORE/g,"").replace(/STD/g,"").replace("#","");
				}

				var l = document.getElementById('machineLine').value;
				var timeLabel = $scope.timestamped(l);
				var pt = productid.slice(0,4);
				var ctag = getCoreTag(productid,noOfskids);
				var utag = ulineCode[productid];
				var orderLabel = orderno + "" + (((productid.split("-")[5]).indexOf('00') > -1 || (productid.split("-")[5]).indexOf('Q0') > -1 ||	(productid.split("-")[5]).indexOf('C0') > -1 || (productid.split("-")[5]).indexOf('P0') > -1 ||	(productid.split("-")[5]).indexOf('N0') > -1) ? "" : productid.split("-")[5]);
				var morrisCode = ""; //'<div class="row text-bold" style="line-height: 1;" ng-show="customerID==\'MORRIS\'">'+
									//{{splitProduct(productId,2)}}MM {{splitProduct(productId,3) | number:0}}GA {{splitProduct(productId,4)}}
									//'</div>'
				if(proddesc.indexOf('MAX 80') > -1){pt += '80';}
				
				var labelLogo = '<img src="./img/'+pt+'.jpg" alt="" style="height:180px;display:block;margin:10px auto;">';
				
				var footerLogo = '<img src="./img/AX-FOOTER.jpg" style="height:75px;width:100%;">';
				
				var coretaglabel = '<div class="coretag-label">'+
									'<div class="row coretag">'+ctag+'</div>'+
									'<div class="row madeInCanada">MADE IN CANADA</div>'+
									'<div class="row arrow-yr">'+
										'<img class="arrow" src="./img/arrow.png" alt="--> --> -->">'+
										'<span class="year">'+$scope.yr+'</span>'+
									'</div>'+
									'<div class="row ulineCode">'+utag+'</div>'+
									   morrisCode +
									'<div class="row orderNumber">'+orderLabel+'</div>'+
									'<div class="row shift">'+timeLabel+'</div>'+
								'</div>';
				
				var poDiv = '<div class="skid_label_po_number row" style="font-size:55px;padding: 0;margin: 0;line-height: 1;">P.O.# '+ponum+'</div>';
				
				var qtylabel = '<div class="skid_label_qty center aligned row" style="font-size:45px;>'+(qty/noOfskids) +' '+ uom +'S/SKID</div>'+				
							   '<div class="skid_label_made center aligned row" style="font-size:40px;>MADE IN CANADA</div>	';
							   
				if(typeof utag !== 'undefined'){ 					
					labelLogo = '<span style="font-size: 190px;font-weight: 700;line-height: .8;">'+utag+'</span>';
					footerLogo = '';
					custname = ppp;
					ppp = 'MADE IN CANADA'+
							'<div class="skid_label_lot" style="width: 20%;font-size: initial;margin-left:40%;">'+										 
											'<div class="ct center aligned '+((pt.indexOf("H") > -1) ? "no-lot-box" : "") +'">'+
												'<div class="coretag">'+utag+'</div>'+
												'<div class="madeInCanada">MADE IN CANADA</div>'+
													'<div class="arrow-yr">'+
														'<img class="arrow" src="./img/arrow.png" alt="--> --> -->">'+
														'<span class="">'+$scope.yr+'</span>'+
													'</div>'+
													'<div class="orderNumber ng-binding">'+ctag+'</div>'+
													'<div class="orderNumber ng-binding">'+orderLabel+'</div>'+
													'<div class="shift ng-binding">'+timeLabel+'</div>'+
											'</div>'+			
										'</div>';
					coretaglabel = '<div class="" style="">'+
								'<span class="skid_label_po_number row" style="font-size:55px;padding: 0;margin: 0;line-height: 1.5;padding-left: 25%;">P.O.# '+ponum+'</span>'+
								'<img class="uline-barcode barcode" style="margin-left: 25%;"/>';
					qtylabel = '';
				}
				
				switch (pt)
				{
					case 'AX-M':						
						paperColor = 'blue';
						break;
					case 'PL-M':						
						paperColor = 'green';
						break;
					case 'PR-M':						
						footerLogo = '';
						paperColor = 'yellow';						
					break;
					default:
						footerLogo = '';
						paperColor = 'white';
				}
				
				if(pt.indexOf('-H-') >= -1){
					coretaglabel = "";
				}
				
				for(var i=0;i<noOfskids;i++){
					
					htmlContent += '<div class="ui grid center aligned">'+
										'<div class="sixteen wide column">'+
											'<div class="skid_label_logo center aligned row">'+	labelLogo +	'</div>'+
										'</div>'+
										'<div class="sixteen wide column"><div class="huge header skid_label_customer">'+custname+'</div></div>'+
										'<div class="sixteen wide column"><div class="huge header skid_label_product_desc">'+ppp+'</div></div>'+
										'<div class="four wide column"><div>'+coretaglabel+'</div></div>'+
										'<div class="eight wide column"><div>'+qtylabel+'</div></div>'+
										'<div class="four wide column">'+
											'<span class="top">'+(i+1)+'</span><span class="bottom">'+noOfskids+'</span>'+
										'</div>'+
										'<div class="sixteen wide column left aligned">'+
											'<div class="skid_label_footer row">'+footerLogo+'</div>'+
										'</div>'+
									+'</div>';
					
					
					
					/* '<div class="content center aligned" style="margin: 0 auto;">'+
									'<div class="skid_label_logo center aligned row">'+									
										labelLogo +										
									'</div>'+
									'<div class="skid_label_customer center aligned row">'+custname+'</div>'+
									'<div class="skid_label_product_desc center aligned row" style="font-size:65px;">'+
										ppp+
									'</div>'+
									'<div class="skid_label_po row">'+
										coretaglabel +														
											qtylabel +		
										'</div>'+
										'<div class="skid_label_counter two columns" style="position: relative;">'+
											'<span class="top">'+(i+1)+'</span><span class="bottom">'+noOfskids+'</span>'+
										'</div>' +
									'</div>'+
									'<div class="skid_label_footer row">'+
										footerLogo+
									'</div>'+
								'</div>' */;
					
				}
				

					$('#printLabel').append(htmlContent);

						if(typeof utag === 'undefined' || utag != ''){
							JsBarcode(".uline-barcode.barcode", utag, {format: "code128",font: "arial",fontSize: 40,textMargin: 0,text: "",height:80,displayValue: false});
						}

					setTimeout(function(){
						alert('REMINDER: Make sure you insert '+paperColor+' paper before you hit the print button.');
						$('#printLabel').printElem('skidLabel',0,0,localStorage.shift,"");

					},1000);


			};

			//autocomplete
			$scope.datalist = productList;

			$scope.showChart = function(line){

				var keyw = productionSummary[parseInt(line.replace('LINE ','')) - 1].KEYWORD;
				$scope.keyword = keyw;
				qcDataSource = $scope.qcData.filter(function(results) { return (results.KEYWORD == keyw && results.LINE == line)});
				
					drawChart2();//drawChart();						
				
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
				//closeModal('sendMessageForm');
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
	   
	   $scope.showDowntimeModal = function(d){
		   if(d>0){
			   showModal('downtime');
		   }
	   };
	   
	   $scope.currentAsofTime = function(){
		   return Date.now();		   
	   };
	   
	   $interval(function() {$scope.currentAsofTime();}, 60 * 1000);


	  };
	  init();
	}
]);


function showModal(ele){
	$('.ui.modal.'+ele).modal({
        onHide: function(){
            		$('#printcss').remove();
		if(ele != 'coreTagPrint'){
			$('.ui.modal.'+ele+' input').val("");
		}
			$('.ui.modal.'+ele+' textarea').val("");
			$('.ui.modal.'+ele+' select').prop('selectedIndex',0);
			$('.ui.modal input[type=checkbox], .ui.modal input[type=radio]').prop('checked',false);
		
		if(ele == 'daily_operator_checklist'){
			$('.main_question').trigger('change');
		}
			
        }
    }).modal('show');
	//var pos = $('.ui.modal.'+ele).position().left;
			//$('.ui.modal.'+ele).css("left",pos);
}


function printBarcode(skidnumber,prodid,qty){
	var noOfCopies = 0;
	var orderNumber = '';
	$('#printSkids').html('');
	var skidIDs = new Array();
		skidIDs = (skidnumber.split(',')).filter((v, i, a) => a.indexOf(v) === i);

		for(var i=0;i<qty;i++){

			htmlContent = '<div class="bc-div" style="width: 100%;display:block;color:000000!important;background:ffffff!important;">'+
							'<p class="bcodelabel" style="width:100%;">'+
								'<span style="float:left;margin-left:5px;">'+skidIDs[i]+'</span>'+
								'<span style="float:right;margin-right:-55px;">'+prodid.replace(/-/g,"")+'</span>'+
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

				$('#printSkids').printElem(test,noOfCopies,orderNumber,localStorage.shift,"skidTagPrint");

				},1000);

}
function printJOform(){
//  var htmlContent = $('#job_Order_Form');
  //$('#printJobOrderForm').append(htmlContent);
  $('#job_order').printElem('',0,0,localStorage.shift,"");
}

jQuery.fn.extend({
 printElem: function(a,b,c,d,e) {
  var cloned = this.clone();
  var printSection = $('#printSection');
  if (printSection.length == 0) {
   printSection = $('<div id="printSection" class="container"></div>');
   $('body').append(printSection);
  }
  printSection.append(cloned);
  var toggleBody = $('body *:visible');
  toggleBody.hide();
  $('#printSection, #printSection *').show();

  //append css

	var css = '@page { size: 8.5in 11in;margin:1.5cm 15mm;}body, .ui.card, .ui.table, .ui.selection.dropdown{background: #ffffff!important;color:#000000!important;width:785px;height: 980px;page-break-after: avoid;page-break-before: avoid;}'+
            '.job-order-form{width:130%!important;display:block;}.recipe{margin: 0px auto;}.recipe th, .recipe td{padding: 10px 7px;}.recipe span{padding: 7px 5px; width: 106px;',

    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

	 if(a == 'skidTags'){
		css = '@page { size: 11in 8.5in; margin-top: 6cm;}body, .ui.card, .ui.table, .ui.selection.dropdown{background: #ffffff!important;color:#000000!important;width:920px;height: 635px;}';
	 }else if(a == 'skidTags1'){
		css = '@page { size: 11in 8.5in; margin-top: 3.5cm;}body, .ui.card, .ui.table, .ui.selection.dropdown{background: #ffffff!important;color:#000000!important;width:920px;height: 610px;}';
	 }else if(a == 'skidLabel'){
		 css = '@page { size: 11in 8.5in;margin:1cm 5mm;}body, .ui.card, .ui.table, .ui.selection.dropdown{background: #ffffff!important;color:#000000!important;font-family:"Times New Roman"!important;width:920px;height: 635px;}'+
				'.skid_label{font-family: "times new roman";}.skid_label_logo{height:180px;}'+
				'.skid_label_customer{height:145px;font-size:72px;line-height:1;font-weight:700;}'+
				'.skid_label_product_desc{height:125px;font-weight:700;line-height: .9;}'+
				'.skid_label_po{height:80px;font-weight:700;}'+
				'.skid_label_lot{position: relative;}.skid_label_lot .ct{padding: 15px;border: 1px solid #000;border-radius: 20px;}'+
				'.skid_label_lot .arrow{width: 64px!important;}'+
				'.skid_label_qty{font-weight:700;line-height: 1.1;font-size:40px;font-weight:700;}'+
				'.skid_label_made{font-weight:700;line-height: .9;font-size:32px;font-weight:700;}'+
				'.skid_label_footer{padding: 10px 0;}'+
				'.skid_label_counter span{display: block;font-size: 70px;border: 1px solid #000;position: absolute;line-height: .8;padding: 10px 32px;text-align: center;left: 35%;min-width:78px;}'+
				'.skid_label_counter span.bottom{top: 77px;}.skid_label_lot .ct.no-lot-box{color:#fff;border: 1px solid #fff;}.skid_label_lot .ct.no-lot-box .arrow{display:none;}';
	 }

	style.type = 'text/css';
	style.media = 'print';
	style.id = 'printcss';

	if (style.styleSheet){
	  style.styleSheet.cssText = css;
	} else {
	  style.appendChild(document.createTextNode(css));

	}

	head.appendChild(style);
	
	window.print();	
	printSection.remove();
	toggleBody.show();
   
	
	
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
			//closeModal("skidTagPrint");
		};
	});

/*	function showReport(div){
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
		$('input[type="radio"].reset').removeClass('checked');
		document.getElementById('isUline').checked = false;
		$("#printcss").remove();
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
 */

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
			//closeModal('sendMessageForm');

        }
    });
  }

});

$('.main_question').change(function(){
	var ele = $(this).attr('id');
	if($(this).prop('checked')){
		$(this).addClass('checked');
		$('.'+ele).css('display','block');
	}else{
		$(this).removeClass('checked');
		$('.'+ele).css('display','none');
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
  var question6 = ($('input[name="question6"]').hasClass('checked')) ? $('input[name="question6a"]').val() : "";
  var question7 = $('input[name="question7"]').val();
  var question8 = ($('input[name="question8"]').hasClass('checked')) ? $('input[name="question8a"]').val() : "";
  var question9 = $('input[name="question9"]').val();
  var comment = $('textarea[name="comment"]').val();
  var submittedby = $('input[name="submitby"]').val();
  var shift = $('input[name="shift"]').val();
  var flagged = true;
  //console.log(line+" "+question6+" "+question7+" "+question8+" "+question9+" "+comment+" "+submittedby);
	var data = "line="+line+"&q6="+question6+"&q7="+question7+"&q8="+question8+"&q9="+question9+"&comment=" + escape(comment) + "&submittedby="+submittedby+"&shift="+shift;
	//if(line != '' && question6 != '', )
	
	//console.log(data);
	/*	if(typeof question6 === 'undefined'){
			alert('Please select Die/Lip, Cast Roll Cleaning whether it is "Scheduled" or "Quality Issue".');
			flagged = false;
		}
		if(typeof question8 === 'undefined'){
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
		}*/

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

$(document).ready(function(){
	$('.modal').prepend('<i class="close inside" style="font-weight:700;font-style:normal">X</i>');
	$('.year').text("21");
});
