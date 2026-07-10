import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().max(300).trim().strict(),
  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const COLUMN_COLLECTION_UPDATE_SCHEMA = Joi.object({
  title: Joi.string().min(3).max(50).trim().strict(),
  description: Joi.string().max(300).trim().strict(),
  updatedAt: Joi.date().timestamp('javascript').default(Date.now),
})

const validateData = async (data) => {
  try {
    const validData = await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    return validData
  } catch (error) {
    console.error("❌ ColumnModel.validateData error:", error)
    throw error
  }
}

const validateUpdateData = async (data) => {
  try {
    const validData = await COLUMN_COLLECTION_UPDATE_SCHEMA.validateAsync(data, {
      abortEarly: false
    })
    return validData
  } catch (error) {
    console.error("❌ ColumnModel.validateUpdateData error:", error)
    throw error
  }
}

const createNew = async (data) => {
  try {
    const validData = await validateData(data)
    validData.boardId = new ObjectId(validData.boardId); // Chuyển boardId thành ObjectId trước khi lưu vào database

    console.log("✅ Valid data:", validData)

    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .insertOne(validData)

      const dataresult = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({ _id: result.insertedId })
    
    

    console.log("🧾 Inserted ID:", result.insertedId)

    return dataresult
  } catch (error) {
    console.error("❌ ColumnModel.createNew error:", error)
  
    throw error
  }
}

const findOne = async (id) => {
  try {
   
      const dataresult = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
      return dataresult
  } catch (error) {
    console.error("❌ ColumnModel.findOne error:", error)
    throw error
  }
}

const pushCardToColumn = async (card) => {
  try {
    console.log("Pushing card to column:", card._id, "Column ID:", card.columnId);

    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { $push: { cardOrderIds: new ObjectId(card._id) } },
        { returnDocument: 'after', 
          includeResultMetadata: false  }
      ); 
    return result?.value ?? result ?? null
  } catch (error) {
    console.error("❌ ColumnModel.pushCardToColumn error:", error)
    throw error

  }
}
const pullCardFromColumn = async (card) => {
    try {
       const result = await GET_DB()
            .collection(COLUMN_COLLECTION_NAME)
            .findOneAndUpdate({ _id: new ObjectId(card.columnId) },
             { $pull: { cardOrderIds: new ObjectId(card._id) } },
             { returnDocument: 'after', includeResultMetadata: false });
       return result?.value ?? result ?? null
    } catch (error) {
        console.error("❌ ColumnModel.pullCardFromColumn error:", error);
        throw error;
    }
}
const deleteColumn = async (columnId) => {
    try {
       const result = await GET_DB()
            .collection(COLUMN_COLLECTION_NAME)
            .deleteOne({ _id: new ObjectId(columnId) });
       return result;
    } catch (error) {
        console.error("❌ ColumnModel.deleteColumn error:", error);
        throw error;
    }   
}

const update = async (columnId, updateData, userId) => {
    try {
      const validData = await validateUpdateData(updateData)
        const result = await GET_DB()
            .collection(COLUMN_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(columnId) },
                { $set: { ...validData, updatedAt: Date.now() } },
                { returnDocument: 'after', includeResultMetadata: false }
            );
        return result?.value ?? result ?? null;
    }
    catch (error) {
        console.error("❌ ColumnModel.update error:", error);
        throw error;
    }
  }

export const ColumnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOne,
  pushCardToColumn,
  pullCardFromColumn,
  deleteColumn,
  update
}