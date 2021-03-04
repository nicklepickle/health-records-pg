var client = {
  m2in: function() {
    var m = new Number($('#height').val());
    if (!isNaN(m)) {
      var i = Math.floor((m * 39.3701) % 12);
      var f = Math.floor((m * 39.3701) / 12);
      $('#inches').val(i);
      $('#feet').val(f);
    }
  },
  in2m: function() {
    var i = new Number($('#inches').val());
    var f = new Number($('#feet').val());
    if (!isNaN(i) && !isNaN(f)) {
      $('#height').val((i + f * 12) * .0254);
    }
    else if (!isNaN(f)) {
      $('#height').val(f * 12 * .0254);
    }
  },
  edit: function(user) {
    $('.field-select input[type=checkbox]').each(function(){
      $(this).prop('checked', false);
    });
    if (user == 0) {
      $('#id').val(0);
      $('#username').val('');
      $('#height').val('');
      $('#edit-profile').show();
      $('#username').focus();
    }
    else {
      var dt = Date.now();
      $.ajax({
         dataType: 'json',
         url: '/user/' + user +'?dt=' + dt,
         success: function (response) {
           $('#id').val(user);
           $('#username').val(response.username);
           if (response.height != null) {
             $('#height').val(response.height);
           }
           var fields = response.fields.split(',');
           for(var i=0; i<fields.length; i++) {
             var f = fields[i].replace(' ','-');
             //console.log(f + '||' + fields[i]);
             $('#field-' + f).prop('checked', true);
           }
           client.m2in();
           $('#edit-profile').show();
         },
         error: function (response) {
            console.error(response);
         }
      });
    }
  }
}
