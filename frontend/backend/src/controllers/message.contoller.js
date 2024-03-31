import { Messages } from "../models/message.model.js";
// import redisClient from "../redis/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMessages = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  if ([from, to].some((field) => field?.trim() === "")) {
    return res
      .status(200)
      .json(new ApiResponse(401, "All fields are required!!", "false"));
  }

  const messages = await Messages.find({
    users: {
      $all: [from, to],
    },
  }).sort({ updatedAt: 1 });

  const projectedMessages = messages.map((msg) => {
    return {
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
    };
  });

  if (!projectedMessages) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          404,
          "Something went wrong in protecting messages!!",
          "false"
        )
      );
  }

  console.log("Message not found!!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectedMessages, "Message fetched Sucessfully!!")
    );
});

const addMessage = asyncHandler(async (req, res) => {
  const { from, to, message } = req.body;

  const data = await Messages.create({
    message: { text: message },
    users: [from, to],
    sender: from,
  });

  if (!data) {
    return res
      .status(200)
      .json(
        new ApiResponse(401, "Failed to add message to the database", "false")
      );
  }

  console.log("project messages deleted!!");

  return res
    .status(200)
    .json(new ApiResponse(200, "Message added successfully."));
});

export { getMessages, addMessage };
