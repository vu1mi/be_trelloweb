import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';
import {userModel} from '~/models/userModel.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {pickUser} from '~/utils/formatter.js';
import {env} from '~/config/environment.js';
import {BrevoProvider} from '~/providers/BrevoProvider.js';
import {jwtProvider} from '~/providers/JwtProvider.js';
const createNew = async (userData) => {
    //kiem tra xem email da ton tai tren he thong hay chua
    try{
        const exituser = await userModel.findOneByEmail(userData.email);
        if(exituser){
            throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
        }

        const nameFromEmail = userData.email.split('@')[0];
        const newUser = {
            email: userData.email,
            password: await bcrypt.hashSync(userData.password, 12),
            username: userData.username || nameFromEmail,
            displayName: userData.username || nameFromEmail,
            verifyToken: uuidv4(),
        }

        const createdUser = await userModel.createNew(newUser);
        const getNewUser = await userModel.findOneByEmail(createdUser.email);

        const verificationLink = `${env.WEBSITE_DOMAIN}/account/verification?email=${createdUser.email}&token=${createdUser.verifyToken}`;
        const customSubject = 'Please verify your email address';

        const customText = `Hi ${createdUser.username},\n
                            \nPlease click the following link to verify your email address:\n
                            \n${verificationLink}\n
                            \nIf you did not create an account, please ignore this email.\n
                            \nBest regards,
                            \nYour Team`;

        await BrevoProvider.sendEmail(createdUser.email, customSubject, customText);
        return pickUser(getNewUser);
    }catch (error) {
        console.error("❌ userService.createNew error:", error);
        throw error;
}
}
const login = async (loginData) => {
    try {
        const user = await userModel.findOneByEmail(loginData.email);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid email or password");
        }
        const isPasswordValid =  bcrypt.compareSync(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid email or password");
        }
        if (!user.isActive) {
            throw new ApiError(StatusCodes.FORBIDDEN, "Email not verified");
        } 

        const userInfo = { 
            _id: user._id,
            email: user.email,
            // username: user.username,
          
        }

        const accessToken = await jwtProvider.generateToken(userInfo, 
            env.ACCESS_TOKEN_SECRET, 
            env.ACCESS_TOKEN_EXPIRES_IN
            
        );
        const refreshToken = await jwtProvider.generateToken(userInfo, 
                                                            env.REFRESH_TOKEN_SECRET, 
                                                            env.REFRESH_TOKEN_EXPIRES_IN
                                                            
                                                        );

        return { accessToken, refreshToken , ...pickUser(user) };
    }
    catch (error) {
        console.error("❌ userService.login error:", error);
        throw error;
    }
}
const verifyEmail = async (reqbody) => {
    try {
        const user = await userModel.findOneByEmail(reqbody.email);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        if (user.isActive) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Email already verified");
        }
        if (user.verifyToken !== reqbody.token) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid verification token");
        }
        const dataUpdate ={
            isActive: true,
            verifyToken: null
        }
        await userModel.update(user._id, dataUpdate);
        return pickUser(user);
    }
    catch (error) {
        console.error("❌ userService.verifyEmail error:", error);
        throw error;
    }
}

const refreshToken = async (refreshToken) => {
    try {
        const decoded = jwtProvider.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);

        const userInfo = {
            _id: decoded._id,
            email: decoded.email, 
        }

        const accessToken = await jwtProvider.generateToken(userInfo, 
                                                            env.ACCESS_TOKEN_SECRET, 
                                                            // env.ACCESS_TOKEN_EXPIRES_IN
                                                            env.ACCESS_TOKEN_EXPIRES_IN
                                                        );
        return { accessToken };
    } catch (error) {
        console.error("❌ userService.refreshToken error:", error);
        throw error;
    }
}

export const userService = {
    createNew,
    login,
    verifyEmail,
    refreshToken
}