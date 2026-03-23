import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { columnValidation } from '~/validations/columnValidation.js';
import { columnController } from '~/controllers/columnController.js';
const Router = express.Router();

Router.route('/').get( (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
}).post( columnValidation.createNew, columnController.createNew );

Router.route('/:id').get( (req, res) => {
    columnController.getColumnById(req, res);
}).put( (req, res) => {
    columnController.updateColumn(req, res);
})

export const columnRoute = Router