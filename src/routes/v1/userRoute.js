import express  from "express";
import {userValidation} from '~/validations/userValidation.js';
import {userController} from '~/controllers/userController';
import {authMiddleware} from '~/middlewares/authMiddleware.js';
import {multeruploadMiddleware} from '~/middlewares/multerUploadMiddleware.js';

const Router = express.Router();

    Router.route('/register')
        .post(userValidation.createNew, userController.createNew);
        
    Router.route('/login')
        .post(userValidation.login, userController.login);

    Router.route('/verify')
        .put(userValidation.verifyEmail, userController.verifyEmail);    
    Router.route('/logout')
        .delete(userController.logout);
    Router.route('/refresh_token')
        .get(userController.refreshToken);
    
    Router.route('/profile')
        .get(userController.getProfile)
        .patch(authMiddleware.isAuth, multeruploadMiddleware.upload.single('avatar'), userValidation.updateProfile, userController.updateProfile);

    Router.route('/forgot-password')
        .post(userValidation.forgotPassword, userController.forgotPassword);
    Router.route('/reset-password')
        .put(userValidation.resetPassword, userController.resetPassword);
    Router.route('/check_otp')
        .post(userValidation.checkOtp, userController.checkOtp);
export const userRoute = Router;