var client = {
  data: [],
  dataFields: [],
  // scatter works better for fields that can't be zero or you would be dead
  scatterFields: ['weight','pulse','basal temp','body temp'],
  traceField: function (field, type) {
    var trace = {x:[], y:[], type: type, name: field};
    for(var i=0; i<client.data.length; i++) {
      if (client.data[i][field]) {
        var dt = new Date(client.data[i].date);
        //trace.x.push(dt.toLocaleDateString('en-US'));
        trace.x.push(dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate());
        trace.y.push(client.data[i][field]);
      }
    }
    return trace;
  },

  traceAverage: function(field, m, y) {
    var average = {
      x:[], y:[],
      type: 'scatter',
      name: 'average',
      mode:'lines',
      line:{color:'#dde'}
    };

    var m = -1, total = 0, count = 0, now = new Date();
    for(var i=0; i<client.data.length; i++) {
      total += Number(client.data[i][field]);
      count ++;
      var dt = new Date(client.data[i].date);
      if (dt.getMonth() != m || dt.toDateString() == now.toDateString()) {
        m = dt.getMonth();
        average.x.push(dt.getFullYear() + '-' + (m + 1) + '-' + dt.getDate());
        average.y.push(total/count);
        count = total = 0;
      }
    }

    return average;
  },

  plotField: function (field) {
    if (field == 'systolic' || field == 'diastolic') {
      var systolic = client.traceField('systolic', 'scatter');
      var diastolic = client.traceField('diastolic', 'scatter');
      Plotly.newPlot('data-canvas', [systolic, diastolic]);
      $('#data-label').html('Blood Pressure');
    }
    else if (client.scatterFields.includes(field)) {
      var trace = client.traceField(field, type);
      var average = client.traceAverage(field);
      Plotly.newPlot('data-canvas', [average, trace]);
      $('#data-label').html('Weight');
    }
    else {
      var type = client.scatterFields.includes(field) ? 'scatter' : 'bar';
      var trace = client.traceField(field, type);
      Plotly.newPlot('data-canvas', [trace]);
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
        headers.append('<th style="background-color:#eee;">Date</th>');
      }
      else {
        headers.append('<th><a href="#" onclick="client.plotField(\''+field+'\')">' +
        field + '</a></th>');
      }
    };

    $('#data-table').html(headers);

    for(var i=0; i < client.data.length; i++) {
      var row ='<tr>';
      for(var ii = 0; ii < client.dataFields.length; ii++) {
        var field = client.dataFields[ii];
        var cell = client.data[i][field] == null ? '' : client.data[i][field];

        if (client.data[i].id == id) {
          // this is the row selected for editing
          var value = field == 'date' ? new Date(cell).toLocaleDateString('en-US') : cell;
          cell = '<input type="text" value="'+value+'" name="'+field+'" /></td>';
        }
        else if (field== "date") {
          var dt = new Date(cell);
          cell = '<a href="javascript:client.renderTable('+client.data[i]['id']+')">' +
            dt.toLocaleDateString('en-US') + '</a>';
        }
        row +='<td>'+cell+'</td>';

      }
      row += '</tr>';
      dataTable.append(row);
    }
    if (!id) {
      // no id is selected for editing so allow new records
      var row ='<tr id="new-entry" style="display:none;">';
      var last = client.data.length > 0 ? client.data[client.data.length - 1] : null;
      for(var i = 0; i < client.dataFields.length; i++) {
        var value = '';
        if (client.dataFields[i] == 'date') {
          value = new Date().toLocaleDateString('en-US');
        }
        else if (last && last[client.dataFields[i]]) {
          value = last[client.dataFields[i]];
        }
        row +='<td><input type="text" value="'+value+'" name="'+client.dataFields[i]+'" /></td>';
      }
      row += '</tr>';
      dataTable.append(row);
      $('#data-form input[type="submit"]').attr('value','New Entry');
      $('#data-form').submit(function() {
        if ($('#new-entry').is(':hidden')) {
          $('#new-entry').show();
          $('#data-form input[name="date"]').focus();
          $('#data-form input[type="submit"]').attr('value','Submit');
          return false;
        }
        return true;
      });
    }
    else {
      $('#id').val(id);
      $('#data-form input[name="date"]').focus();
      $('#data-form input[type="submit"]').attr('value','Submit');
      $('form').submit(function() { return true; });
    }
  },

  closeCanvas: function() {
    $('#canvas-container').hide(client.transition);
  },

  getCookieValue: function (a) {
    // https://stackoverflow.com/questions/5639346/
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }
}


$(document).ready(function() {
  var c = decodeURIComponent(client.getCookieValue('user'));
  var user = $.parseJSON(c.substr(2)); // substr to remove "j:"
  // console.log('user = ' + JSON.stringify(user));
  client.dataFields = user.fields.split(',');
  client.dataFields.unshift('date');
  $.ajax({
     dataType: 'json',
     url: '/records/' + user.id,
     success: function (response) {
        client.data = response;
        client.renderTable();
     },
     error: function (response) {
        console.error(response);
     }
  });
});
