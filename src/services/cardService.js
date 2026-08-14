import { slugify } from '~/utils/formatter.js'
import { CardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { ColumnModel } from '~/models/columnModel';
import { userModel } from '~/models/userModel.js';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider.js';

const createNew = async (data) => {
    try {
        const newCard = {
            ...data,
        }
        const createCard = await CardModel.createNew(newCard);
        const getCard = await CardModel.findOne(createCard._id);

        if (getCard) {
            await ColumnModel.pushCardToColumn(getCard);
        }
        return getCard
    } catch (error) {
        throw error
    }
}

const deleteCard = async (cardId) => {
    try {
        const card = await CardModel.findOne(cardId);
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
        }
        const deletedCard = await CardModel.deleteCard(cardId);
        await ColumnModel.pullCardFromColumn(card);
        return deletedCard;
    } catch (error) {
        throw error
    }
}

const getCardById = async (cardId) => {
    try {
        const card = await CardModel.findOne(cardId);
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
        }
        return card
    } catch (error) {
        throw error
    }

}

const updateCard = async (cardId, updateData, cardCover) => {
    try {
        const card = await CardModel.findOne(cardId);
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
        }
        if (cardCover) {
            const cardCoverPath = await CloudinaryProvider.uploadStream(cardCover.buffer, 'cardCover');
            updateData.cover = cardCoverPath.url
        } else if (updateData.updateMemberCard) {
            await CardModel.updateMemberCard(cardId, updateData.updateMemberCard);
        }
        await CardModel.updateCard(cardId, updateData);
        const updatedCard = await CardModel.findOne(cardId);
        return updatedCard;
    }
    catch (error) {
        throw error;
    }
}
export const cardService = {
    createNew,
    deleteCard,
    updateCard,
    getCardById
}