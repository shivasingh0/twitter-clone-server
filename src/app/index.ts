import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { User } from "./user";
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";

export async function initServer() {
  const app = express();

  // // Middleware to set COOP and COEP headers
  // app.use((req, res, next) => {
  //   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  //   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  //   next();
  // });

  app.use(bodyParser.json());

  app.use(
    cors({
      origin: "*",
    })
  );

  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `#graphql
    ${User.types}
    type Query {
        ${User.queries}
    }
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
    },
  });

  await graphqlServer.start();

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        // console.log(req,res, "Line 48")
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(req.headers.authorization)
            : undefined,
        };
      },
    })
  );

  app.get("/", (req, res) => {
    res.send("Welcome to the GraphQL server!");
  });

  return app;
}
