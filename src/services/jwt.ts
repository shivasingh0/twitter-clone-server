import { User } from "@prisma/client";
import { prisma } from "../clients/db";
import JWT from "jsonwebtoken";

const JWT_SECRET = "$shiva@123";

class JWTService {
    public static generateTokenForUser(user: User ) {
        
          const payload = {
            id: user?.id,
            email: user?.email,
          };
    
          const token = JWT.sign(payload, JWT_SECRET)
    
          return token
    }
}
export default JWTService;