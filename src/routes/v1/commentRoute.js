import express  from "express";
import {commentValidation} from '~/validations/commentValidation';
import {commentController} from '~/controllers/commentController';
import {authMiddleware} from '~/middlewares/authMiddleware.js';

const Router = express.Router();

    Router.route('/:cardId')
        .get(authMiddleware.isAuth, commentController.getAll)
        .post(authMiddleware.isAuth,commentValidation.createNew, commentController.createNew)
        

export const commentRoute = Router;