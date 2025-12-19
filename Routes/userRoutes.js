const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUserRole
} = require('../Controller/userController');
const { isAuthenticated, authorizeRoles } = require('../Middleware/AuthMiddleware');

router.get('/profile', isAuthenticated, getUserProfile);
router.put('/profile', isAuthenticated, updateUserProfile);

router.get('/', isAuthenticated, authorizeRoles('admin'), getAllUsers);
router.get('/:id', isAuthenticated, authorizeRoles('admin'), getUserById);
router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteUser);
router.put('/:id/role', isAuthenticated, authorizeRoles('admin'), updateUserRole);

module.exports = router;
