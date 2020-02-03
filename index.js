const assert = require("assert");
const querystring = require("querystring");
const uuid = require("uuid");
const redirect = require("micro-redirect");
const { OAuth2Client } = require("google-auth-library");

const provider = "google";
/**
 * OpenID 2.0 compliance:
 * https://developers.google.com/identity/protocols/OpenIDConnect?hl=en#discovery
 */
const SCOPES = ["openid", "email", "profile"];
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const microAuthGoogle = ({
  clientId,
  clientSecret,
  callbackUrl,
  path = "/",
  scopes = [],
  accessType = "offline"
}) => {
  assert(clientId, "Must provide a clientId.");
  assert(clientSecret, "Must provide a clientSecret.");
  assert(callbackUrl, "Must provide a callbackUrl.");
  assert(path, "Must provide an url path.");

  const { host, protocol, pathname } = new URL(callbackUrl);
  assert(protocol, "Not a valid protocol in the callbackUrl string.");
  assert(host, "Not a valid host in the callbackUrl string.");
  assert(pathname, "Not a valid path in the callbackUrl string.");
  assert.notStrictEqual(path, pathname, "Service path cannot be the same as callback path");

  const client = new OAuth2Client(clientId, clientSecret, callbackUrl);
  const scope = [...(new Set(SCOPES.concat(scopes)))];
  const states = [];

  return fn => async (req, res, ...args) => {
    const url = new URL(`${protocol}//${host}${req.url}`);

    if (url.pathname === path) {
      try {
        const state = uuid.v4();

        states.push(state);

        const redirectUrl = client.generateAuthUrl({
          // eslint-disable-next-line camelcase
          access_type: accessType,
          scope,
          state
        });

        return redirect(res, 302, redirectUrl);
      } catch (error) {
        args.push({ error, provider });

        return fn(req, res, ...args);
      }
    }

    if (url.pathname === pathname) {
      try {
        const { state, code } = querystring.parse(url.search.substr(1));

        if (!states.includes(state)) {
          const error = new Error("Invalid state");
          args.push({ error, provider });
          return fn(req, res, ...args);
        }

        states.splice(states.indexOf(state), 1);

        const { tokens, error } = await client.getToken(code);

        if (error) {
          args.push({ error, provider });

          return fn(req, res, ...args);
        }

        client.setCredentials(tokens);

        const { data } = await client.requestAsync({
          url: USERINFO_URL
        });

        const result = {
          provider,
          info: data,
          client
        };

        args.push({ result });

        return fn(req, res, ...args);
      } catch (error) {
        args.push({ error, provider });

        return fn(req, res, ...args);
      }
    }

    return fn(req, res, ...args);
  };
};

module.exports = microAuthGoogle;
