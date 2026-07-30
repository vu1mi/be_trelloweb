import { StatusCodes } from 'http-status-codes';
import {commentService} from '~/services/commentService.js';

const createNew = async (req, res)=>{
     try {
        const cardId = req.params.cardId
        const userId = req.jwtDecode._id;
        console.log("req.body:", req.body);
        const result = await commentService.createNew(req.body , userId, cardId);
         res.status(StatusCodes.CREATED).json(result)
         console.log("Created comment new:", result);
         return result
      
     } catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
       console.error(error)
        }
}


const getAll = async (req, res) => {
    try {
        const cardId = req.params.cardId;
        // const userId = req.jwtDecode._id; 
        const allcomment = await commentService.getAll(cardId);
        res.status(StatusCodes.OK).json(allcomment);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
         console.error(error)
    }
};

export const commentController = {
  createNew,
  getAll
};