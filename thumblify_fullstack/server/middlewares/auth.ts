import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {  // 👈 add export
  userId?: string;
}

const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;