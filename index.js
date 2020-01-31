'use strict'

const querystring = require('querystring')
const url = require('url')
const google = require('googleapis')
const uuid = require('uuid')
const redirect = require('micro-redirect')

const provider = 'google';
const {OAuth2} = google.auth
const plus = google.plus('v1')
const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/plus.me'
]

const getToken = (oauth2Client, code) => new Promise((resolve, reject) => {
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) return reject(err)

    oauth2Client.setCredentials(tokens)

    resolve(tokens)
  })
})

const getUser = oauth2Client => new Promise((resolve, reject) => {
  plus.people.get({userId: 'me', auth: oauth2Client}, (err, response) => {
    if (err) return reject(err)

    resolve(response)
  })
})

const microAuthGoogle = ({
  clientId,
  clientSecret,
  callbackUrl,
  path,
  scopes = [],
  accessType = 'offline'
}) => {
  const states = [];
  const oauth2Client = new OAuth2(clientId, clientSecret, callbackUrl)

  scopes = DEFAULT_SCOPES.concat(scopes).reduce((scopes, scope) => {
    if (!scopes.includes(scope)) scopes.push(scope)
    return scopes
  }, [])

  return fn => async (req, res, ...args) => {
    const {pathname, query} = url.parse(req.url)

    if (pathname === path) {
      try {
        const state = uuid.v4()
        states.push(state)

        const redirectUrl = oauth2Client.generateAuthUrl({
          // eslint-disable-next-line camelcase
          access_type: accessType,
          scope: scopes,
          state
        })

        return redirect(res, 302, redirectUrl)
      } catch (err) {
        args.push({err, provider})
        return fn(req, res, ...args)
      }
    }

    const callbackPath = url.parse(callbackUrl).pathname
    if (pathname === callbackPath) {
      try {
        const {state, code} = querystring.parse(query)

        if (!states.includes(state)) {
          const err = new Error('Invalid state')
          args.push({err, provider})
          return fn(req, res, ...args)
        }

        states.splice(states.indexOf(state), 1)

        const tokens = await getToken(oauth2Client, code)

        if (tokens.error) {
          args.push({err: tokens.error, provider});
          return fn(req, res, ...args);
        }

        const user = await getUser(oauth2Client)
        const result = {
          provider,
          accessToken: tokens.access_token,
          info: user,
          tokens
        }

        args.push({result})

        return fn(req, res, ...args)
      } catch (err) {
        args.push({err, provider})
        return fn(req, res, ...args)
      }
    }

    return fn(req, res, ...args)
  }
}

module.exports = microAuthGoogle
