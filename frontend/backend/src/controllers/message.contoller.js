import { Messages } from "../models/message.model.js";
import redisClient from "../redis/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMessages = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  const cachedMessages = await redisClient.get(`PROJECT_MESSAGE_${from}`);
  if (cachedMessages) {
    console.log("Message Cached!!");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          JSON.parse(cachedMessages),
          "Message fetched Sucessfully!!"
        )
      );
  }

  if ([from, to].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!!");
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
    throw new ApiError(401, "Something went wrong in projectedMessages");
  }

  console.log("Message not found!!");
  await redisClient.setex(
    `PROJECT_MESSAGE_${from}`,
    60,
    JSON.stringify(projectedMessages)
  );

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
    throw new ApiError(401, "Failed to add message to the database");
  }

  console.log("project messages deleted!!");
  await redisClient.del(`PROJECT_MESSAGE_${from}`);

  return res
    .status(200)
    .json(new ApiResponse(200, "Message added successfully."));
});

export { getMessages, addMessage };
