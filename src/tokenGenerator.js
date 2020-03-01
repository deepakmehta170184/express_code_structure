const jwt = require('jsonwebtoken');

function TokenGenerator (secret, options) {
  this.secret = secret;
  this.options = options; //algorithm + keyid + noTimestamp + expiresIn + notBefore
}

TokenGenerator.prototype.sign = function(payload) {
  const jwtSignOptions = Object.assign({}, this.options);
  return jwt.sign(payload, this.secret, jwtSignOptions);
}

// refreshOptions.verify = options you would use with verify function
// refreshOptions.jwtid = contains the id for the new token
TokenGenerator.prototype.refresh = function(token) {
  const payload = jwt.verify(token, this.secret);
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti; //We are generating a new token, if you are using jwtid during signing, pass it in refreshOptions
  const jwtSignOptions = Object.assign({ }, this.options);
  // The first signing converted all needed options into claims, they are already in the payload
  return jwt.sign(payload, this.secret, jwtSignOptions);
}

module.exports = TokenGenerator;