import { Router } from "express";
import request from "request-promise";
import * as authService from "./auth.service";
import * as Responder from "../responder";
import {
  FIRST_LOGIN_REDIRECT,
  REDIRECT_URI,
  CLIENT_ID,
  CLIENT_SECRET,
} from "../credentials";
import { ServerException } from "../exceptions";

const authRouter = Router();

// User will come to this route for login
authRouter.get("/login/google", (_req, res) => {
  // redirecting user to google with my credentials
  res.redirect(FIRST_LOGIN_REDIRECT);
});

// This route will be called by google
authRouter.get("/login/google/callback", async (req, res) => {
  try {
    // check if we got token or not
    if (!req.query.code) throw new ServerException("User rejected login!");
    const code = req.query.code;

    // trade the code in for an access token
    let { access_token } = await tradeCodeForAccessToken(String(code));

    // use that token to get the data of the user
    const profile = await getDataUsingAccessToken(access_token);

    // genearting token with that profile
    const token = await authService.getTokenByLogin(profile);

    // Setting the jwt token as cookie
    res.cookie("auth", token, { httpOnly: true });

    // here user is logged in now and we should redirect him to website
    Responder.respondWithSuccess(res, 200, "Logged in successfully!");
  } catch (e) {
    Responder.respondeWithError(res, 500, e.message, e);
  }
});

authRouter.get("/signout", (_req, res) => {
  res.cookie("auth", "");
  Responder.respondWithSuccess(res, 200, "Signed out!");
});

const getDataUsingAccessToken = async (token: string) => {
  return await request({
    method: "get",
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
    headers: {
      Authorization: "Bearer " + token,
    },
    json: true,
    simple: true,
  });
};

const tradeCodeForAccessToken = async (code: string) => {
  return await request({
    method: "post",
    url: "https://oauth2.googleapis.com/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    form: {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      scope: ["email", "profile"],
    },
    json: true,
    simple: true,
  });
};

export default authRouter;