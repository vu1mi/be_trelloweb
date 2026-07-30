
import { StatusCodes } from 'http-status-codes';
import {cardService} from '~/services/cardService.js';

const createNew = async (req, res,next)=>{
     try {
        console.log("req.body:", req.body);
        const result = await cardService.createNew(req.body);
         res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Create card successfully",
      data: result
    })
         return result
     } catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
      }
}

const getCardById = async(req, res,next)=>{
  try{
    const cardId = req.params.id;
    const getCardById = await cardService.getCardById(cardId);
     res.status(StatusCodes.OK).json({
      status: "success",
      message: "Update card successfully",
      data: getCardById
    });

  }catch(error){
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
  }
}

const deleteCard = async (req, res, next) => {
    try {
        const cardId = req.params.id;
        const deletedCard = await cardService.deleteCard(cardId);
        res.status(StatusCodes.NO_CONTENT).json({
      status: "success",
      message: "Delete card successfully",
      data: deletedCard
    });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
    }
};
const updateCard = async (req, res, next) => {
    try {
        const cardId = req.params.id;
        const updateData = req.body;
        const cardCover = req.file
        console.log('card cover' , cardCover)
        const updatedCard = await cardService.updateCard(cardId, updateData , cardCover);
        res.status(StatusCodes.OK).json({
      status: "success",
      message: "Update card successfully",
      data: updatedCard
    });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: new Error(error).message });
    }
};

export const cardController = {
  createNew,
  deleteCard,
  updateCard,
  getCardById
};