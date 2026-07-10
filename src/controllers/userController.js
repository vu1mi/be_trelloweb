
import {StatusCodes} from 'http-status-codes';
import {userService} from '~/services/userService.js';
import ApiError from '~/utils/ApiError.js'
import ms from 'ms';

const createNew = async (req, res, next) => {
    try {
        const newUser = await userService.createNew( req.body);
        res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
        next(error);
    }
}
const login = async (req, res, next) => {
    try {
        // Logic for user login will go here
        const result = await userService.login(req.body);
        res.cookie('accessToken', result.accessToken, { httpOnly: true,
                                                        secure: true,
                                                        sameSite: 'none',
                                                        maxAge: 15 * 1000});
        res.cookie('refreshToken', result.refreshToken, { httpOnly: true, 
                                                        secure: true, 
                                                        sameSite: 'none',
                                                        maxAge: ms('14 days')  });
        res.status(StatusCodes.OK).json({ message: 'Login successful', user: result });
    } catch (error) {
        next(error);
    }
}
const verifyEmail = async (req, res, next) => {
    try {
        // Logic for email verification will go here
        const result = await userService.verifyEmail(req.body);
        res.status(StatusCodes.OK).json({ message: 'Email verified successfully', user: result });
    } catch (error) {
        next(error);
    }
}
const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'none' });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
        res.status(StatusCodes.OK).json({ message: 'Logout successful' , loggedOut: true});
    } catch (error) {
        next(error);
    }
}

const refreshToken = async (req, res, next) => {
    try {
        const result = await userService.refreshToken(req.cookies?.refreshToken);
        res.cookie('accessToken', 
            result.accessToken, 
            {   httpOnly: true, 
                secure: true, 
                sameSite: 'none', 
                maxAge: ms('14 days') 
            });
   
        res.status(StatusCodes.OK).json({ message: 'Token refreshed successfully' });
    } catch (error) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, "Please login again!"));
    }
}
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.jwtDecode?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
        }
        const avatarFile = req.file; // Access the uploaded file from multer
        console.log('Received avatar file:', avatarFile);
        const result = await userService.updateProfile(userId, req.body, avatarFile);
        res.status(StatusCodes.OK).json({ message: 'Profile updated successfully', user: result });
    } catch (error) {
        next(error);
    }
}
const getProfile = async (req, res, next) => {
    try {
        const userId = req.jwtDecode?._id;
        if (!userId) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
        }
        const result = await userService.getProfile(userId);
        res.status(StatusCodes.OK).json({ message: 'Profile retrieved successfully', user: result });
    } catch (error) {
        next(error);
    }
}

export const userController = {
    createNew,
    login,
    verifyEmail,
    updateProfile,
    getProfile,
    logout,
    refreshToken
}