// Load google charts
google.charts.load('current', {packages: ['corechart', 'line', 'bar', 'imagesparkline']});
google.charts.setOnLoadCallback(drawChart);

// Draw the chart and set the chart values
function drawChart() {	
	var l = document.getElementById("machineLine").value;
	var line = parseInt(l.replace('LINE ','')) - 1; //(document.getElementById("machineLine").value).replace(' ','_');
	//console.log(line);
  var data = google.visualization.arrayToDataTable([
		['Defects', 'No of Counts'],
		['Film Consistency',qualityIssues[line].Film_Consistency],
		['Film Breaks',qualityIssues[line].Film_Breaks],
		['Holes',qualityIssues[line].Holes],
		['Gels/Black specks',qualityIssues[line].Gels_Black_specks],
		['Die lines',qualityIssues[line].Die_lines],
		['Film Splitting',qualityIssues[line].Film_Splitting],
		['Film Tearing',qualityIssues[line].Film_Tearing],
		['Dispersion Issue',qualityIssues[line].Dispersion_Issue],
		['Cling issue',qualityIssues[line].Cling_issue],
		['Film Blocking',qualityIssues[line].Film_Blocking],
		['Film not centered on core',qualityIssues[line].Film_not_centered_on_core],
		['Bad Roll Geometry',qualityIssues[line].Bad_Roll_Geometry],
		['Bad edge/cut',qualityIssues[line].Bad_edge_cut],
		['Gauge Band',qualityIssues[line].Gauge_Band],
		['Contamination',qualityIssues[line].Contamination],
		['Wrinkles',qualityIssues[line].Wrinkles],
		['Film Appearance',qualityIssues[line].Film_Appearance],
		['Other',qualityIssues[line].Other],
		['No Defects',qualityIssues[line].No_Defects]
	]);

	
  // Optional; add a title and set the width and height of the chart
  var options = {'title':'', 'width': 750,'height':500, backgroundColor: {
          fill: '#000000',
          fillOpacity: 0.1
        },legend: {
    textStyle: {
        color: '#ffffff'
    }
},
titleTextStyle: {
    color: '#ffffff'
},slices: {  2: {offset: 0.2},
	     4: {offset: 0.3},
	     6: {offset: 0.2},
	     8: {offset: 0.3},
	     10: {offset: 0.2},
             12: {offset: 0.3},
             14: {offset: 0.2},
             16: {offset: 0.3},
	     18: {offset: 0.2}
          },
		};

  // Display the chart inside the <div> element with id="piechart"
  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);
}




   
	google.charts.setOnLoadCallback(drawBar);
	function drawBar() {

		

      var data = google.visualization.arrayToDataTable([
        ['Product', 'Total Number of Lbs.',],
        [summaryByProductdata[0].PRODUCT, summaryByProductdata[0].TOTAL],
        [summaryByProductdata[1].PRODUCT, summaryByProductdata[1].TOTAL],
        [summaryByProductdata[2].PRODUCT, summaryByProductdata[2].TOTAL],
        [summaryByProductdata[3].PRODUCT, summaryByProductdata[3].TOTAL],
        [summaryByProductdata[4].PRODUCT, summaryByProductdata[4].TOTAL],
		[summaryByProductdata[5].PRODUCT, summaryByProductdata[5].TOTAL],
		[summaryByProductdata[6].PRODUCT, summaryByProductdata[6].TOTAL]
      ]);

      var options = {
        title: '',
		chartArea: {width: '65%'},
        hAxis: {
          title: '',
          minValue: 0,
		  textStyle: { color: '#ffffff'  }
        },
        vAxis: {
          title: '',
		  textStyle: { color: '#ffffff'  }
        },
		backgroundColor: { fill: '#000000',fillOpacity: 0.1 },
		legend: {
			textStyle: {color: '#ffffff'},
			position: 'none'
		},
		height: 250
      };

      var chart = new google.visualization.BarChart(document.getElementById('chart_div_bar'));

      chart.draw(data, options);
    }

	google.charts.setOnLoadCallback(drawChartColumn);
    function drawChartColumn() {
				
		var data = new google.visualization.arrayToDataTable([
				['Line', 'Total Lbs Produced', { role: 'style' } ],
				['LINE 1',  productionSummary[0].PRODUCED, 'color: #42c698'],
				['LINE 2',  productionSummary[1].PRODUCED, 'color: #42c698'],
				['LINE 3',  productionSummary[2].PRODUCED, 'color: #42c698'],
				['LINE 4',  productionSummary[3].PRODUCED, 'color: #42c698'],
				['LINE 5',  productionSummary[4].PRODUCED, 'color: #42c698'],
				['LINE 6',  productionSummary[5].PRODUCED, 'color: #42c698'],
				['LINE 7',  productionSummary[6].PRODUCED, 'color: #42c698'],
				['LINE 8',  productionSummary[7].PRODUCED, 'color: #42c698'],
				['LINE 9',  productionSummary[8].PRODUCED, 'color: #42c698']
				
				
			]);
	
		var view = new google.visualization.DataView(data);      
					   
		var options = {
						title: '',
						backgroundColor: { fill: '#000000',fillOpacity: 0.1 },
						hAxis: {
							title: '',
							textStyle: { color: '#ffffff', fontSize: 8, },
							slantedText: true,
						},
						vAxis: {
							title: '',
							textStyle: { color: '#ffffff'  }
						},
						colors: ['green'],
						legend: {position: 'none'},
						width: 500,
						height: 250
					  }; 

            // Instantiate and draw the chart.
            var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_values'));
            chart.draw(view, options);
  }
  
  
function drawChart2() {
	
	var l = document.getElementById("machineLine").value;
	var line = parseInt(l.replace('LINE ','')) - 1;
	var kw = productionSummary[line].KEYWORD;	
	
	qcDataSource.sort(function(a,b){return new Date(a.Timestamp) - new Date(b.Timestamp);});
	
	var data = new google.visualization.DataTable();
      data.addColumn('string', 'Timestamp');
	  data.addColumn('number', 'Min');
	  data.addColumn('number', 'Tgt');
	  data.addColumn('number', 'Max');     
      data.addColumn('number', '%Breakpoint');
				
	var minval=null,maxval=null,tgtval=null;
	var count=0;
	//console.log(qcDataSource);
	for(var i=0;i<qcDataSource.length;i++){
					
		if(qcDataSource[i].KEYWORD == kw && qcDataSource[i].BREAKPOINT > 0){
			
			minval = Number(qcDataSource[i].MIN);
			maxval = Number(qcDataSource[i].MAX);
			tgtval = Number(qcDataSource[i].TGT);
			var dte = new Date(qcDataSource[i].Timestamp).toLocaleDateString();
			data.addRow(['',Number(qcDataSource[i].MIN),Number(qcDataSource[i].TGT),Number(qcDataSource[i].MAX),Number(qcDataSource[i].BREAKPOINT)]);
			++count;
		}	
	}
		data.addRow(['',minval,tgtval,maxval,null]);
		data.insertRows(0, [['',minval,tgtval,maxval,null]]);

	  var options = {
		title: '',
		hAxis: {title: '', textStyle: { color: '#000000', fontSize: 5  },gridlines: {    color: 'transparent'  },slantedText:true,slantedTextAngle:45,},
		vAxis: {minValue: 0,textStyle: { color: '#000000'  },gridlines: {    color: 'transparent'  },viewWindow: {
					min: minval - 50,
					max: maxval + 50
				},			
			},
		legend: { position: "bottom",textStyle: { color: '#ffffff'  } },
		backgroundColor: {fill: '#000000',fillOpacity: 0.1},
		series: {
				0: { color: '#fd7e14',areaOpacity: 0}, //min
				1: { color: '#007a3c',areaOpacity: 0 }, //tgt
				2: { color: '#d71c0e',areaOpacity: 0 }, //max
				3: { color: '#ffffff',pointShape: 'circle', pointSize: 5,areaOpacity: 0}, 
			  }
	  };
	  
	  
	  var options1 = {
		title: '',
		width: 1600,
		height: 350,
		hAxis: {title: '', textStyle: { color: '#000000',fontSize: 9  },gridlines: {    color: 'transparent'  },slantedText:true,slantedTextAngle:45,},
		vAxis: {
				minValue: 0,
				textStyle: { color: '#000000'  },
				gridlines: { color: 'transparent'  },
				viewWindow:{ min: minval - 50, max: maxval + 50 }
			},
		legend: { position: "bottom",textStyle: { color: '#ffffff'  } },
		backgroundColor: {fill: '#000000',fillOpacity: 1},
		series: {
				0: { color: '#fd7e14',areaOpacity: 0}, //min
				1: { color: '#007a3c',areaOpacity: 0 }, //tgt
				2: { color: '#d71c0e',areaOpacity: 0 }, //max
				3: { color: '#ffffff',pointShape: 'circle', pointSize: 7,areaOpacity: 0}, 
			  }	
	  };
	 	  
	
		
	
	  var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));
	  var chart1 = new google.visualization.LineChart(document.getElementById('chart_div'));
		
		
		chart.draw(data, options); 
		chart1.draw(data, options1);	
	
	
	
}

	google.setOnLoadCallback(drawChart2);


setTimeout(function(){
	$('.no-data').css('display','none');
	drawChartColumn();
	drawBar();
	drawChart2();
	drawChart();
	//test();	
	},5000);

document.getElementsByTagName("BODY")[0].onresize = function() {
	drawChartColumn();
	drawBar();
	drawChart2();
	drawChart();
};

function test(){	
	//drawChart2();		
	//drawChart();
}
