const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const { authenticate, requireManager } = require('../../middlewares/authMiddlewares');

// manager creates users
router.post('/create', authenticate, requireManager, controller.register);

// login
router.post('/login', controller.login);

// profile
router.get('/profile', authenticate, controller.profile);

// list all users - manager only
router.get('/', authenticate, requireManager, controller.listUsers);

// update role - manager only
router.put('/:id/role', authenticate, requireManager, controller.updateRole);

// update password - self only
router.put('/:id/password', authenticate, controller.updatePassword);

// delete user - manager only (only staff can be deleted)
router.delete('/:id', authenticate, requireManager, controller.deleteUser);

module.exports = router;
