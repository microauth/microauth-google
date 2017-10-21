'use strict'

const {send} = require('micro');
const microAuthGoogle = require('./');

const options = {
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/auth/google/callback',
  path: '/auth/google',
  scope: 'https://www.googleapis.com/auth/plus.me'
};

const googleAuth = microAuthGoogle(options);

module.exports = googleAuth(async (req, res, auth) => {
  if (!auth) {
    return send(res, 404, 'Not Found');
  }

  if (auth.err) {
    // Error handler
    console.error(auth.err)
    return send(res, 403, 'Forbidden');
  }

  return `Hello ${auth.result.info.displayName}`;
});
