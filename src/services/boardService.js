import { slugify } from '~/utils/formatter.js'
import { BoardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';
import { PAGE_DEFAULT_LIMIT, PAGE_DEFAULT_PAGE } from '~/utils/constants.js'

const createNew = async (data, userid) => {
    try {
        const newBoard = {
            ...data,
            slug: slugify(data.title)
        }
        const createBoarded = await BoardModel.createNew(userid, newBoard);
        const findOne = await BoardModel.findOne(createBoarded._id);
        return findOne
    } catch (error) {
        const newMessage = new Error(error).message;
        const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, newMessage);
        throw customError
    }
}

const getBoardById = async (boardId) => {
    try {
        const board = await BoardModel.getDetail(boardId);
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
        }

        const boardClone = cloneDeep(board);

        boardClone.columns.forEach(element => {
            element.cards = boardClone.cards.filter(card => String(card.columnId) === String(element._id));
        });
        boardClone.Fe_allUser = boardClone.admins.concat(boardClone.members)

        delete boardClone.admins
        delete boardClone.members
        delete boardClone.cards;


        return boardClone;
    } catch (error) {
        throw error;
    }
};

const updateBoard = async (boardId, updateData) => {
    try {
        await BoardModel.update(boardId, updateData);
        const updatedBoard = await BoardModel.findOne(boardId);
        return updatedBoard;
    } catch (error) {
        throw error;
    }
};

const getAllBoards = async (userId, page, pageSize, querysearch) => {
    try {
        if (!page) page = PAGE_DEFAULT_PAGE;
        if (!pageSize) pageSize = PAGE_DEFAULT_LIMIT;
        console.log("Fetching boards for userId:", userId, "with page:", page, "and pageSize:", pageSize);
        const boards = await BoardModel.getAllBoards(userId, parseInt(page, 10), parseInt(pageSize, 10), querysearch);
        return boards;
    }
    catch (error) {
        throw error;
    }
}

export const boardService = {
    createNew,
    getBoardById,
    updateBoard,
    getAllBoards
}