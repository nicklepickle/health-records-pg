var client = {
  m2in: function() {
    var m = new Number($('#height').val());
    if (m > 0) {
      var i = Math.floor((m * 39.3701) % 12);
      var f = Math.floor((m * 39.3701) / 12);
      $('#inches').val(i);
      $('#feet').val(f);
    }
  },
  in2m: function() {
    var i = new Number($('#inches').val());
    var f = new Number($('#feet').val());
    if (i > 0 && f > 0) {
      $('#height').val((i + f * 12) * .0254);
    }
    else if (f > 0) {
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
      $('#feet').val('');
      $('#inches').val('');
      $('#light').prop('checked',true);
      $('#edit-profile').show();

      setTimeout(function(){ $('#username').focus(); }, 50);

    }
    else {
      var dt = Date.now();
      $.ajax({
         dataType: 'json',
         url: '/user/' + user +'?dt=' + dt,
         success: function (response) {
           $('#id').val(user);
           $('#username').val(response.username);
           $('#' + response.theme).prop('checked',true);
           if (response.height != null) {
             $('#height').val(response.height);
             client.m2in();
           }
           else {
             $('#height').val('');
             $('#feet').val('');
             $('#inches').val('');
           }
           var fields = response.fields.split(',');
           for(var i=0; i<fields.length; i++) {
             var f = fields[i].replace(' ','-');
             //console.log(f + '||' + fields[i]);
             $('#field-' + f).prop('checked', true);
           }

           $('#edit-profile').show();
         },
         error: function (response) {
            console.error(response);
         }
      });
    }
  }
}
