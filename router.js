const express = require('express');
const router = express.Router();
const records = require('./models/records');
const users = require('./models/users');

router.get('/', async(req, res, next) => {
  if (!req.cookies.user) {
    return res.redirect('/profile');
  }
  let fields = req.cookies.user.fields.split(',');
  fields.unshift('date');

  return res.render('index', {
    scripts: ['records.js'],
    user: req.cookies.user,
    fields: fields,
    title: 'Index'
  });
});

router.get('/profile', async(req, res, next) => {
  return res.render('profile', {
    scripts: ['profile.js'],
    fields: await records.getFields(),
    users: await users.getUsers(),
    title: 'Select a profile'
  });
});

router.post('/profile', async(req, res, next) => {
  let fields = [];
  let keys = Object.keys(req.body);
  for(var i=0; i<keys.length; i++) {
    if (keys[i].indexOf('field-') != -1) {
      fields.push(keys[i].replace('field-',''));
    }
  }

  let params = {
    id:req.body.id,
    username:req.body.username,
    fields:fields.join()
  }

  console.log('saving profile: ' + JSON.stringify(user));
  await users.setUser(params);

  // if the user is logged in - update the user cookie
  if (req.cookies.user && req.cookies.user.id == params.id) {
    var user = await users.getUser(req.params.id);
    res.cookie('user', user);
  }

  return res.redirect('/profile');
});

router.get('/user/:id', async(req, res, next) => {
  var user = await users.getUser(req.params.id);
  return res.send(user);
});
router.get('/login/:id', async(req, res, next) => {
  var user = await users.getUser(req.params.id);
  res.cookie('user', user);
  return res.redirect('/');
});
router.get('/records/:id', async(req, res, next) => {
  var rows = await records.getRecords(req.params.id);
  return res.send(rows);
});
router.post('/records', async(req, res, next) => {
  if (!req.cookies.user) {
    return res.redirect('/profile');
  }
  let fields = req.cookies.user.fields.split(',');
  fields.unshift('date','user');

  await records.setRecord(fields, req.body);
  return res.redirect('/');
});

module.exports = router;
