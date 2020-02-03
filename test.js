const test = require("ava");
const sandbox = require("sinon").createSandbox();
const microAuthGoogle = require(".");

test("should fail if no argument is supplied", t => {
  t.throws(() => microAuthGoogle(), { instanceOf: Error });
});

test("should fail if clientId is not supplied", t => {
  t.throws(
    () => {
      microAuthGoogle({});
    },
    {
      message: /Must provide a clientId/
    }
  );
});

test("should fail if clientSecret is not supplied", t => {
  t.throws(
    () => {
      microAuthGoogle({
        clientId: "foo"
      });
    },
    {
      message: /Must provide a clientSecret/
    }
  );
});

test("should fail if callbackUrl is not supplied", t => {
  t.throws(
    () => {
      microAuthGoogle({
        clientId: "foo",
        clientSecret: "bar",
        callbackUrl: null
      });
    },
    {
      message: /Must provide a callbackUrl/
    }
  );
});

test("should fail if path is not supplied", t => {
  t.throws(
    () => {
      microAuthGoogle({
        clientId: "foo",
        clientSecret: "bar",
        callbackUrl: "http://localhost:3000/callback",
        path: null
      });
    },
    {
      message: /Must provide an url path/
    }
  );
});

test("shoud fail if callbackUrl is not a valid full url", t => {
  const invalidUrl = "baz";

  t.throws(
    () => {
      microAuthGoogle({
        clientId: "foo",
        clientSecret: "bar",
        callbackUrl: "baz"
      });
    },
    {
      message: `Invalid URL: ${invalidUrl}`
    }
  );
});

test("should fail if path is the same as callbackUrl", t => {
  t.throws(
    () => {
      microAuthGoogle({
        clientId: "foo",
        clientSecret: "bar",
        callbackUrl: "http://localhost:3000/",
        path: "/"
      });
    },
    {
      message: /Service path cannot be the same as callback path/
    }
  );
});

test("should return a valid micro function", t => {
  const service = microAuthGoogle({
    clientId: "foo",
    clientSecret: "bar",
    callbackUrl: "http://localhost:3000/callback"
  });

  t.is(typeof service, "function");
});

sandbox.restore();
