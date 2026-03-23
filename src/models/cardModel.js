import Joi from 'joi'
import { find } from 'lodash'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import  ApiError  from '~/utils/ApiError.js';
import { BOARD_TYPE } from '~/utils/constants.js';
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  type:Joi.string().valid(BOARD_TYPE.PRIVATE,BOARD_TYPE.PUBLIC).required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateData = async (data) => {
  try {
    const validData = await CARD_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    return validData
  } catch (error) {
    console.error("❌ CardModel.validateData error:", error)
    throw error
  }
}

const createNew = async (data) => {
  try {
    const validData = await validateData(data)

    console.log("✅ Valid data:", validData)
    validData.boardId = new ObjectId(validData.boardId);
    validData.columnId = new ObjectId(validData.columnId);

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(validData)
      const dataresult = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({ _id: result.insertedId })

    console.log("🧾 Inserted ID:", result.insertedId)

    return dataresult
  } catch (error) {
    console.error("❌ CardModel.createNew error:", error)
    throw error
  }
}
const findOne = async (id) => { 
  try {
    const dataresult = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({ _id: id })
    return dataresult
  } catch (error) {
    console.error("❌ CardModel.findOne error:", error)
    throw error
  }
}



export const CardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOne
}