const Sessions = require('../models/sessions');
const Users = require('../models/users');

async function requireAuth(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies.pt_session) {
      // Fallback to cookie
      token = req.cookies.pt_session;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.'
      });
    }

    const session = await Sessions.findByToken(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    const user = await Users.findById(session.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error verifying session:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during session validation.'
    });
  }
}

async function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies.pt_session) {
      token = req.cookies.pt_session;
    }

    if (token) {
      const session = await Sessions.findByToken(token);
      if (session) {
        const user = await Users.findById(session.userId);
        if (user) {
          req.user = user;
          req.sessionToken = token;
        }
      }
    }
    next();
  } catch (err) {
    // Non-blocking for optional auth
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth
};
