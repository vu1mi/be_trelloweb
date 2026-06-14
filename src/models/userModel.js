
 import Joi from 'joi';
 import { StatusCodes } from 'http-status-codes';
 import  ApiError  from '~/utils/ApiError.js';
 import {ObjectId} from 'mongodb';
 import {GET_DB} from '~/config/mongodb.js';
 import {BrevoProvider} from '~/providers/BrevoProvider.js';
 
import {   ROLE_MESSAGES,
    ROLE_REGEX_EMAIL,
    ROLE_ERRORS_EMAIL,
    ROLE_REGEX_PASSWORD,
    ROLE_ERRORS_PASSWORD,
    ROLE_REGEX_FULLNAME,
    ROLE_ERRORS_FULLNAME } from '~/utils/validators'

 const USER_ROLE = {
    USER: 'user',
    ADMIN: 'admin'
 }

 const USER_COLLECTION_NAME = 'users';
 const USER_COLLECTION_SCHEMA = Joi.object({
    email: Joi.string().required().pattern(ROLE_REGEX_EMAIL).message(ROLE_ERRORS_EMAIL),
    password: Joi.string().required(),
    // password: Joi.string().min(8).required().pattern(ROLE_REGEX_PASSWORD).message(ROLE_ERRORS_PASSWORD),
    username: Joi.string().min(3).max(50).required().pattern(ROLE_REGEX_FULLNAME).message(ROLE_ERRORS_FULLNAME),
    displayName: Joi.string(),
    avatar : Joi.string().default(null),
    role: Joi.string().valid(...Object.values(USER_ROLE)).default(USER_ROLE.USER),
    isActive: Joi.boolean().default(false),
    verifyToken: Joi.string().default(null),
    createdAt: Joi.date().default(Date.now), 
    updatedAt: Joi.date().default(Date.now),
    _destroy: Joi.boolean().default(false)

 })

 const INVALID_UPDATE_FIELDS = ['_id', 'email', 'role', 'createdAt'];

  const createNew = async (userData) => {
    console.log("userData in createNew:", userData);
    try {
        const validData = await USER_COLLECTION_SCHEMA.validateAsync(userData, { abortEarly: false });
        const result = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData);
        const newUser = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: result.insertedId });
        return newUser;
    } catch (error) {
        console.error("❌ UserModel.createNew error:", error);
        throw error;
    }   
}

const findOneByEmail = async (emailValue) => {
    try {
        const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue });
        return user;
    } catch (error) {
        console.error("❌ UserModel.findOneByEmail error:", error);
        throw error;
    }
};

const update = async (userId, updateData) => {
    try {
        const updateFields = Object.keys(updateData);
        const invalidFields = updateFields.filter(field => INVALID_UPDATE_FIELDS.includes(field));
        if (invalidFields.length > 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid update fields: ${invalidFields.join(', ')}`);
        }
        const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        return result;
    } catch (error) {
        console.error("❌ UserModel.update error:", error);
        throw error;
    }
};

export const userModel = {
    createNew,
    findOneByEmail,
    update
}