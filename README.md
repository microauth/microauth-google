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
//  tokens: {Object with needed tokens to reuse with Google's OAuth2 instance}
// }}
module.exports = googleAuth(async (req, res, auth) => {

  if (!auth) {
    return send(res, 404, 'Not Found');
  }

  if (auth.err) {
    // Error handler
    return send(res, 403, 'Forbidden');
  }

  return `Hello ${auth.result.info.displayName}`;
});

```

Run:
```sh
micro app.js
```

Now visit `http://localhost:3000/auth/google`

## Author
[Rui Pedro Lima](https://github.com/rapzo)
