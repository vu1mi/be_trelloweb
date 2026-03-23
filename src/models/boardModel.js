import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPE } from '~/utils/constants.js'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'

const BOARD_COLLECTION_NAME = 'boards'
const COLUMN_COLLECTION_NAME = 'columns'
const CARD_COLLECTION_NAME = 'cards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(30).trim().strict(),
  description: Joi.string().optional().allow('').max(300).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
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

const createNew = async (data) => {
  try {
    const validData = await validateData(data)

    console.log("✅ Valid data:", validData)

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(validData)
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

    console.log("🧾 Inserted ID:", testid)

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
        { $match: {
           _id: testid,
          _destroy: false
         }},
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
        }
      ]).toArray();

    console.log("🧾 Inserted ID:", testid)

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
        { returnDocument: 'after', 
          includeResultMetadata: false  }
      ); 
    return result?.value ?? result ?? null
  } catch (error) {
    console.error("❌ BoardModel.pushColumnToBoard error:", error)
    throw error

  }
}

export const BoardModel = {
  COLUMN_COLLECTION_NAME,
  CARD_COLLECTION_NAME,
  BOARD_COLLECTION_NAME,
  createNew,
  findOne,
  getDetail,
  pushColumnToBoard
}
