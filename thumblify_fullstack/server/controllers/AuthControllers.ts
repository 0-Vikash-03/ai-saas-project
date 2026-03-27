import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  const newUser = await User.create({ name, email, password: hashed });

  const token = jwt.sign(
    { userId: newUser._id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.json({ user: newUser, token, message: "Registered" });
};

// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.json({ user, token, message: "Login success" });
};

// VERIFY
export const verifyUser = async (req: any, res: Response) => {
  const user = await User.findById(req.userId).select("-password");
  res.json({ user });
};