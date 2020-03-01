import {
    body
} from 'express-validator';

const register = () => {
    return [
        body('name', 'Full Name Is required').exists(),
        body('email')
        .exists().withMessage('Email Is required')
        .isEmail().withMessage('Invalid Email'),
        body('password')
        .exists().withMessage('Password Is required')
        .isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
        body('zip', 'Zip code is required').exists()
    ]
};

const login = () => {
    return [
        body('email')
        .exists().withMessage('Email Is required')
        .isEmail().withMessage('Invalid Email'),
        body('password', 'Password is required').exists()
    ]
};

const resetPassword = () => {
    return [
        body('password')
        .exists().withMessage('Password Is required')
        .isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
        body('confirmPassword')
        .exists().withMessage('Confirm Password required!')
    ]
}

const forgotPassword = () => {
    return [
        body('email')
        .exists().withMessage('Email Is required')
        .isEmail().withMessage('Invalid Email')
    ]
}

const updatePassword = () => {
    return [
        body('password')
        .exists().withMessage('Password Is required'),
        body('newPassword')
        .exists().withMessage('New Password Is required')
        .isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
        body('confirmPassword')
        .exists().withMessage('Confirm Password required!')
    ]
}

export default {
    register,
    login,
    resetPassword,
    forgotPassword,
    updatePassword
};