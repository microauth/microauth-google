const test = require("ava");
const sandbox = require("sinon").createSandbox();
const uuid = require("uuid");
const { OAuth2Client } = require("google-auth-library");
const microAuthGoogle = require(".");

const oAuth2ClientStub = sandbox.stub(OAuth2Client.prototype);
const uuidV4Stub = sandbox.spy(uuid, "v4");

const mockServer = (req, res, ...args) => async fn => {
  if (!fn) return;
  try {
    return fn(req, res, ...args);
  } catch (error) {
    console.log(error);
    return fn(req, res, { err: error });
  }
};

test.afterEach(() => {
  sandbox.reset();
});

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

test("should throw an error if, somehow, there's a ill formed url", async t => {
  const service = microAuthGoogle({
    clientId: "foo",
    clientSecret: "bar",
    callbackUrl: "http://localhost:3000/callback"
  });

  const req = {
    url: ":3000"
  };
  const res = {};
  const mock = mockServer(req, res);

  await mock(
    service(async (req, res, { err }) => {
      t.is(err.code, "ERR_INVALID_URL");
    })
  );
});

test.serial("should generate a valid auth url and redirect", async t => {
  const service = microAuthGoogle({
    clientId: "foo",
    clientSecret: "bar",
    callbackUrl: "http://localhost:3000/callback"
  });

  const req = {
    url: "/"
  };
  const res = {
    statusCode: 0,
    setHeader: sandbox.stub(),
    end: sandbox.stub()
  };
  const mock = mockServer(req, res);
  const redirectUrl = "https://google.com/where?account=1";
  const authStub = oAuth2ClientStub.generateAuthUrl.returns(redirectUrl);

  await mock(service(() => {}));
  t.is(uuidV4Stub.callCount, 1);
  t.is(authStub.callCount, 1);
  t.is(res.statusCode, 307);
  t.is(res.setHeader.callCount, 1);
  t.true(res.setHeader.calledWith("Location", redirectUrl));
  t.is(res.end.callCount, 1);
});

test.serial("should fail to generate a valid auth url", async t => {
  const service = microAuthGoogle({
    clientId: "foo",
    clientSecret: "bar",
    callbackUrl: "http://localhost:3000/callback"
  });

  const req = {
    url: "/"
  };
  const res = {};
  const mock = mockServer(req, res);
  const authStub = oAuth2ClientStub.generateAuthUrl.throws(new Error("fubar"));

  await mock(
    service(async (req, res, { err }) => {
      t.is(authStub.callCount, 1);
      t.is(err.message, "fubar");
    })
  );
});

test.serial("should fail due to no pairing state", async t => {
  const service = microAuthGoogle({
    clientId: "foo",
    clientSecret: "bar",
    callbackUrl: "http://localhost:3000/callback"
  });

  const req = {
    url: "/callback?code=1&state=1"
  };
  const res = {};
  const mock = mockServer(req, res);

  oAuth2ClientStub.getToken.returns(Promise.resolve("token"));
  oAuth2ClientStub.requestAsync.returns(
    Promise.resolve({
      name: "foo"
    })
  );

  await mock(
    service(async (req, res, { err }) => {
      t.is(err.message, "Invalid state");
    })
  );
});
