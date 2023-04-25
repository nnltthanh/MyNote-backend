//express-jwt is used here to validate the users token and manage the routes the user can access

const expressJwt = require("express-jwt");
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "info" || "error";

function createAuthJwt() {
  return function authjwt(req, res, next) {
    const secret = process.env.TOKEN_KEY;
    const api = process.env.API_URL;

    logger.info("authjwt function has been called");

    return expressJwt({
      secret,
      algorithms: ["HS256"],
      getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
          logger.info("token has been found");
          return req.headers.authorization.split(" ")[1];
        }
        logger.info("no token found, returning null");
        return null;
      },
    }).unless({
      path: [
        //do not require a valid JWT token as users need to be able to login and register
        `${api}/user/login`,
        `${api}/user/register`,
      ],
    })(req, res, next);
  };
}

module.exports = createAuthJwt;