/* jshint esversion: 6 */
/* jslint node: true */
'use strict';

const cbor = require('cbor');
const crypto = require('crypto');
const Promise = require('any-promise');
const common = require('./common');
const Tagged = cbor.Tagged;
const EMPTY_BUFFER = common.EMPTY_BUFFER;

const MAC0Tag = 17;

const AlgFromTags = {
  4: 'SHA-256_64',
  5: 'SHA-256',
  6: 'SHA-384',
  7: 'SHA-512'
};

const COSEAlgToNodeAlg = {
  'SHA-256_64': 'sha256',
  'SHA-256': 'sha256',
  'HS256': 'sha256',
  'SHA-384': 'sha384',
  'SHA-512': 'sha512'
};

function doMac (context, p, externalAAD, payload, alg, key) {
  return new Promise((resolve, reject) => {
    const MACstructure = [
      context, // 'MAC0' or 'MAC1', // context
      p, // protected
      externalAAD, // bstr,
      payload // bstr
    ];

    const toBeMACed = cbor.encode(MACstructure);
    const hmac = crypto.createHmac(alg, key);
    hmac.end(toBeMACed, function () {
      resolve(hmac.read());
    });
  });
}

exports.create = function (headers, payload, recipents, externalAAD, options) {
  options = options || {};
  externalAAD = externalAAD || EMPTY_BUFFER;
  let u = headers.u || {};
  let p = headers.p || {};

  p = common.TranslateHeaders(p);
  u = common.TranslateHeaders(u);

  const alg = p.get(common.HeaderParameters.alg) || u.get(common.HeaderParameters.alg);

  if (!alg) {
    throw new Error('Missing mandatory parameter \'alg\'');
  }

  if (recipents.length === 0) {
    throw new Error('There has to be at least one recipent');
  }

  p = (!p.size) ? EMPTY_BUFFER : cbor.encode(p);
  if (recipents.length === 1) {
    // TODO check crit headers
    return doMac('MAC0',
      p,
      externalAAD,
      payload,
      COSEAlgToNodeAlg[AlgFromTags[alg]],
      recipents[0].key)
    .then((tag) => {
      if (options.excludetag) {
        return cbor.encode([p, u, payload, tag]);
      } else {
        return cbor.encode(new Tagged(MAC0Tag, [p, u, payload, tag]));
      }
    });
  }

  if (recipents.length > 1) {
    throw new Error('MACing with multiple recipents is not implemented');
  }
};

exports.read = function (data, key, externalAAD) {
  externalAAD = externalAAD || EMPTY_BUFFER;

  return cbor.decodeFirst(data)
  .then((obj) => {
    if (obj instanceof Tagged) {
      if (obj.tag !== MAC0Tag) {
        throw new Error('Unexpected cbor tag, \'' + obj.tag + '\'');
      }
      obj = obj.value;
    }

    if (!Array.isArray(obj)) {
      throw new Error('Expecting Array');
    }

    if (obj.length !== 4) {
      throw new Error('Expecting Array of lenght 4');
    }

    let [p, u, payload, tag] = obj;
    p = cbor.decode(p);
    p = (!p.size) ? EMPTY_BUFFER : p;
    u = (!u.size) ? EMPTY_BUFFER : u;
    if (p == EMPTY_BUFFER){
      const alg = u.get(common.HeaderParameters.alg);
    }else{
      for (var key2 in AlgFromTags){     
        if (key2 == p.get(1)){
          var alg = key2;
        }
      }  
    }
    key = Buffer.from(key,'hex');
    p = cbor.encode(p);
    return doMac('MAC0', p, externalAAD, payload, COSEAlgToNodeAlg[AlgFromTags[alg]], key)
    .then((calcTag) => {
      calcTag = calcTag.slice(0,8);
      if (tag.toString('hex') !== calcTag.toString('hex')) {
        throw new Error('Tag mismatch');
      }
      return payload;
    });
  });
};
