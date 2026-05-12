import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { cardValidation } from '~/validations/cardValidation.js';
import { cardController } from '~/controllers/cardController.js';
const Router = express.Router();

Router.route('/').get( (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
}).post( cardValidation.createNew, cardController.createNew );

Router.route('/:id').get( (req, res) => {
    cardController.getCardById(req, res);
}).put( (req, res) => {
    cardController.updateCard(req, res);
}).delete((req, res)=>{
        cardController.deleteCard(req, res);
})

export const cardRoute = Router;