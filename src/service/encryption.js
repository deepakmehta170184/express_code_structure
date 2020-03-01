import crypto from "crypto";
import {
  resolve
} from "path";
import {
  rejects
} from "assert";
const {
  generateKeyPair
} = require('crypto');

const encryptStringWithRsaPublicKey = function (toEncrypt, publicKey) {
  let buffer = Buffer.from(JSON.stringify(toEncrypt));
  let encrypted = crypto.publicEncrypt(publicKey, buffer);
  let key = encrypted.toString("base64")
  return key
};

const decryptStringWithRsaPrivateKey = function (toDecrypt, privateKey, passphrase) {
  let buffer = Buffer.from(toDecrypt, "base64");
  let decrypted = crypto.privateDecrypt({
    key: privateKey.toString(),
    passphrase: passphrase,
  }, buffer);
  let key = decrypted.toString("utf8");
  return key
};

const createPublicAndPrivateKey = async function (passphrase) {
  return new Promise((resolve, rejects) => {
    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: passphrase
      }
    }, (err, publicKey, privateKey) => {
      resolve({
        publicKey: publicKey,
        privateKey: privateKey
      })
    });
  })
}


export default {
  encryptStringWithRsaPublicKey: encryptStringWithRsaPublicKey,
  decryptStringWithRsaPrivateKey: decryptStringWithRsaPrivateKey,
  createPublicAndPrivateKey: createPublicAndPrivateKey
}