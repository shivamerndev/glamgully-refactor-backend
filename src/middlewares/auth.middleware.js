import { AppError } from "../utils/error.utils.js";
import { verifyAccessToken } from "../utils/token.utils.js";
import { asyncHandler } from "../utils/error.utils.js";

export const userAuth = asyncHandler(async (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError(401, "Not authenticated");

  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
})
