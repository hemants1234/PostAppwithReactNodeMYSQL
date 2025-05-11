
//import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  User  from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const  authorizeRoles = (...allowedRoles) =>{
    return async (req, _, next) => {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        try {
            const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
             const user = await User.findByPk(decodeToken?.id, {
                attributes: { exclude: ['password', 'refreshToken'] }
              });
               if(!user){
                  throw new ApiError(401, "Invalid Access Token")
               }   
            if (!allowedRoles.includes(user.role)) {

                return next(new ApiError(403, "Access denied: Insufficient role (only admin and editor can access this route)"));
             
            }
            req.user = user; // you can use this in your controller
            next();
        } catch (err) {
            return next(new ApiError(401, "Invalid token"));
        }
    };
}
