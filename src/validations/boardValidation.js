import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';
import { BOARD_TYPE } from '~/utils/constants.js';

const createNew = async (req, res,next)=>{
     const correctBoard = Joi.object({
       title: Joi.string().min(3).max(30).required().trim().strict(),
       description: Joi.string().required().max(300).trim().strict(),
       type:Joi.string().valid(BOARD_TYPE.PRIVATE,BOARD_TYPE.PUBLIC).required()
     });
     try {
     
        await correctBoard.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }
}

export const boardValidation = {
  createNew
};