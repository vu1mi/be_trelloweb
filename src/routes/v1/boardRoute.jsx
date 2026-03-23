import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardValidation } from '~/validations/boardValidation.js';
import { boardController } from '~/controllers/boardController.js';
const Router = express.Router();

Router.route('/').get( (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
}).post( boardValidation.createNew, boardController.createNew );

Router.route('/:id').get( (req, res) => {
    boardController.getBoardById(req, res);
}).put( (req, res) => {
    boardController.updateBoard(req, res);
})

export const boardRoute = Router