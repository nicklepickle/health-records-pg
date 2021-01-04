var client = {
  data: [],
  dataFields: [],
  transition: 90,
  traceField: function (field) {
    var trace = {x:[], y:[], mode: 'lines+markers', name: field};
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

  plotField: function (field) {
    if (field == 'systolic' || field == 'diastolic') {
      var systolic = client.traceField('systolic');
      var diastolic = client.traceField('diastolic');
      Plotly.newPlot('data-canvas', [systolic, diastolic]);
      $('#data-label').html('Blood Pressure');
    }
    else {
      var trace = client.traceField(field);
      Plotly.newPlot('data-canvas', [trace]);
      $('#data-label').html(field);
    }
    $('#canvas-container').show(client.transition);
  },

  renderTable: function() {
    var dataTable = $('#data-table');
    for(var i=0; i < client.data.length; i++) {
      var row ='<tr>';
      for(var ii = 0; ii < client.dataFields.length; ii++) {
        var cell = client.data[i][client.dataFields[ii]];
        if (cell) {
          if (client.dataFields[ii] == "date") {
            var dt = new Date(cell);
            cell = dt.toLocaleDateString('en-US');
          }
          row +='<td>'+cell+'</td>';
        }
        else {
          row +='<td></td>';
        }
      }
      row += '</tr>';
      dataTable.append(row);
    }

    var row ='<tr id="new-entry" style="display:none;">';
    var last = client.data.length > 0 ? client.data[client.data.length - 1] : null;
    for(var i = 0; i < client.dataFields.length; i++) {
      var value = '';
      if (client.dataFields[i] == 'date') {
        value = new Date().toLocaleDateString('en-US');
      }
      else if (last) {
        value = last[client.dataFields[i]];
      }
      row +='<td><input type="text" value="'+value+'" name="'+client.dataFields[i]+'" /></td>';
    }
    row += '</tr>';
    dataTable.append(row);

    //@todo - fix this if there's a second form
    $('form').submit(function() {
      if ($('#new-entry').is(':hidden')) {
        $('#new-entry').show();
        $('input[name="date"]').focus();
        $('input[type="submit"]').attr('value','Submit');
        return false;
      }
      return true;
    });
  },

  closeCanvas: function() {
    $('#canvas-container').hide(client.transition);
  }
}

$(document).ready(function() {
  var user = $('#user').val();
  $('#data-table th a').each(function() {
    client.dataFields.push($(this).html());
  });

  $.ajax({
     dataType: 'json',
     url: '/records/' + user,
     success: function (response) {
        client.data = response;
        client.renderTable();
     },
     error: function (response) {
        console.error(response);
     }
  });
});
