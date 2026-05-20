import {slugify} from '~/utils/formatter.js'
import { CardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep, get } from 'lodash';
import { ColumnModel } from '~/models/columnModel';
// import {deleteCard} from '~/models/cardModel.js';

const  createNew = async (data)=>{
    try{
        const newCard = {
            ...data,
        }
        const createCard = await CardModel.createNew(newCard);
        const getCard = await CardModel.findOne(createCard._id);
        
                if(getCard){
        
                    await ColumnModel.pushCardToColumn(getCard);
                }

        return getCard
    }catch(error){
          throw error
    }
}

const deleteCard = async (cardId) => {
    try {
        const card = await CardModel.findOne(cardId);
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Card not found');
        }
        const deletedCard = await CardModel.deleteCard(cardId);
        await ColumnModel.pullCardFromColumn(card);
        return deletedCard;
    }catch (error) { 
            throw error
        }
}

// const getBoardById = async (boardId) => {
//     try {
//         const board = await BoardModel.getDetail(boardId);
//         if (!board) {
//             throw new ApiError(StatusCodes.NOT_FOUND , 'Board not found');
//         }

//         const boardClone = cloneDeep(board);
//         boardClone.columns.array.forEach(element => {
//             element.cards = boardClone.cards.filter(card => String(card.columnId) === String(element._id)); 
//         });
//         delete boardClone.cards;
//         return boardClone;
//     } catch (error) {
//         throw error;
//     }
// };

// const updateBoard = async (boardId, updateData) => {
//     try {
//         await BoardModel.update(boardId, updateData);
//         const updatedBoard = await BoardModel.findOne(boardId);
//         return updatedBoard;
//     } catch (error) {
//         throw error;
//     }
// };
const updateCard = async (cardId, updateData) => {
    try {
        const card = await CardModel.findOne(cardId);
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Card not found');
        }
        await CardModel.updateCard(cardId, updateData);
        const updatedCard = await CardModel.findOne(cardId);
        return updatedCard;
    }
        catch (error) {
            throw error;
        }
}   
export const cardService ={
    createNew,
    deleteCard,
    updateCard
}