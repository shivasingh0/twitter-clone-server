import axios from "axios";
import { prisma } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";

interface GoogleTokenResult {
  iss?: string; // Issuer of the token
  azp?: string; // Authorized party
  aud?: string; // Audience for whom the token is intended
  sub?: string; // Subject identifier for the user
  email: string; // User's email address
  email_verified: boolean; // Indicates if the email is verified
  nbf?: number; // (Optional) "Not Before" timestamp
  name?: string; // Full name of the user
  picture?: string; // URL to the user's profile picture
  given_name: string; // First name of the user
  family_name?: string; // Last name of the user
  iat?: number; // Issued At timestamp
  exp?: number; // Expiration timestamp
  jti?: string; // Unique identifier for the token
  alg?: string; // Algorithm used to sign the token
  kid?: string; // Key ID used for signature verification
  typ?: string; // Token type
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    // console.log(googleToken)
    googleOauthUrl.searchParams.set("id_token", googleToken);

    const {data} = await axios.get<GoogleTokenResult>(googleOauthUrl.toString(), {
      responseType: "json",
    });

    // console.log(data);
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      // Create a new user
      await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      })
    }

    const userInDB = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!userInDB) throw new Error('User not found')

    const userToken = JWTService.generateTokenForUser(userInDB)

    // console.log(userToken)

    return userToken;

  },
  getCurrentUser: async (parent: any, arg: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;
    const user = await prisma.user.findUnique({ where: { id } });
    // console.log(user)
    // return ctx.user;
    return user;
  },
}

export const resolvers = {
  queries,
}
