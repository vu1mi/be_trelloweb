import {slugify} from '~/utils/formatter.js'
import { ColumnModel } from '~/models/columnModel.js'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep, get } from 'lodash';
import { commentModel } from '~/models/commentModel.js';
import { userModel } from '~/models/userModel';
import { CardModel } from '~/models/cardModel';

const  createNew = async (data, userId ,cardId)=>{
    try{
        const card = await CardModel.findOne(cardId);
        if(!card){
            throw new ApiError(StatusCodes.NOT_FOUND , 'Card not found');
        }
        const userData = await userModel.findOneById(userId);
        const commentNew = {
            ...data , 
            cardId:cardId,
            email: userData.email,
            avatar:userData.avatar,
            displayName: userData.displayName
        }
        console.log("comment new:", commentNew);
        const resultNew = await commentModel.createNew(commentNew)

        return resultNew
    }catch(error){
         const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, newMessage);
          throw customError
    }
}
const getAll = async (cardId) => {
    try {
        const card = await CardModel.findOne(cardId); 
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Column not found');
        }   
     
         const allcomment =  await commentModel.getAll(cardId);
        return allcomment;
    }catch (error) {
            throw error
        }
}


export const commentService ={
    createNew,
    getAll
}