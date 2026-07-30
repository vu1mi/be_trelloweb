import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError.js';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb.js';
import { INVITATION_TYPE, BOARD_INVITATION_STATUS } from '../utils/constants'

import {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} from '~/utils/validators'
import { BOARD_COLLECTION_NAME } from './boardModel'
import { USER_COLLECTION_NAME } from './userModel'


export const INVITATION_COLLECTION_NAME = 'invitations';
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviter: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  invitee: Joi.string().required(),
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPE)),
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'inviter', 'invitee', 'type', 'createAt']

const createNew = async (invitationData) => {

  try {
    const validData = await INVITATION_COLLECTION_SCHEMA.validateAsync(invitationData, { abortEarly: false });

    const newInvitation = {
      ...validData,
      invitee: new ObjectId(validData.invitee),
      inviter: new ObjectId(validData.inviter)
    }

    if (newInvitation.boardInvitation) {
      newInvitation.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitation);
    const resInvitation = await findOne(result.insertedId.toString());
    return resInvitation[0];
  } catch (error) {
    console.error("❌ UserModel.createNew error:", error);
    throw error;
  }
}
const findOne = async (id) => {
  try {
    const dataresult = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          }
        },
        {
          $lookup: {
            from: USER_COLLECTION_NAME,
            localField: 'invitee',
            foreignField: '_id',
            as: 'inviteeData',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: USER_COLLECTION_NAME,
            localField: 'inviter',
            foreignField: '_id',
            as: 'inviterData',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'boardData',
          }
        },
      ]).toArray();


    return dataresult
  } catch (error) {
    console.error("❌ invitationModel.findOne error:", error)
    throw error
  }
}

const getAllInvite = async (userId) => {
  try {
    console.log(userId)
    const dataresult = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            invitee: new ObjectId(userId),
            _destroy: false
          }
        },
        {
          $lookup: {
            from: USER_COLLECTION_NAME,
            localField: 'invitee',
            foreignField: '_id',
            as: 'inviteeData',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: USER_COLLECTION_NAME,
            localField: 'inviter',
            foreignField: '_id',
            as: 'inviterData',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: BOARD_COLLECTION_NAME,
            localField: 'boardInvitation.boardId',
            foreignField: '_id',
            as: 'boardData',
          }
        },
      ]).toArray();



    return dataresult || null
  } catch (error) {
    console.error("❌ BoardModel.findOne error:", error)
    throw error
  }
}

const updateInitation = async (invitationId, data) => {
  try {
    const updateFields = Object.keys(data);
    const invalidFields = updateFields.filter(field => INVALID_UPDATE_FIELDS.includes(field));
    if (invalidFields.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid update fields: ${invalidFields.join(',')}`);
    }
    if (data.boardInvitation && data.boardInvitation.boardId) {
      data.boardInvitation.boardId = new ObjectId(data.boardInvitation.boardId);
    }
    const dataresult = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(invitationId) },
        { $set: { ...data, updatedAt: Date.now() } },
        { returnDocument: 'after' })
    return dataresult
  } catch (error) {
    console.error("❌ UserModel.updateProfile error:", error);
    throw error;
  }
}


export const invitationModel = {
  createNew,
  findOne,
  getAllInvite,
  updateInitation

}