client.m2in = function() {
  var m = new Number($('#height').val());
  if (m > 0) {
    var i = Math.floor((m * 39.3701) % 12);
    var f = Math.floor((m * 39.3701) / 12);
    $('#inches').val(i);
    $('#feet').val(f);
  }
};

client.in2m = function() {
  var i = new Number($('#inches').val());
  var f = new Number($('#feet').val());
  if (i > 0 && f > 0) {
    $('#height').val((i + f * 12) * .0254);
  }
  else if (f > 0) {
    $('#height').val(f * 12 * .0254);
  }
};

client.login = function(user, protected) {
  $('#user').val(user);
  if (!protected) {
    $('#login-form').submit();
  }
  else {
    $('#login-overlay').show();
  }
}

client.edit = function(user, protected) {
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
    $('#persist').prop('checked',true);
    $('#edit-profile').show();

    setTimeout(function(){ $('#username').focus(); }, 50);

  }
  else {
    if (!client.user || user != client.user.id) {
      $('#bounce').val('/profile?edit=' + user);
      client.login(user, protected);
      return;
    }
   $('#id').val(user);
   $('#username').val(client.user.username);
   if (client.user.height != null) {
     $('#height').val(client.user.height);
     client.m2in();
   }
   else {
     $('#height').val('');
     $('#feet').val('');
     $('#inches').val('');
   }
   var fields = client.user.fields.split(',');
   for(var i=0; i<fields.length; i++) {
     var f = fields[i].replace(' ','-');
     //console.log(f + '||' + fields[i]);
     $('#field-' + f).prop('checked', true);
   }

   $('#' + client.user.theme).prop('checked',true);
   $('#persist').prop('checked', client.user.persist);
   $('#protected').prop('checked', client.user.protected);
   client.togglePassword();
   $('#edit-profile').show();
  }
};

client.togglePassword = function() {
  if ($('#protected').prop('checked')) {
    $('#password-container').show();
  }
  else {
    $('#password-container').hide();
  }
};


$(document).ready(function() {
  // @todo!!! - fix this mess
  var n = window.location.search.indexOf('edit=');
  if (n > -1) {
    // @todo - this won't handle any additional params
    var user = window.location.search.substring(n + 5);
    client.edit(user);
  }
  n = window.location.search.indexOf('failed=');
  if (n > -1) {
    // @todo - this won't handle any additional params
    var user = window.location.search.substring(n + 7);
    $('#login-error').show();
    console.log('failed user = ' + user);
    client.login(user, true);
  }
});
