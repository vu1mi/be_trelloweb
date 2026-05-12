import {slugify} from '~/utils/formatter.js'
import { ColumnModel } from '~/models/columnModel.js'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep, get } from 'lodash';
import { BoardModel } from '~/models/boardModel.js';
import { CardModel } from '~/models/cardModel';

const  createNew = async (data)=>{
    try{
        const newColumn = {
            ...data,
        }
        const createColumn = await ColumnModel.createNew(newColumn);
        const getColumn = await ColumnModel.findOne(createColumn._id);

        if(getColumn){
            getColumn.cards = []

            await BoardModel.pushColumnToBoard(getColumn);
        }
        console.log("get column:", createColumn);
        

        return getColumn
    }catch(error){
         const newMessage = new  Error(error).message;
      const customError = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, newMessage);
          throw customError
    }
}
const deleteColumn = async (columnId) => {
    try {
        const column = await ColumnModel.findOne(columnId); 
        if (!column) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Column not found');
        }   
        const deletedColumn = await ColumnModel.deleteColumn(columnId);
        await BoardModel.pullColumnFromBoard(column);
        await CardModel.pullAllCardsFromColumn(column);
        return deletedColumn;
    }catch (error) {
            throw error
        }
}

export const columnService ={
    createNew,
    deleteColumn
}