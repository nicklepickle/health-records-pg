const express = require('express');
const router = express.Router();
const records = require('./models/records');
const users = require('./models/users');
const config = require('./config.js')
const bcrypt = require('bcrypt');

router.get('/', async(req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.redirect('/profile');
    }

    let user = req.session.user;
    let fields = user.fields.split(',');
    fields.unshift('date');
    if (req.query.order && user.order != req.query.order) {
      await users.setOrder(user.id, req.query.order);
      user = await users.getUser(user.id);
      req.session.user = user;
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
    return next(error);
  }
});

router.get('/profile', async(req, res, next) => {
  try {
    let user = req.session.user;

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
    return next(error);
  }
});

router.post('/profile', async(req, res, next) => {
  try {
    let user = req.session.user;
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
      protected:req.body.protected?true:false,
      password:req.body.password,
      fields:fields.join()
    }

    let userId = await users.setUser(params);

    // update the user
    req.session.user = await users.getUser(userId);

    return res.redirect('/profile');
  }
  catch(error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', async(req, res, next) => {
  try {
    req.session.regenerate( async(error) => {
      if (error) {
        console.error(error);
      }
      let user = await users.getUser(req.body.user);
      if (user.protected && !bcrypt.compareSync(req.body.login, user.password)) {
        return res.redirect('/profile?failed=' + req.body.user);
      }

      if (!user.persist) {
        req.session.cookie.maxAge = null;
      }
      req.session.user = user;
      // only allow bounce to local paths
      if (req.body.bounce && req.body.bounce[0] == '/') {
        return res.redirect(req.body.bounce);

      }
      return res.redirect('/');

    });
  }
  catch(error) {
    console.error(error);
    return next(error);
  }
});

router.get('/records', async(req, res, next) => {
  try {
    if (!req.session.user) {
      throw('No user session.')
    }
    let user = req.session.user;
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
    return next(error);
  }
});

router.post('/records', async(req, res, next) => {
  try {
    let user = req.session.user;
    // no user is logged in or update is not for logged in user
    if (!user || req.body.user != user.id) {
      return res.redirect('/profile');
    }
    let fields = user.fields.split(',');
    fields.unshift('date','user');

    await records.setRecord(fields, req.body);
    return res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return next(error);
  }
});

router.get('/delete/:id', async(req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/profile');
    }
    let user = req.session.user;
    var deleted = await records.deleteRecord(user.id, req.params.id);
    return res.redirect('/');
  }
  catch(error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
