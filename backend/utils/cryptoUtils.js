const crypto = require('crypto');

/**
 * Hash a plain password using Node.js built-in crypto.scrypt
 */
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a plain password against the stored salt:hash string
 */
function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    if (!storedHash || !storedHash.includes(':')) {
      return resolve(false);
    }
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
}

/**
 * Generate a cryptographically secure random session token
 */
function generateSecureToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Create a simple SHA256 hash (e.g. for password reset tokens)
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken
};
