var _Chart = null;

var getDataSet = function(country, field, days){
  var r = {data:_d[country][field].slice(0, days),
          fill:false,
          borderColor: _d[country]['Color'],
          label:_d[country]['Code'],
          tension : 0
        };
  if($("#normalize").is(":checked")){
    for(var i = 0; i < r.data.length; i++){
        r.data[i] = r.data[i] / _d[country].Population;
    }
  }
  return r;
}

var getLabels = function(days){
  var r = [];
  for(var i = 0; i < days; i++){
    r.push('' + (i+1));
  }
  return r;
}


var createCheckboxes = function(){
  for(var i = 0; i < _d.Countries.length; i++){
    var code = _d[_d.Countries[i]].Code
    var id1 = 'checkbox-'+ code;
    var id2 = 'label-'+ code;
    var label = _d.Countries[i] + "-" + code + "(" + _d[_d.Countries[i]].Days + ")"
    var html = '<p><input class="country-checkbox" type="checkbox" id="'+id1+'">';
    html += '<label for="'+id1+'" id="'+id2+'">'+ label + '</label></p>';
    $("#countries").append(html);
  }
}


var disableCheckboxes = function(){

  var exclude = parseInt($("#exclude").val());

  for(var i = 0; i < _d.Countries.length; i++){
    var code = _d[_d.Countries[i]].Code;
    var id1 = '#checkbox-'+ code;
    var id2 = '#label-'+code;

    if(_d[_d.Countries[i]].Days < exclude){
      $(id1).attr("disabled", true);
      $(id2).addClass("label-disabled");
    }
    else{
      $(id1).removeAttr("disabled");
      $(id2).removeClass("label-disabled");
    }
  }

  $(".country-checkbox:enabled").prop('checked', true);
}


var originalController = Chart.controllers.line;
Chart.controllers.line = Chart.controllers.line.extend({
  draw: function() {
    originalController.prototype.draw.call(this, arguments);
    drawLabels(this);
  }
});

function drawLabels(t) {
  var ctx = document.getElementById('chart').getContext("2d");

	//ctx.save();
  ctx.font = Chart.helpers.fontString(12, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
  ctx.textBaseline = 'bottom';
  var days = parseInt($("#days").val());
  var chartInstance = t.chart;
  var datasets = chartInstance.config.data.datasets;
  datasets.forEach(function(ds, index) {
    var label = ds.label;
    var meta = chartInstance.controller.getDatasetMeta(index);
    var len = meta.data.length-1;
    if(len >= days-1) len=days-2;
    //console.log(ds, meta.data[len]._model);
    var xOffset = meta.data[len]._model.x+10;
    var yOffset = meta.data[len]._model.y;
    ctx.fillStyle = ds.borderColor;
    ctx.fillText(label, xOffset, yOffset);
  });
  ctx.restore();
}


var createChart = function(){

  //Read the settings
  var series = $("#data").val()
  var days = parseInt($("#days").val());
  var exclude = parseInt($("#exclude").val());

  if(_Chart !== null) _Chart.destroy();
  var ctx = document.getElementById('chart');

  var datasets = [];
  for(var i = 0; i < _d.Countries.length; i++){
    var c = _d.Countries[i];
    var id = "#checkbox-" + _d[c].Code;
    if($(id).is(":checked"))
      datasets.push(getDataSet(c, series, days))
  }

  var ylab = "Daily Deaths"
  if(series == "Cumulative") ylab = "Cumulative Deaths"
  if($("#normalize").is(":checked"))
    ylab = ylab + " per 1,000 people";

  _Chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: getLabels(days),
        datasets: datasets
    },
    options: {
        legend: {display:false},
        scales: {

          xAxes: [ {
          scaleLabel: {
            display: true,
            labelString: 'Days since 10th Death'
            }
          }],

            yAxes: [{
                ticks: { beginAtZero: true},
                scaleLabel: {
                  display: true,
                  labelString: ylab
                }

            }]
        }
    }
  });
}


$("#data").change(function(){createChart();});

$("#days").val(""+_d.MaxDays);

$("#exclude").change(function(){
  disableCheckboxes()
  createChart();
});

$("#days").change(function(){createChart();});
$("#select-countries").click(function(){$("#countries").slideDown()});

createCheckboxes();
$(".country-checkbox").change(function(evt){
  createChart();
});

$("#normalize").change(function(evt){
  createChart();
});

$("#select-all").change(function(){
  if($("#select-all").is(":checked"))
    $(".country-checkbox:enabled").prop('checked', true);
  else
      $(".country-checkbox:enabled").prop('checked', false);
  createChart();
})

disableCheckboxes();

createChart();
