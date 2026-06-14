import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import  {env} from '~/config/environment.js'
import {jwtProvider} from '~/providers/JwtProvider.js'


const isAuth = async (req, res, next) => {

    const clientToken = req.cookies.accessToken 
    try {
      const accessTokenDecode = await jwtProvider.verifyToken(clientToken , env.ACCESS_TOKEN_SECRET);
      if (!accessTokenDecode) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
      }
      req.jwtDecode = accessTokenDecode;

        next();
    } catch (error) {
        if(error?.message?.includes("jwt expired")) {
           
           next(new ApiError(StatusCodes.GONE, "Token expired"));
            return
        }
      next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
    }
}

export const authMiddleware = {
    isAuth
}