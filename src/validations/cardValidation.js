import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError.js';
import { BOARD_TYPE } from '~/utils/constants.js';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctBoard = Joi.object({
    title: Joi.string().min(3).max(30).required().trim().strict(),
    description: Joi.string().max(300).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC),
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  });
  try {
    console.log("req.body:", req.body);
    console.log("correctBoard:", req.body);
    await correctBoard.validateAsync(req.body, { abortEarly: false });
    next()

  } catch (error) {
    const newMessage = new Error(error).message;
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
    next(customError);
  }
}
const deleteCard = async (req, res, next) => {
  const correctBoard = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  });
  try {
    console.log("req.params:", req.params);
    await correctBoard.validateAsync(req.params, { abortEarly: false });
    next()
  } catch (error) {
    const newMessage = new Error(error).message;
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
    next(customError);
  }
}
const updateCard = async (req, res, next) => {
  const correctBoard = Joi.object({ 
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(30).trim().strict(),
    description: Joi.string().max(300).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC),
  });
  try {
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);
    await correctBoard.validateAsync({ ...req.params, ...req.body }, { abortEarly: false });
    next()
  }
    catch (error) {
    const newMessage = new Error(error).message;
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
    next(customError);
  }
}


export const cardValidation = {
  createNew,
  deleteCard,
  updateCard
};