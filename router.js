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
      user: user,
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
    let user = await users.getUser(userId);
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

router.get('/user/:id', async(req, res, next) => {
  try {
    let user = await users.getUser(req.params.id);
    return res.send(user);
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
    return res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return res.send(error);
  }
});

router.get('/records/:id', async(req, res, next) => {
  try {
    if (!req.query.format || req.query.format == 'json') {
      var rows = await records.getRecords(req.params.id);
      return res.send(rows);
    }
    else if (req.query.format == 'csv') {
      var user = await users.getUser(req.params.id);
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
    if (!req.cookies.user) {
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

module.exports = router;
