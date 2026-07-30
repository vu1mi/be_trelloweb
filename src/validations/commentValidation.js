import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';

import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res,next)=>{
     const correctComment = Joi.object({
       content: Joi.string().required().trim(),
     });
     try {
   
        await correctComment.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }
}


export const commentValidation = {
  createNew
};