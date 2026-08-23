import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';

import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res,next)=>{
     const correctBoard = Joi.object({
       title: Joi.string().min(3).max(30).required().trim().strict(),
       description: Joi.string().max(300).trim().strict(),
       boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

     });
     try {
        console.log("req.body:", req.body);
        console.log("correctBoard:", req.body);
        await correctBoard.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }
}
const update = async (req, res,next)=>{
  const correctBoard = Joi.object({
    title: Joi.string().min(3).max(30).trim().strict(),
    description: Joi.string().max(300).trim().strict(),
    cardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
  }).min(1);
  try {
    console.log("req.id:", req.params.id);
     console.log("req.body:", req.body);
     console.log("correctBoard:", req.body);
     await correctBoard.validateAsync(req.body , { abortEarly: false }  );
     next()
  } catch (error) {
   const newMessage = new  Error(error).message;
   const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
   next(customError);
     }
    }

export const columnValidation = {
  createNew,
  update
};