# microauth-google

> Google oauth for [micro](https://github.com/zeit/micro/)

[![Build Status](https://travis-ci.org/microauth/microauth-google.svg?branch=master)](https://travis-ci.org/microauth/microauth-google)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Greenkeeper badge](https://badges.greenkeeper.io/microauth/microauth-google.svg)](https://greenkeeper.io/)

Add [google](https://google.com) authentication to your [micro](https://github.com/zeit/micro/) in few lines of code.

Inspired by [Dmitry Pavlovsky](http://palosk.in) [microauth-github](https://github.com/microauth/microauth-github)

## Installation

```sh
npm install --save microauth-google
# or
yarn add microauth-google
```

## Usage

app.js
```js
const { send } = require('micro');
const microAuthGoogle = require('microauth-google');

const options = {
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/auth/google/callback',
  path: '/auth/google',
  scope: 'https://www.googleapis.com/auth/plus.me'
};

const googleAuth = microAuthGoogle(options);

// third `auth` argument will provide error or result of authentication
// so it will {err: errorObject} or {result: {
//  provider: 'google',
//  accessToken: 'blahblah',
//  info: userInfo,
//  client: OAuth2Client instance
// }}
module.exports = googleAuth(async (req, res, auth) => {

  if (!auth) {
    return send(res, 404, 'Not Found');
  }

  if (auth.err) {
    // Error handler
    return send(res, 403, 'Forbidden');
  }

  return `Hello ${auth.result.info.display_name}`;
});

```

Run:
```sh
micro app.js
```

Now visit `http://localhost:3000/auth/google`

### Scopes

**String|String[]**
Scopes define the access list the app needs. It can either be a string or an array of strings.
Default scopes and **always** present are the mandatory from [OpenID 2.0](https://developers.google.com/identity/protocols/OpenIDConnect?hl=en#discovery):
- `openid`
- `email`
- `profile`

### OAuth2Client

**OAuth2Client**
An instance of **OAuth2Client** is supplied for further use, mainly because this module no longer relies on `googleapis` nor it has as dependecy.


## Author
[Rui Pedro Lima](https://github.com/rapzo)
