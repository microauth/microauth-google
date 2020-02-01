const test = require('ava');
const sandbox = require('sinon').createSandbox();
const microAuthGoogle = require('.');

test('should fail if no argument is supplied', t => {
  t.throws(() => microAuthGoogle(), {instanceOf: Error});
});

test('should fail if clientId is not supplied', t => {
  t.throws(() => {
    microAuthGoogle({});
  }, {
    message: /Must provide a clientId/
  });
});

test('should fail if clientSecret is not supplied', t => {
  t.throws(() => {
    microAuthGoogle({
      clientId: 'foo'
    });
  }, {
    message: /Must provide a clientSecret/
  });
});

test('should fail if callbackUrl is not supplied', t => {
  t.throws(() => {
    microAuthGoogle({
      clientId: 'foo',
      clientSecret: 'bar',
      callbackUrl: null
    });
  }, {
    message: /Must provide a callbackUrl/
  });
});

test('should fail if path is not supplied', t => {
  t.throws(() => {
    microAuthGoogle({
      clientId: 'foo',
      clientSecret: 'bar',
      callbackUrl: 'baz',
      path: null
    });
  }, {
    message: /Must provide an url path/
  });
});

test('should fail if path is the same as callbackUrl', t => {
  t.throws(() => {
    microAuthGoogle({
      clientId: 'foo',
      clientSecret: 'bar',
      callbackUrl: 'baz',
      path: 'baz'
    });
  }, {
    message: /Path cannot be the same as callbackUrl/
  });
});

test('should return a valid micro service', t => {
  const service = microAuthGoogle({
    clientId: 'foo',
    clientSecret: 'bar',
    callbackUrl: 'baz',
    path: 'bat'
  });

  t.is(typeof service, 'function');
});

sandbox.restore();