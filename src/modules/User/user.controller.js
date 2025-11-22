const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const httpResponse = require('../../utils/httpResponse');
const httpError = require('../../utils/httpError');

const JWT_SECRET = process.env.JWT_SECRET || 'verysecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

module.exports = {
    register: async (req, res, next) => {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password || !role)  httpError(next, new Error('Missing required fields'), req, 400);

            // Only manager allowed to create users
            if (!req.user || req.user.role !== 'manager')  httpError(next, new Error('Forbidden'), req, 403);

            if (!['manager', 'staff'].includes(role))  httpError(next, new Error('Invalid role'), req, 400);

            const existing = await User.findOne({ email });
            if (existing)  httpError(next, new Error('Email already exists'), req, 409);

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const user = await User.create({ name, email, password: hash, role });
            httpResponse(req, res, 201, 'User created successfully', { id: user._id, email: user.email, role: user.role });
        } catch (error) {
            httpError(next, error, req, 500);
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password)  httpError(next, new Error('Missing email or password'), req, 400);

            const user = await User.findOne({ email });
            if (!user)  httpError(next, new Error('User not found'), req, 404);

            const match = await bcrypt.compare(password, user.password);
            if (!match)  httpError(next, new Error('Invalid credentials'), req, 401);

            const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
             httpResponse(req, res, 200, 'Login success', { token });
        } catch (error) {
            httpError(next, error, req, 500);
        }
    },
    profile: async (req, res, next) => {
        try {
            if (!req.user)  httpError(next, new Error('User Not Logged In'), req, 401);
            const user = await User.findById(req.user.id).select('-password');
            if (!user)  httpError(next, new Error('User not found'), req, 404);
            const welcome = `Welcome, ${user.name} (Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`;
             httpResponse(req, res, 200, welcome, user);
        } catch (error) {
            httpError(next, error, req, 500);
        }
    },
    listUsers: async (req, res, next) => {
        try {
            const users = await User.find().select('-password');
             httpResponse(req, res, 200, 'Success', users);
        } catch (error) {
            httpError(next, error, req, 500);
        }
    },
    updateRole: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (!['manager', 'staff'].includes(role))  httpError(next, new Error('Invalid role'), req, 400);
            const user = await User.findById(id);
            if (!user)  httpError(next, new Error('User not found'), req, 404);
            user.role = role;
            await user.save();
             httpResponse(req, res, 200, 'Role updated', { id: user._id, role: user.role });
        } catch (error) {
            httpError(next, error, req, 500);
        }
    },
    updatePassword: async (req, res, next) => {
        try {
            const { id } = req.params; // allow path param but only self
            const { oldPassword, newPassword } = req.body;
            if (!newPassword)  httpError(next, new Error('New password required'), req, 400);

            const targetId = id || req.user.id;
            if (String(targetId) !== String(req.user.id))  httpError(next, new Error('Forbidden'), req, 403);

            const user = await User.findById(targetId);
            if (!user)  httpError(next, new Error('User not found'), req, 404);

            if (oldPassword) {
                const match = await bcrypt.compare(oldPassword, user.password);
                if (!match)  httpError(next, new Error('Invalid old password'), req, 401);
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
             httpResponse(req, res, 200, 'Password updated');
        } catch (error) {
            httpError(next, error, req, 500);
        }
    }
,
    deleteUser: async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user)  httpResponse(req, res, 404, 'User not found');

            // Only allow deletion of staff accounts via this endpoint
            if (user.role !== 'staff')  httpResponse(req, res, 403, 'Can only delete staff accounts');

            await user.deleteOne();
             httpResponse(req, res, 200, 'User deleted');
        } catch (error) {
            httpError(next, error, req, 500);
        }
    }
};
