import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardValidation } from '~/validations/boardValidation.js';
import { boardController } from '~/controllers/boardController.js';
import {authMiddleware} from '~/middlewares/authMiddleware.js';
const Router = express.Router();

Router.route('/')
    .get(  authMiddleware.isAuth, (req, res) => {
        res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
    })
    .post(authMiddleware.isAuth, boardValidation.createNew, boardController.createNew );

Router.route('/:id')
    .get( authMiddleware.isAuth, boardController.getBoardById )
    // .put( authMiddleware.isAuth, boardValidation.update, boardController.updateBoard );

export const boardRoute = Router 