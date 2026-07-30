import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import  ApiError  from '~/utils/ApiError.js';
import {BOARD_INVITATION_STATUS} from '~/utils/constants'
import { ROLE_REGEX_EMAIL ,ROLE_ERRORS_EMAIL,OBJECT_ID_RULE,OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNewBoardInvitation = async (req, res,next)=>{
     const correctInvitation = Joi.object({
       inviteeEmail: Joi.string().min(3).max(30).required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
       boardId: Joi.string().required().trim(),
        boardInvitation: Joi.object({
                    boardId:Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
                    status:Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
                }).optional(),
     });
     try {
   
        await correctInvitation.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }
}

const getAllInvitationById = async(req, res , next) =>{
  const correctInvitationData = {
    invitee: Joi.string().required().trim(),
  }
   try {
   
        await correctInvitationData.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }

}

const updateInitation  = async(req, res , next) =>{
   const updateInvitationData =Joi.object({
     boardInvitation: Joi.object({
                    boardId:Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
                    status:Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
                }).optional(),
})
    try {
   
        await updateInvitationData.validateAsync(req.body , { abortEarly: false }  );
        next()
      
     } catch (error) {
      const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
      next(customError);
        }
}

export const invitationValidation = {
  createNewBoardInvitation,
  getAllInvitationById,
  updateInitation
};