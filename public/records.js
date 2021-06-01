var client = {
  data: [],
  dataFields: [],
  user: null,
  // scatter works better for fields that can't be zero or you would be dead
  scatterFields: ['weight','pulse','basal temp','body temp'],
  traceField: function (field, type) {
    var trace = {
      x:[],
      y:[],
      type: type,
      name: field
    };
    if (type == 'scatter') {
      trace.mode = 'lines';
    }
    for(var i=0; i<client.data.length; i++) {
      var dt = new Date(client.data[i].date);
      if (client.data[i][field]) {
        //trace.x.push(dt.toLocaleDateString('en-US'));
        trace.x.push(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());
        trace.y.push(client.data[i][field]);
      }
      else if (field == 'BMI' && client.data[i].weight) {
        trace.x.push(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());
        trace.y.push(client.getBMI(client.user.height, client.data[i].weight));
      }
    }
    return trace;
  },

  traceAverage: function(field, m, y) {
    var average = {
      x:[], y:[],
      type: 'scatter',
      name: 'average',
      mode: 'lines+markers'
    };

    var m = -1, total = 0, count = 0, a = 0;
    var data = client.data;
    var last = client.lastRecordWithField(field);
    var lastdt = last ? new Date(last.date) : new Date();
    var today = new Date().getDate();
    for(var i=0; i<data.length; i++) {
      if (data[i][field] == null) {
        continue;
      }

      var dt = new Date(data[i].date);
      // plot the average of the previous month on the 1st of each month
      if (dt.getMonth() != m ) {
        m = dt.getMonth();
        a = (total/count).toFixed(2);
        average.x.push(dt.getFullYear() + '-' + (m + 1) + '-' + dt.getDate());
        average.y.push(count == 0  ? data[i][field] : a);
        count = total = 0;
      }

      total += Number(data[i][field]);
      count ++;
      // plot the average for the current month unless it's the 1st
      if (dt.toDateString() == lastdt.toDateString() && today != 1) {
        a = (total/count).toFixed(2);
        average.x.push(dt.getFullYear() + '-' + (m + 1) + '-' + dt.getDate());
        average.y.push(a);
      }
    }

    return average;
  },

  traceStatic: function(field, value, source, color) {
    var start = source.x[0];
    var end = source.x[source.x.length - 1];
    var trace = {
      x:[start, end],
      y:[value, value],
      type: 'scatter',
      mode: 'lines',
      name: field,
      line: {
        color: color,
        dash: 'dot'
      }
    };
    return trace;

  },

  plotField: function (field) {
    var layout = {
      plot_bgcolor: client.user.theme == 'dark' ? 'black' : 'white',
      paper_bgcolor: client.user.theme == 'dark' ? 'black' : 'white',
    }
    if (field == 'systolic' || field == 'diastolic') {
      var systolic = client.traceField('systolic', 'scatter');
      var diastolic = client.traceField('diastolic', 'scatter');
      var avSystolic = client.traceAverage('systolic', 'scatter');
      avSystolic.line = {color:'#27a', dash:'dot'};
      var avDiastolic = client.traceAverage('diastolic', 'scatter');
      avDiastolic.line = {color:'#e71', dash:'dot'};
      Plotly.newPlot('data-canvas', [systolic, diastolic, avSystolic, avDiastolic], layout);
      $('#data-label').html('Blood Pressure');
    }
    else if (field == 'BMI') {
      var trace = client.traceField('BMI', 'scatter');
      var ideal = client.traceStatic('ideal', 25, trace, '#0A0');
      var obese = client.traceStatic('obese', 30, trace, '#A00');
      Plotly.newPlot('data-canvas', [trace, obese, ideal], layout);
      $('#data-label').html(field);
    }
    else if (client.scatterFields.includes(field)) {
      var trace = client.traceField(field, 'scatter');
      var average = client.traceAverage(field);
      Plotly.newPlot('data-canvas', [trace, average], layout);
      $('#data-label').html(field);
    }
    else {
      var trace = client.traceField(field, 'bar');
      var average = client.traceAverage(field);
      Plotly.newPlot('data-canvas', [trace, average], layout);
      $('#data-label').html(field);
    }
    $('#canvas-container').show();
  },

  renderTable: function(id) {
    var dataTable = $('#data-table');
    var headers = $('<tr></tr>');
    for (var i = 0; i < client.dataFields.length; i++) {
      var field = client.dataFields[i];
      if (field == 'date') {
        if (client.user.order == 'desc') {
          headers.append('<th class="date">Date <a href="?order=asc">&#9651;</a></th>');
        }
        else {
          headers.append('<th class="date">Date <a href="?order=desc">&#9661;</a></th>');
        }
      }
      else if (field == 'weight' && client.user.height > 0) {
        headers.append('<th><a href="#" onclick="client.plotField(\'weight\')">Weight</a></th>'+
                      '<th><a href="#" onclick="client.plotField(\'BMI\')">BMI</a></th>');
      }
      else {
        headers.append('<th><a href="#" onclick="client.plotField(\''+field+'\')">' +
        field + '</a></th>');
      }
    };
    headers.append('<td class="ghost-col"></td>');

    $('#data-table').html(headers);
    var newRow = '';
    if (!id) {
      // no id is selected for editing so allow new records
      newRow ='<tr id="new-entry" style="display:none;">';
      for(var i = 0; i < client.dataFields.length; i++) {
        var last = client.lastRecordWithField(client.dataFields[i]);
        var value = '';
        if (client.dataFields[i] == 'date') {
          value = new Date().toLocaleDateString('en-US');
        }
        else if (last && last[client.dataFields[i]]) {
          value = last[client.dataFields[i]];
        }
        newRow +='<td><input type="text" value="'+value+'" name="'+client.dataFields[i]+'" /></td>';

        if (client.dataFields[i]  == 'weight' && client.user.height > 0) {
          newRow +='<td></td>';
        }
      }
      newRow += '</tr>';
      $('#data-form input[type="submit"]').attr('value','New Entry');
      $('#data-form').submit(function() {
        if ($('#new-entry').is(':hidden')) {
          var today = new Date().toLocaleDateString('en-US');
          $('#data-form input[name="date"]').val(today);
          $('#data-form input[type="submit"]').attr('value','Submit');
          $('#new-entry').show();
          $('#cancel').show();
          $('#data-form input[name="date"]').focus();
          return false;
        }
        return true;
      });
      if (client.user.order == 'desc') {
        dataTable.append(newRow);
      }
    }
    if (client.user.order == 'desc') {
      for(var i=client.data.length-1; i >= 0; i--) {
        dataTable.append(client.renderRow(client.data[i], id));
      }
    }
    else {
      for(var i=0; i < client.data.length; i++) {
        dataTable.append(client.renderRow(client.data[i], id));
      }
    }
    if (!id) {
      $('#cancel').hide();
      if (client.user.order != 'desc') {
        dataTable.append(newRow);
      }
    }
    else if (id) {
      $('#cancel').show();
      $('#id').val(id);
      $('#data-form input[name="date"]').focus();
      $('#data-form input[type="submit"]').attr('value','Submit');
      $('form').submit(function() { return true; });
    }

  },

  renderRow: function(record, id) {
    var row ='<tr>';
    var dt = new Date(record.date).toLocaleDateString('en-US')
    for(var i = 0; i < client.dataFields.length; i++) {
      var field = client.dataFields[i];
      var cell = record[field] == null ? '' : record[field];

      if (record.id == id) {
        // this is the row selected for editing
        var value = field == 'date' ? dt : cell;
        cell = '<input type="text" value="'+value+'" name="'+field+'" /></td>';
      }
      else if (field== 'date') {
        var dt = new Date(cell);
        cell = '<a href="javascript:client.renderTable('+record.id+')">' +
          dt.toLocaleDateString('en-US') + '</a>';
      }
      row +='<td>'+cell+'</td>';
      if (field == 'weight' && client.user.height > 0) {
        var bmi = client.getBMI(client.user.height, record.weight);
        row +='<td>'+bmi+'</td>';
      }
    }
    if (record.id == id) {
      row += '<td class="ghost-col">' +
      '<a href="javascript:client.deleteRecord('+id+',\''+dt+'\')" class="x">&times;</a></td>';
    }
    row += '</tr>';
    return row;
  },

  lastRecordWithField: function(field) {
    for(var i = client.data.length-1; i >= 0; i--) {
      if (client.data[i][field] != null) {
        return client.data[i];
      }
    }
    return null;
  },

  getBMI: function(height, weight) {
    var bmi = '';
    if (height && weight) {
      var kg = new Number(weight) / 2.205
      var cm = new Number(height) * 100;
      bmi = (kg / cm / cm * 10000).toFixed(2);
    }
    return bmi;
  },

  deleteRecord: function(id, dt) {
    if (confirm('Are you sure you want to delete ' + dt + '?')) {
      location = '/delete/' + id;
    }
  },

  getCookieValue: function (a) {
    // https://stackoverflow.com/questions/5639346/
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }
}


$(document).ready(function() {
  var c = decodeURIComponent(client.getCookieValue('user'));
  client.user = $.parseJSON(c.substr(2)); // substr to remove "j:"
  // console.log('user = ' + JSON.stringify(user));
  client.dataFields = client.user.fields.split(',');
  client.dataFields.unshift('date');
  $.ajax({
     dataType: 'json',
     url: '/records/' + client.user.id,
     success: function (response) {
        client.data = response;
        client.renderTable(0);
     },
     error: function (response) {
        console.error(response);
     }
  });
});
