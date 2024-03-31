import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import redisClient from "../redis/index.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res
      .status(200)
      .json(new ApiResponse(401, "All fields are required!!", "false"));
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          401,
          "User with email or username already exist!!",
          "false"
        )
      );
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    username,
    password: hashPassword,
  });

  delete user.password;

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          401,
          "Something went wrong while registering user!!",
          "false"
        )
      );
  }

  // await redisClient.del(`All_USERS`);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully Registered!!", "true"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username && !password) {
    return res
      .status(200)
      .json(new ApiResponse(400, "Username or email is required!!", "false"));
  }

  const user = await User.findOne({ username });

  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(404, "User does not Exist!!", "false"));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res
      .status(200)
      .json(new ApiResponse(401, "Password Incorrect!!", "false"));
  }

  delete user.password;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Login Successfully!!!"));
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res
      .status(200)
      .json(new ApiResponse(400, "User Id is required to logout.", "false"));
  }
  onlineUsers.delete(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logout Successfully!!!"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  // const cachedUser = await redisClient.get(`All_USERS`);
  // if (cachedUser) {
  //   return res.json(JSON.parse(cachedUser));
  // }

  const users = await User.find({ _id: { $ne: req.params.id } }).select([
    "email",
    "username",
    "avatarImage",
    "_id",
  ]);

  // await redisClient.setex(`All_USERS`, 60, JSON.stringify(users));
  return res.json({ users });
});

const setAvatar = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const avatarImage = req.body.image;

  if (!userId) {
    return res
      .status(200)
      .json(new ApiResponse(404, "User Id is required!!", "false"));
  }

  if (!avatarImage) {
    return res
      .status(200)
      .json(new ApiResponse(404, "Image is required!!", "false"));
  }

  const userData = await User.findByIdAndUpdate(
    userId,
    {
      isAvatarImageSet: true,
      avatarImage: avatarImage,
    },
    { new: true }
  );

  if (!userData) {
    return res
      .status(200)
      .json(new ApiResponse(404, "User not found!!", "false"));
  }

  return res.status(200).json({
    isSet: userData.isAvatarImageSet,
    image: userData.avatarImage,
  });
});

export { registerUser, loginUser, logoutUser, getAllUsers, setAvatar };
