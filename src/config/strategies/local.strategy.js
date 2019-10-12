const passport = require('passport');
const { Strategy } = require('passport-local');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:local.strategy');

module.exports = function localStrategy() {
  passport.use(new Strategy({
    usernameField: 'username',
    passwordField: 'password',
  }, (username, password, done) => {
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
        const user = await col.findOne({ username });
        if (user && user.password === password) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (err) {
        debug(err.stack);
      } finally {
        if (client) {
          client.close();
        }
      }
    }());
  }));
};
