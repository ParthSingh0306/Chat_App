import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!!");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(401, "User with email or username already exist!!");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    username,
    password: hashPassword,
  });

  delete user.password;

  if (!user) {
    throw new ApiError(401, "Something went wrong while registering user!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully Registered!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username && !password) {
    throw new ApiError(400, "Username or email is required!!");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User does not Exist!!");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect!!");
  }

  delete user.password;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Login Successfully!!!"));
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(401, "User id is required!!");
  }
  onlineUsers.delete(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logout Successfully!!!"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.params.id } }).select([
    "email",
    "username",
    "avatarImage",
    "_id",
  ]);
  return res.json({ users });
});

const setAvatar = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const avatarImage = req.body.image;

  if (!userId) {
    throw new ApiError(404, "User id is required!!");
  }

  if (!avatarImage) {
    throw new ApiError(404, "avatarImage is required!!");
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
    return new ApiError(401, "Problem in updarting the avatar Image");
  }

  return res.status(200).json({
    isSet: userData.isAvatarImageSet,
    image: userData.avatarImage,
  });
});

export { registerUser, loginUser, logoutUser, getAllUsers, setAvatar };
