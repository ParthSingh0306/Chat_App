import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  setAvatar,
} from "../controllers/user.controller.js";
import { Router } from "express";

const router = new Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout/:id", logoutUser);
router.post("/setavatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);

export default router;
