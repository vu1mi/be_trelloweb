import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { columnValidation } from '~/validations/columnValidation.js';
import { columnController } from '~/controllers/columnController.js';
import {authMiddleware} from '~/middlewares/authMiddleware.js';
const Router = express.Router();

Router.route('/')
    .get( authMiddleware.isAuth, (req, res) => {
        res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
    })
    .post( authMiddleware.isAuth, columnValidation.createNew, columnController.createNew );

Router.route('/:id')
    .get( authMiddleware.isAuth, (req, res) => {
        columnController.getColumnById(req, res);
    })
    // .put( authMiddleware.isAuth,  columnController.updateColumn )
    .delete( authMiddleware.isAuth,  columnController.deleteColumn );

export const columnRoute = Router;              