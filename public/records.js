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
      mode:'lines'
      //line:{color:'#dde'}
    };

    var m = -1, total = 0, count = 0;
    var data = client.data;
    var last = client.lastRecord();
    var lastdt = last ? new Date(last.date) : new Date();
    for(var i=0; i<data.length; i++) {
      total += Number(data[i][field]);
      count ++;
      var dt = new Date(data[i].date);
      if (dt.getMonth() != m || dt.toDateString() == lastdt.toDateString()) {
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
      var trace = client.traceField(field, 'scatter');
      var average = client.traceAverage(field);
      Plotly.newPlot('data-canvas', [average, trace]);
      $('#data-label').html(field);
    }
    else {
      var trace = client.traceField(field, 'bar');
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
        if (client.user.order == 'desc') {
          headers.append('<th class="date">Date <a href="?order=asc">&#9651;</a></th>');
        }
        else {
          headers.append('<th class="date">Date <a href="?order=desc">&#9661;</a></th>');
        }
      }
      else {
        headers.append('<th><a href="#" onclick="client.plotField(\''+field+'\')">' +
        field + '</a></th>');
      }
    };

    /*
    if (client.user.order == 'desc') {
      data.sort(function(a,b) {
        return new Date(b.date) < new Date(a.date);
      });
    }
    */

    $('#data-table').html(headers);
    var newRow = '';
    if (!id) {
      // no id is selected for editing so allow new records
      newRow ='<tr id="new-entry" style="display:none;">';
      var last = client.lastRecord();
      for(var i = 0; i < client.dataFields.length; i++) {
        var value = '';
        if (client.dataFields[i] == 'date') {
          value = new Date().toLocaleDateString('en-US');
        }
        else if (last && last[client.dataFields[i]]) {
          value = last[client.dataFields[i]];
        }
        newRow +='<td><input type="text" value="'+value+'" name="'+client.dataFields[i]+'" /></td>';
      }
      newRow += '</tr>';
      $('#data-form input[type="submit"]').attr('value','New Entry');
      $('#data-form').submit(function() {
        if ($('#new-entry').is(':hidden')) {
          $('#new-entry').show();
          $('#cancel').show();
          $('#data-form input[name="date"]').focus();
          $('#data-form input[type="submit"]').attr('value','Submit');
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
    for(var i = 0; i < client.dataFields.length; i++) {
      var field = client.dataFields[i];
      var cell = record[field] == null ? '' : record[field];

      if (record.id == id) {
        // this is the row selected for editing
        var value = field == 'date' ? new Date(cell).toLocaleDateString('en-US') : cell;
        cell = '<input type="text" value="'+value+'" name="'+field+'" /></td>';
      }
      else if (field== "date") {
        var dt = new Date(cell);
        cell = '<a href="javascript:client.renderTable('+record.id+')">' +
          dt.toLocaleDateString('en-US') + '</a>';
      }
      row +='<td>'+cell+'</td>';

    }
    row += '</tr>';
    return row;
  },

  closeCanvas: function() {
    $('#canvas-container').hide(client.transition);
  },

  lastRecord: function() {
    return client.data.length > 0 ? client.data[client.data.length - 1] : null;
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
