
import { StatusCodes } from 'http-status-codes';
import {boardService} from '~/services/boardService.js';

const createNew = async (req, res,next)=>{
    
     try {
     
        const userId = req.jwtDecode._id; // Assuming the user ID is available in req.jwtDecode
        const result = await boardService.createNew(req.body , userId);
         res.status(StatusCodes.CREATED).json(result)
         return result
      
     } catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
        }
}

const getBoardById = async (req, res, next) => {
    try {
        const boardId = req.params.id;
        const board = await boardService.getBoardById(boardId);
        res.status(StatusCodes.OK).json(board);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
    }
};

const updateBoard = async (req, res, next) => {
    try {
        const boardId = req.params.id;
        const updateData = req.body;
        const updatedBoard = await boardService.updateBoard(boardId, updateData);
        res.status(StatusCodes.OK).json(updatedBoard);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
    }
};

const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecode._id; // Assuming the user ID is available in req.jwtDecode
        const {page , pageSize , q} = req.query;
        console.log("Received query parameters:", { page, pageSize, q });
        const querysearch = q
        console.log("Fetching boards with title:", querysearch);
        console.log("Fetching all boards for userId:", userId);
        const boards = await boardService.getAllBoards(userId , page , pageSize , querysearch);
        res.status(StatusCodes.OK).json(boards);
    } catch (error) {
        console.error("Error fetching boards:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
    }
     
};

export const boardController = {
  createNew,
  getBoardById,
  updateBoard,
    getAllBoards
};