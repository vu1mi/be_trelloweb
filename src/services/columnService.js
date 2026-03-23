import {slugify} from '~/utils/formatter.js'
import { ColumnModel } from '~/models/columnModel.js'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep, get } from 'lodash';
import { BoardModel } from '~/models/boardModel.js';

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

export const columnService ={
    createNew,

}