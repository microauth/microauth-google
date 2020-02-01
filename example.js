const {send} = require('micro');
const microAuthGoogle = require('.');
const {CLIENT_ID, CLIENT_SECRET} = process.env;

const options = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackUrl: 'http://localhost:3000/auth/google/callback',
  path: '/auth/google'
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

  return `Hello ${auth.result.info.given_name}`;
});
