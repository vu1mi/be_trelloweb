import {slugify} from '~/utils/formatter.js'
import { BoardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';

const  createNew = async (data)=>{
    try{
        const newBoard = {
            ...data,
         slug: slugify(data.title)
        }
        const createBoarded = await BoardModel.createNew(newBoard);
        const findOne = await BoardModel.findOne(createBoarded._id);

        return findOne
    }catch(error){
         const newMessage = new  Error(error).message;
         const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
          throw customError
    }
}

const getBoardById = async (boardId) => {
    try {
        const board = await BoardModel.getDetail(boardId);
        console.log("Board details:", board);
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Board not found');
        }

        const boardClone = cloneDeep(board);
        console.log("Board with columns and cards:", boardClone);
        boardClone.columns.forEach(element => {
            element.cards = boardClone.cards.filter(card => String(card.columnId) === String(element._id)); 
        });
        delete boardClone.cards;
        
        return boardClone;
    } catch (error) {
        throw error;
    }
};

const updateBoard = async (boardId, updateData) => {
    try {
        await BoardModel.update(boardId, updateData);
        const updatedBoard = await BoardModel.findOne(boardId);
        return updatedBoard;
    } catch (error) {
        throw error;
    }
};

export const boardService ={
    createNew,
    getBoardById,
    updateBoard
}