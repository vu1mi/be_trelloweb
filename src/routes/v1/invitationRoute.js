import express  from "express";
import {invitationValidation} from '~/validations/invitationValidation';
import {invitationController} from '~/controllers/invitationController';
import {authMiddleware} from '~/middlewares/authMiddleware.js';

const Router = express.Router();

    Router.route('/board')
        .post(authMiddleware.isAuth,invitationValidation.createNewBoardInvitation, invitationController.createNew)
        .get(authMiddleware.isAuth , invitationController.getAllInvite )

    Router.route('/:id')
        .patch(authMiddleware.isAuth , invitationValidation.updateInitation, invitationController.updateInitation )
        

export const invitationRoute = Router; 