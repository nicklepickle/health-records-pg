const express = require('express');
const router = express.Router();
const records = require('./models/records');
const users = require('./models/users');

router.get('/', async(req, res, next) => {
  try {
    if (!req.cookies.user) {
      return res.redirect('/profile');
    }
    let user = req.cookies.user;
    let fields = user.fields.split(',');
    fields.unshift('date');
    if (req.query.order && user.order != req.query.order) {
      await users.setOrder(req.cookies.user.id, req.query.order);
      user = await users.getUser(req.cookies.user.id);
      res.cookie('user', user);
    }

    return res.render('index', {
      scripts: ['records.js'],
      user: JSON.stringify(user),
      userId: user.id,
      desc: user.order == 'desc',
      fields: fields,
      title: user.username,
      theme: user.theme
    });
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.get('/profile', async(req, res, next) => {
  try {
    let user = req.cookies.user;

    return res.render('profile', {
      scripts: ['profile.js'],
      user: user ? JSON.stringify(user) : null,
      fields: await records.getFields(),
      users: await users.getUsers(),
      title: 'Select Profile',
      theme: (user && user.theme) ? user.theme : 'light'
    });
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.post('/profile', async(req, res, next) => {
  try {
    let user = req.cookies.user;
    // only allow a new user or logged in user to update a profile
    if (req.body.id != 0 && req.body.id != user.id) {
      return res.redirect('/profile');
    }
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
      height:req.body.height,
      theme:req.body.theme,
      persist:req.body.persist?true:false,
      fields:fields.join()
    }

    let userId = await users.setUser(params);

    // update the user and cookie
    user = await users.getUser(userId);
    if (user.persist) {
      res.cookie('user', user, { maxAge: 1000 * 86400 * users.persistDays});
    }
    else {
      res.cookie('user', user);
    }
    return res.redirect('/profile');
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.get('/login/:id', async(req, res, next) => {
  try {
    let user = await users.getUser(req.params.id);
    if (user.persist) {
      res.cookie('user', user, { maxAge: 1000 * 86400 * users.persistDays});
    }
    else {
      res.cookie('user', user);
    }
    // only allow bounce to local paths
    if (req.query.bounce && req.query.bounce[0] == '/') {
      return res.redirect(req.query.bounce);
    }
    return res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.get('/records', async(req, res, next) => {
  try {
    if (!req.cookies.user) {
      throw('No user selected.')
    }
    let user = req.cookies.user;
    if (!req.query.format || req.query.format == 'json') {
      var rows = await records.getRecords(user.id);
      return res.send(rows);
    }
    else if (req.query.format == 'csv') {
      var fields = user.fields.split(',');
      var csv = await records.getCsv(user.id, fields);
      res.set('Content-Type', 'application/octet-stream');
      res.attachment('health-records.csv');
      return res.send(Buffer.from(csv));
    }
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.post('/records', async(req, res, next) => {
  try {
    let user = req.cookies.user;
    // no user is logged in or update is not for logged in user
    if (!user || req.body.user != user.id) {
      return res.redirect('/profile');
    }
    let fields = req.cookies.user.fields.split(',');
    fields.unshift('date','user');

    await records.setRecord(fields, req.body);
    return res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.get('/delete/:id', async(req, res, next) => {
  try {
    if (!req.cookies.user) {
      return res.redirect('/profile');
    }
    let user = req.cookies.user;
    var deleted = await records.deleteRecord(user.id, req.params.id);
    return res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

module.exports = router;
