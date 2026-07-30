import express from 'express';
import {StatusCodes} from 'http-status-codes';
import   {boardRoute} from '~/routes/v1/boardRoute.js';
import  {columnRoute} from '~/routes/v1/columnRoute.js';
import  {cardRoute} from '~/routes/v1/cardRoute.js';
import {userRoute} from '~/routes/v1/userRoute.js';
import  {commentRoute} from '~/routes/v1/commentRoute.js'
import {invitationRoute} from '~/routes/v1/invitationRoute'


const router = express.Router();

router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 is workingg 🚀' });
});
router.use('/board', boardRoute);
router.use('/column', columnRoute);
router.use('/card', cardRoute);
router.use("/user", userRoute);
router.use('/comment',commentRoute)
router.use('/invitation',invitationRoute)

export const API_V1_ROUTES = router
