import { StatusCodes } from 'http-status-codes';
import {columnService} from '~/services/columnService.js';

const createNew = async (req, res,next)=>{
    
     try {
        console.log("req.body:", req.body);
        const result = await columnService.createNew(req.body);
         res.status(StatusCodes.CREATED).json(result)
         console.log("Created column:", result);
         return result
      
     } catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
        }
}
const deleteColumn = async (req, res, next) => {
    try {
        const columnId = req.params.id;
        const deletedColumn = await columnService.deleteColumn(columnId);
        res.status(StatusCodes.NO_CONTENT).json(deletedColumn);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
    }
};

// const getBoardById = async (req, res, next) => {
//     try {
//         const boardId = req.params.id;
//         const board = await boardService.getBoardById(boardId);
//         res.status(StatusCodes.OK).json(board);
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
//     }
// };

// const updateBoard = async (req, res, next) => {
//     try {
//         const boardId = req.params.id;
//         const updateData = req.body;
//         const updatedBoard = await boardService.updateBoard(boardId, updateData);
//         res.status(StatusCodes.OK).json(updatedBoard);
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
//     }
// };

export const columnController = {
  createNew,
  deleteColumn
};