import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTUser } from "../interfaces";

const JWT_SECRET = "$shiva@123";

class JWTService {
  public static generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };

    const token = JWT.sign(payload, JWT_SECRET);

    return token;
  }
  public static decodeToken(token: string) {
    try {
      const decoded = JWT.verify(token, JWT_SECRET) as JWTUser;
      console.log(decoded);
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
export default JWTService;
