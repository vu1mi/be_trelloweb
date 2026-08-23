import Joi from 'joi'
import { find } from 'lodash'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import ApiError from '~/utils/ApiError.js';
import { BOARD_TYPE, CARD_MEMBER_ACTION } from '~/utils/constants.js';
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional().trim(),
  type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const CARD_COLLECTION_SCHEMA_UPDATE = Joi.object({
  title: Joi.string().min(3).max(50),
  description: Joi.string().optional().trim(),
  type: Joi.string().valid(BOARD_TYPE.PRIVATE, BOARD_TYPE.PUBLIC),
  cover: Joi.string().uri(),
  columnId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  updateMemberCard: Joi.object({
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    action: Joi.string().required().valid(CARD_MEMBER_ACTION.ADD, CARD_MEMBER_ACTION.REMOVE),
  }).optional()
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
const validateDataUpdate = async (data) => {
  try {
    const validData = await CARD_COLLECTION_SCHEMA_UPDATE.validateAsync(data, {
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
      .findOne({ _id: new ObjectId(id) })
    return dataresult
  } catch (error) {
    console.error("❌ CardModel.findOne error:", error)
    throw error
  }
}
const deleteCard = async (cardId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(cardId) });
    return result;
  } catch (error) {
    console.error("❌ CardModel.deleteCard error:", error);
    throw error;
  }
}
const pullAllCardsFromColumn = async (column) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({ columnId: new ObjectId(column._id) });
    return result;
  } catch (error) {
    console.error("❌ CardModel.pullAllCardsFromColumn error:", error);
    throw error;
  }
}
const updateCard = async (cardId, updateData) => {
  const validData = await validateDataUpdate(updateData)
  try {
    if (validData.columnId) {
      validData.columnId = new ObjectId(validData.columnId);
    }
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: { ...validData, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    );
    return result;
  } catch (error) {
    console.error("❌ CardModel.updateCard error:", error);
    throw error;
  }
}

const updateMemberCard = async (cardId, updateMemberCard) => {
  try {

    let actionUpdate = {}
    if (updateMemberCard.action === CARD_MEMBER_ACTION.ADD) {
      actionUpdate = { $push: { membersIds: new ObjectId(updateMemberCard.userId) } };
    } else if (updateMemberCard.action === CARD_MEMBER_ACTION.REMOVE) {
      actionUpdate = { $pull: { membersIds: new ObjectId(updateMemberCard.userId) } };
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      actionUpdate,
      { returnDocument: 'after' }
    );
    return result;
  }
  catch (error) {
    console.error("❌ CardModel.updateMemberCard error:", error);
    throw error;
  }
}

export const CardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOne,
  deleteCard,
  updateCard,
  pullAllCardsFromColumn,
  updateMemberCard
}