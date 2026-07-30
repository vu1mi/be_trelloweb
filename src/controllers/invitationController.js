import { StatusCodes } from 'http-status-codes';
import {invitationService} from '~/services/invitationService.js';
import ApiError from '~/utils/ApiError';

const createNew = async (req, res)=>{
     try {
        const userId = req.jwtDecode._id;
        console.log("req.body:", req.body);
        const result = await invitationService.createNew(req.body , userId);
         if(!result){
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR , 'Create new fail!!')
         }
         res.status(StatusCodes.CREATED).json(result)
         console.log("Created comment new:", result);
         return result
      
     } catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: new Error(error).message });
       console.error(error)
        }
}

const getAllInvite = async(req ,res) =>{

  try{
     const userId = req.jwtDecode._id;
        console.log("req.body:", req.body);
        const result = await invitationService.getAllInvite(userId );
        //   if(!result){
        //     throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR , 'Create new fail!!')
        //  }
         res.status(StatusCodes.CREATED).json(result)
         console.log("Created comment new:", result);
         return result

  }catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: new Error(error).message });
       console.error(error)
        }
}

const updateInitation = async (req, res) =>{
     try{
     const userId = req.jwtDecode._id;
     const invitationId = req.params.id
     const data = req.body
        console.log("req.body:", req.body);
        const result = await invitationService.updateInitation(userId,invitationId ,data);
   
         res.status(StatusCodes.CREATED).json(result)
         console.log("Created comment new:", result);
         return result

  }catch (error) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: new Error(error).message });
       console.error(error)
        }
}


export const invitationController = {
  createNew,
  getAllInvite,
  updateInitation
};