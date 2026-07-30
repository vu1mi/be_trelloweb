
 import Joi from 'joi';
 import { StatusCodes } from 'http-status-codes';
 import  ApiError  from '~/utils/ApiError.js';
 import {ObjectId} from 'mongodb';
 import {GET_DB} from '~/config/mongodb.js';
 import {BrevoProvider} from '~/providers/BrevoProvider.js';
 
import {   ROLE_MESSAGES,
    ROLE_REGEX_EMAIL,
    ROLE_ERRORS_EMAIL,
    OBJECT_ID_RULE,
    OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


 export  const COMMENT_COLLECTION_NAME = 'comments';
 const USER_COLLECTION_SCHEMA = Joi.object({
    cardId:Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    content: Joi.string().required(),
    email: Joi.string().required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
    displayName: Joi.string(),
    avatar : Joi.string().default(null),
    createdAt: Joi.date().default(Date.now), 
    updatedAt: Joi.date().default(Date.now),
 })



  const createNew = async (commentData) => {
    
    try {
        const validData = await USER_COLLECTION_SCHEMA.validateAsync(commentData, { abortEarly: false });
        const result = await GET_DB().collection(COMMENT_COLLECTION_NAME).insertOne(validData);
        const commentnew = await GET_DB()
              .collection(COMMENT_COLLECTION_NAME)
              .findOne({ _id: result.insertedId })
        return commentnew;
    } catch (error) {
        console.error("❌ UserModel.createNew error:", error);
        throw error;
    }   
}

const getAll = async (cardId) => {
    try {
        console.log( 'cardId',cardId)
        const allcomment = await GET_DB().collection(COMMENT_COLLECTION_NAME)
                        .find({cardId:cardId})
                        .sort({ createdAt: -1 })
                        .toArray();
        console.log(allcomment)
        return allcomment;
    } catch (error) {
        console.error("❌ UserModel.findOneByEmail error:", error);
        throw error;
    }
};



export const commentModel = {
    createNew,
    getAll

}