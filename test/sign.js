/* jshint esversion: 6 */
/* jslint node: true */
'use strict';

const cose = require('../');
const test = require('ava');
const jsonfile = require('jsonfile');
const base64url = require('base64url');

test('create sign-pass-01', (t) => {
  const example = jsonfile.readFileSync('test/Examples/sign-tests/sign-pass-01.json');
  const p = example.input.sign.protected;
  const u = example.input.sign.unprotected;
  const plaintext = Buffer.from(example.input.plaintext);

  const signers = [{
    'key': {
      'd': base64url.toBuffer(example.input.sign.signers[0].key.d)
    },
    'u': example.input.sign.signers[0].unprotected,
    'p': example.input.sign.signers[0].protected
  }];

  return cose.sign.create(
    {'p': p, 'u': u},
    plaintext,
    signers
  )
  .then((buf) => {
    t.true(Buffer.isBuffer(buf));
    t.true(buf.length > 0);
    t.is(buf.toString('hex'), example.output.cbor.toLowerCase());
  });
});

test('create sign-pass-02', (t) => {
  const example = jsonfile.readFileSync('test/Examples/sign-tests/sign-pass-02.json');
  const p = example.input.sign.protected;
  const u = example.input.sign.unprotected;
  const plaintext = Buffer.from(example.input.plaintext);

  const signers = [{
    'key': {
      'd': base64url.toBuffer(example.input.sign.signers[0].key.d)
    },
    'u': example.input.sign.signers[0].unprotected,
    'p': example.input.sign.signers[0].protected,
    'externalAAD': Buffer.from(example.input.sign.signers[0].external, 'hex')
  }];

  return cose.sign.create(
    {'p': p, 'u': u},
    plaintext,
    signers,
    {'encodep': 'empty'}
  )
  .then((buf) => {
    t.true(Buffer.isBuffer(buf));
    t.true(buf.length > 0);
    t.is(buf.toString('hex'), example.output.cbor.toLowerCase());
  });
});

test('create sign-pass-03', (t) => {
  const example = jsonfile.readFileSync('test/Examples/sign-tests/sign-pass-03.json');
  const p = example.input.sign.protected;
  const u = example.input.sign.unprotected;
  const plaintext = Buffer.from(example.input.plaintext);

  const signers = [{
    'key': {
      'd': base64url.toBuffer(example.input.sign.signers[0].key.d)
    },
    'u': example.input.sign.signers[0].unprotected,
    'p': example.input.sign.signers[0].protected
  }];

  return cose.sign.create(
    {'p': p, 'u': u},
    plaintext,
    signers,
    {
      'encodep': 'empty',
      'excludetag': true
    }
  )
  .then((buf) => {
    t.true(Buffer.isBuffer(buf));
    t.true(buf.length > 0);
    t.is(buf.toString('hex'), example.output.cbor.toLowerCase());
  });
});

test('verify sign-pass-01', (t) => {
  const example = jsonfile.readFileSync('test/Examples/sign-tests/sign-pass-01.json');

  const verifier = {
    'key': {
      'x': base64url.toBuffer(example.input.sign.signers[0].key.x),
      'y': base64url.toBuffer(example.input.sign.signers[0].key.y),
      'kid': example.input.sign.signers[0].key.kid
    }
  };

  const signature = Buffer.from(example.output.cbor, 'hex');

  return cose.sign.verify(
    signature,
    verifier)
  .then((buf) => {
    t.true(Buffer.isBuffer(buf));
    t.true(buf.length > 0);
    t.is(buf.toString('utf8'), example.input.plaintext);
  });
});

test('verify sign-pass-02', (t) => {
  const example = jsonfile.readFileSync('test/Examples/sign-tests/sign-pass-02.json');

  const verifier = {
    'key': {
      'x': base64url.toBuffer(example.input.sign.signers[0].key.x),
      'y': base64url.toBuffer(example.input.sign.signers[0].key.y),
      'kid': example.input.sign.signers[0].key.kid
    },
    'externalAAD': Buffer.from(example.input.sign.signers[0].external, 'hex')
  };

  const signature = Buffer.from(example.output.cbor, 'hex');

  return cose.sign.verify(
    signature,
    verifier)
  .then((buf) => {
    t.true(Buffer.isBuffer(buf));
    t.true(buf.length > 0);
    t.is(buf.toString('utf8'), example.input.plaintext);
  });
});

test('verify sign-pass-03', (t) => {
  const example = jsonfile.readFileSync('test/Examples/sign-tests/sign-pass-03.json');

  const verifier = {
    'key': {
      'x': base64url.toBuffer(example.input.sign.signers[0].key.x),
      'y': base64url.toBuffer(example.input.sign.signers[0].key.y),
      'kid': example.input.sign.signers[0].key.kid
    }
  };

  const signature = Buffer.from(example.output.cbor, 'hex');

  return cose.sign.verify(
    signature,
    verifier)
  .then((buf) => {
    t.true(Buffer.isBuffer(buf));
    t.true(buf.length > 0);
    t.is(buf.toString('utf8'), example.input.plaintext);
  });
});
