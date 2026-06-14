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


export const userValidation = {
  createNew,
  login,
  verifyEmail
};