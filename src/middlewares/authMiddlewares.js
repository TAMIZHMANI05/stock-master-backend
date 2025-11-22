const jwt = require('jsonwebtoken');
const httpResponse = require('../utils/httpResponse');
const httpError = require('../utils/httpError')

const JWT_SECRET = process.env.JWT_SECRET || 'verysecret';

const authenticate = (req, res, next) => {
    try {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header || !header.startsWith('Bearer ')) {
             httpResponse(req, res, 401, 'User Not Logged In');
        }
        const token = header.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.id, role: payload.role, email: payload.email };
         next();
    } catch (error) {
         httpError(next, error, req, 500);
    }
};

const requireManager = (req, res, next) => {
    if (!req.user)  httpResponse(req, res, 401, 'User Not Logged In');
    if (req.user.role !== 'manager')  httpResponse(req, res, 403, 'Forbidden');
     next();
};

module.exports = { authenticate, requireManager };
