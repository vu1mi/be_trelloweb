import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';

import {  
    ROLE_REGEX_EMAIL,
    ROLE_ERRORS_EMAIL,
    ROLE_REGEX_PASSWORD,
    ROLE_ERRORS_PASSWORD,
    ROLE_REGEX_FULLNAME,
    ROLE_ERRORS_FULLNAME } from '~/utils/validators'

const createNew = async (req, res,next)=>{
     const correctCondition = Joi.object({
       email: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
       password: Joi.string().min(8).required().pattern(ROLE_REGEX_PASSWORD).message(ROLE_ERRORS_PASSWORD),
       username: Joi.string().min(3).max(50).required().pattern(ROLE_REGEX_FULLNAME).message(ROLE_ERRORS_FULLNAME),

     });
     try {
       
        await correctCondition.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }
}
const login = async (req, res,next)=>{
  const correctCondition = Joi.object({
    email: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
    password: Joi.string().min(8).required().pattern(ROLE_REGEX_PASSWORD).message(ROLE_ERRORS_PASSWORD),
  });
  try {
      await correctCondition.validateAsync(req.body , { abortEarly: false }  );
      next()
    
   }
    catch (error) {    const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
      }
}

const verifyEmail = async (req, res,next)=>{
  const correctCondition = Joi.object({
    email: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
    token: Joi.string().required(),
  });
  try {
      await correctCondition.validateAsync(req.body , { abortEarly: false }  );
      next()
    }
    catch (error) {    const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
      }
}
const updateProfile = async (req, res,next)=>{
  const correctCondition = Joi.object({
    password: Joi.string().pattern(ROLE_REGEX_PASSWORD).message(ROLE_ERRORS_PASSWORD),
    newPassword: Joi.string().pattern(ROLE_REGEX_PASSWORD).message(ROLE_ERRORS_PASSWORD),
    username: Joi.string().min(3).max(50).pattern(ROLE_REGEX_FULLNAME).message(ROLE_ERRORS_FULLNAME),
    email: Joi.string().min(3).max(30).pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
    avatar: Joi.string().uri(),
  });
  try {
      await correctCondition.validateAsync(req.body , { abortEarly: false }  );
      next()
    }
    catch (error) {    const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
      }
    }

    const forgotPassword = async (req, res,next)=>{
      const correctCondition = Joi.object({
        email: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
      });
      try {
          await correctCondition.validateAsync(req.body , { abortEarly: false }  );
          next()
        }
        catch (error) {    const newMessage = new  Error(error).message;
          const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
          next(customError);
          }
    }
    const resetPassword = async (req, res,next)=>{
      const correctCondition = Joi.object({
        email: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
        newPassword: Joi.string().min(8).required().pattern(ROLE_REGEX_PASSWORD).message(ROLE_ERRORS_PASSWORD),
      });
      try {
          await correctCondition.validateAsync(req.body , { abortEarly: false }  );
          next()
        }
        catch (error) {    const newMessage = new  Error(error).message;
          const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
          next(customError);
          }
    }
    const checkOtp = async (req, res,next)=>{
      const correctCondition = Joi.object({
        email: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
        otp: Joi.string().pattern(/^\d{6}$/).required().messages({'string.pattern.base': 'OTP must be exactly 6 digits'})
      });
      try {
          await correctCondition.validateAsync(req.body , { abortEarly: false }  );
          next()
        }
        catch (error) {    const newMessage = new  Error(error).message;
          const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
          next(customError);
          }
    }



export const userValidation = {
  createNew,
  login,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkOtp
};