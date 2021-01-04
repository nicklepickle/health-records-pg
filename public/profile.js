var client = {
  edit: function(user) {
    $('.field-select input[type=checkbox]').each(function(){
      $(this).prop('checked', false);
    });
    if (user == 0) {
      $('#id').val(0);
      $('#username').val('');
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
           var fields = response.fields.split(',');
           for(var i=0; i<fields.length; i++) {
             var f = fields[i].replace(' ','-');
             console.log(f + '||' + fields[i]);
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
