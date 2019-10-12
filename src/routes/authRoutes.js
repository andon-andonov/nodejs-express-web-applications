const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:authRoutes');
const passport = require('passport');

const authRouter = express.Router();

function router() {
  authRouter.route('/signup')
    .post((req, res) => {
      const { username, password } = req.body;
      const url = 'mongodb://localhost:27017';
      const dbName = 'libraryApp';

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url,
            { useNewUrlParser: true, useUnifiedTopology: true });
          debug('Connected correctly to server');
          const db = client.db(dbName);
          const col = await db.collection('users');
          const user = { username, password };
          const results = await col.insertOne(user);
          req.login(results.ops[0], () => {
            res.redirect('/auth/profile');
          });
        } catch (err) {
          debug(err.stack);
        } finally {
          if (client) {
            client.close();
          }
        }
      }());
    });

  authRouter.route('/signin')
    .get((req, res) => {
      res.render('signin', {
        title: 'Sign In',
      });
    })
    .post(passport.authenticate('local', {
      successRedirect: '/auth/profile',
      failureRedirect: '/',
    }));

  authRouter.route('/profile')
    .get((req, res) => {
      res.json(req.user);
    });

  return authRouter;
}

module.exports = router;
