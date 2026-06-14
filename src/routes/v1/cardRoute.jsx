import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { cardValidation } from '~/validations/cardValidation.js';
import { cardController } from '~/controllers/cardController.js';
import {authMiddleware} from '~/middlewares/authMiddleware.js';
const Router = express.Router();

Router.route('/')
    .get( authMiddleware.isAuth, (req, res) => {
        res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
    })
    .post( authMiddleware.isAuth, cardValidation.createNew, cardController.createNew );

Router.route('/:id')
    // .get( authMiddleware.isAuth,cardController.getCardById )
    .patch( authMiddleware.isAuth, cardValidation.updateCard, cardController.updateCard)
    .delete(authMiddleware.isAuth, cardValidation.deleteCard, cardController.deleteCard)

export const cardRoute = Router;