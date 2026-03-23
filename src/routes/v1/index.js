import express from 'express';
import {StatusCodes} from 'http-status-codes';
import   {boardRoute} from '~/routes/v1/boardRoute.jsx';
import  {columnRoute} from '~/routes/v1/columnRoute.jsx';
import  {cardRoute} from '~/routes/v1/cardRoute.jsx';
const router = express.Router();

router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
});
router.use('/board', boardRoute);
router.use('/column', columnRoute);
router.use('/card', cardRoute);

export const API_V1_ROUTES = router
