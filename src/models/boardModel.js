import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPE } from '~/utils/constants.js'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { USER_COLLECTION_NAME } from './userModel'
import { Pipeline } from 'sib-api-v3-sdk'

export const BOARD_COLLECTION_NAME = 'boards'
const COLUMN_COLLECTION_NAME = 'columns'
const CARD_COLLECTION_NAME = 'cards'

const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(30).trim().strict(),
  description: Joi.string().optional().allow('').max(300).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  adminIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC).required(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().allow(null).default(null),
  _destroy: Joi.boolean().default(false)
})

const validateData = async (data) => {
  try {
    const validData = await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    return validData
  } catch (error) {
    console.error("❌ BoardModel.validateData error:", error)
    throw error
  }
}

const createNew = async (userid, data) => {
  try {
    console.log("Validating data for new board:", data, "for userId:", userid)
    const validData = await validateData(data)

    console.log("✅ Valid data:", validData)

    const databoard = {
      ...validData,
      adminIds: [new ObjectId(userid)],
    }

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(databoard)
    const dataresult = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: result.insertedId })

    console.log("🧾 Inserted ID:", result.insertedId)

    return dataresult
  } catch (error) {
    console.error("❌ BoardModel.createNew error:", error)
    throw error
  }
}

const findOne = async (id) => {
  try {
    const testid = new ObjectId(id);
    const dataresult = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: testid })

    // console.log("🧾 Inserted ID:", testid)

    return dataresult
  } catch (error) {
    console.error("❌ BoardModel.findOne error:", error)
    throw error
  }
}

const getDetail = async (id) => {
  try {
    const testid = new ObjectId(id);
    const dataresult = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: testid,
            _destroy: false
          }
        },
        {
          $lookup: {
            from: COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        },
        {
          $lookup: {
            from: USER_COLLECTION_NAME,
            localField: 'adminIds',
            foreignField: '_id',
            as: 'admins',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        }
      ]).toArray();



    return dataresult[0] || null
  } catch (error) {
    console.error("❌ BoardModel.findOne error:", error)
    throw error
  }
}

const pushColumnToBoard = async (column) => {
  try {
    console.log("Pushing column to board:", column._id, "Board ID:", column.boardId);

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        {
          returnDocument: 'after',
          includeResultMetadata: false
        }
      );
    return result?.value ?? result ?? null
  } catch (error) {
    console.error("❌ BoardModel.pushColumnToBoard error:", error)
    throw error

  }
}
const pushToMemberBoard = async (idUser, idBoard) => {
  try {
    console.log("Pushing user to board:", idUser, "Board ID:", idBoard);
    const idUserO = new ObjectId(idUser)
    const idBoardO = new ObjectId(idBoard)
    const findUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: idUserO })

    if (!findUser) {
      throw new Error('User not found')
    }
    const findBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: idBoardO })

    if (!findBoard) {
      throw new Error('Board not found')
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: idBoardO },
        { $push: { memberIds: idUserO } },
        {
          returnDocument: 'after',
          includeResultMetadata: false
        }
      );
    return result?.value ?? result ?? null
  } catch (error) {
    console.error("❌ BoardModel.pushToMemberBoard error:", error)
    throw error

  }
}
const pullColumnFromBoard = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: 'after', includeResultMetadata: false });
    return result?.value ?? result ?? null
  } catch (error) {
    console.error("❌ BoardModel.pullColumnFromBoard error:", error);
    throw error;
  }
}
const getAllBoards = async (userId, page, pageSize) => {

  const condition = [
    { _destroy: false },
    {
      $or: [
        { memberIds: new ObjectId(userId) },
        { adminIds: new ObjectId(userId) }
      ]
    }
  ]
  try {
    const skip = (page - 1) * pageSize;
    const boards = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: condition } },
        { $sort: { title: 1 } },
        {
          $facet: {
            'data': [{ $skip: skip }, { $limit: pageSize }],
            'totalCount': [{ $count: 'count' }]

          }
        }

      ],
        { collation: { locale: 'en' } }
      ).toArray();

    return boards[0] || [];
  } catch (error) {
    console.error("❌ BoardModel.getAllBoards error:", error);
    throw error;
  }
}

export const BoardModel = {
  COLUMN_COLLECTION_NAME,
  CARD_COLLECTION_NAME,
  BOARD_COLLECTION_NAME,
  createNew,
  findOne,
  getDetail,
  pushColumnToBoard,
  pullColumnFromBoard,
  getAllBoards,
  pushToMemberBoard
}
