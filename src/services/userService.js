import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';
import {userModel} from '~/models/userModel.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {pickUser} from '~/utils/formatter.js';
import {env} from '~/config/environment.js';
import {BrevoProvider} from '~/providers/BrevoProvider.js';
import {jwtProvider} from '~/providers/JwtProvider.js';
import {CloudinaryProvider} from '~/providers/CloudinaryProvider.js';
import crypto from 'crypto';
import { clientRedis } from '~/config/redis.js';

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
        const failedLoginKey = loginData.email;
        const blockLoginKey = `block:${loginData.email}`;

        if (await clientRedis.exists(blockLoginKey)) {
            throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, "This email is temporarily blocked. Please try again later");
        }

        const user = await userModel.findOneByEmail(loginData.email);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid email or password");
        }
        const isPasswordValid =  bcrypt.compareSync(loginData.password, user.password);
        if (!isPasswordValid) {
            const failedLoginCount = await clientRedis.incr(failedLoginKey);

            if (failedLoginCount === 1) {
                await clientRedis.expire(failedLoginKey, 120);
            }

            if (failedLoginCount >= 5) {
                await clientRedis.del(failedLoginKey);
                await clientRedis.set(blockLoginKey, '1', { EX: 120 });
                throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, "This email is temporarily blocked. Please try again later");
            }

            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid email or password");
        }
        if (!user.isActive) {
            throw new ApiError(StatusCodes.FORBIDDEN, "Email not verified");
        } 

        await clientRedis.del(failedLoginKey);

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
        console.log("Updating user with data:");
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
const updateProfile = async ( userId, updateData, avatarFile) => {
    
    try {
        console.log("Updating profile for userId:", userId, "with data:", updateData);
      
        const user = await userModel.findOneById(userId);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        let updateUser ={};
        if(updateData.password || updateData.newPassword){
               if (!updateData.password || !updateData.newPassword) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, "Missing password fields");
                    }
                if(!bcrypt.compareSync(updateData.password, user.password)){
                    throw new ApiError(StatusCodes.BAD_REQUEST, "Current password is incorrect");
                }
            updateUser = await userModel.update(userId, { password: await bcrypt.hashSync(updateData.newPassword, 12) });
        }else if(avatarFile){
            // Handle avatar file upload logic here
            const avatarPath = await CloudinaryProvider.uploadStream(avatarFile.buffer, 'userAvatar');
            console.log('Avatar uploaded to Cloudinary:', avatarPath);
            updateUser = await userModel.update(userId, { avatar: avatarPath.url });
        }
        else{
            updateUser = await userModel.update(userId, updateData);
        }
        return pickUser(updateUser); 
    } catch (error) {
        console.error("❌ userService.updateProfile error:", error);
        throw error;
    }
}
const getProfile = async (userId) => {
    try {
        const user = await userModel.findOneById(userId);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        return pickUser(user);
    } catch (error) {
        console.error("❌ userService.getProfile error:", error);
        throw error;
    }
}

const forgotPassword = async (email) => {
    try {
        const user = await userModel.findOneByEmail(email);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        const otp = crypto.randomInt(100000, 1000000).toString();
          const customText = `Hi ${user.username},\n
                            \nThis is your password reset code:\n
                            \n${otp}\n
                            \nIf you did not request a password reset, please ignore this email.\n
                            \nBest regards,
                            \nYour Team`;
        const customSubject = 'Password Reset Request';
        await clientRedis.set(`forgotPassword:${email}`, otp, { EX: 300 }); // 5 minutes expiration

        await BrevoProvider.sendEmail(user.email, customSubject, customText);
        console.log('Password reset email sent successfully');
        return { message: "Password reset email sent successfully" , otp: otp}; // Return the OTP for testing purposes
    } catch (error) {
        console.error("❌ userService.forgotPassword error:", error);
        throw error;
    }
}

const checkOtp = async (email, otp) => {
    try {
        const user = await userModel.findOneByEmail(email);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        const storedOtp = await clientRedis.get(`forgotPassword:${email}`);
        if (!storedOtp) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "OTP has expired or is invalid");
        }
        if (storedOtp !== otp) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP");
        }
        await clientRedis.del(`forgotPassword:${email}`);
        console.log('checkotp success');
        return { message: "OTP verified successfully" };
    }
    catch (error) {
        console.error("❌ userService.checkOtp error:", error);
        throw error;
    } 
}
const resetPassword = async (email, newPassword) => {
    try {
        const user = await userModel.findOneByEmail(email);
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        const hashedPassword = await bcrypt.hashSync(newPassword, 12);
        await userModel.update(user._id, { password: hashedPassword });
        return { message: "Password reset successfully" };
    }
    catch (error) {
        console.error("❌ userService.resetPassword error:", error);
        throw error;
    }
}

export const userService = {
    createNew,
    login,
    verifyEmail,
    refreshToken,
    updateProfile,
    getProfile,
    forgotPassword,
    checkOtp,
    resetPassword
}