import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { invitationModel } from '~/models/invitationModel.js';
import { userModel } from '~/models/userModel';
import { BoardModel } from '~/models/boardModel'
import { INVITATION_TYPE, BOARD_INVITATION_STATUS } from '../utils/constants'
import { pickUser } from '~/utils/formatter.js';

const createNew = async (data, userId) => {
    try {
        const inviteed = await userModel.findOneByEmail(data.inviteeEmail);
        const inviter = await userModel.findOneById(userId);
        const board = await BoardModel.findOne(data.boardId)
        if (!inviteed || !inviter || !board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Invitee not found');
        }
        const invitationNew = {
            inviter: userId,
            invitee: inviteed._id.toString(),
            type: INVITATION_TYPE.BOARD_INVITATION,
            boardInvitation: {
                boardId: board._id.toString(),
                status: BOARD_INVITATION_STATUS.PENDING
            }

        }
        const allIds = [...(board.adminIds || []), ...(board.memberIds || [])].map(id => id.toString());
        const exists = allIds.includes(userId);
        console.log(userId, allIds, exists)

        if (exists) {
            throw new Error('Its already on the board')
        }
        const resultNew = await invitationModel.createNew(invitationNew)

        // const resInvitation = {
        //     ...resultNew,
        //     board,
        //     inviter: pickUser(inviter),
        //     invitee: pickUser(inviteed)
        // }

        return resultNew
    } catch (error) {
        const newMessage = new Error(error).message;
        const customError = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, newMessage);
        throw customError
    }
}

const getAllInvite = async (userId) => {
    try {
        console.log(userId)
        const resultNew = await invitationModel.getAllInvite(userId)
        console.log(resultNew)
        //  if(!resultNew){
        //     throw new Error('Get Invitation failded!!')
        //  }
        return resultNew
    } catch (error) {
        const newMessage = new Error(error).message;
        const customError = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, newMessage);
        throw customError
    }
}

const updateInitation = async (userId, invitationId, data) => {
    try {
        const idboard = data.boardInvitation.boardId
        const invitation = await invitationModel.findOne(invitationId)
        const board = await BoardModel.findOne(idboard)
        if (!board || !invitation) {
            throw new Error('No information detected!!')
        }
        const allIds = [...(board.adminIds || []), ...(board.memberIds || [])].map(id => id.toString());
        const exists = allIds.includes(userId);
        console.log(userId, allIds, exists)

        if (exists && data.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
            throw new Error('Its already on the board')
        }

        if (data.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {

            const result = await BoardModel.pushToMemberBoard(userId, idboard)
            console.log(result)
        }


        const result = await invitationModel.updateInitation(invitationId, data)
        const resuldata = await invitationModel.findOne(result._id)
        return resuldata[0]

    } catch (error) {
        const newMessage = error.message || 'Internal Server Error';
        const customError = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, newMessage);
        throw customError
    }
}

export const invitationService = {
    createNew,
    getAllInvite,
    updateInitation

}