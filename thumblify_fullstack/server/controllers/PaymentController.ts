import { Request, Response } from "express";

export const processPayment = (req: Request, res: Response) => {
  const { plan, amount, userId } = req.body;

  const success = Math.random() > 0.2;

  if (success) {
    res.json({
      status: "success",
      plan,
      amount,
      transactionId: "TXN" + Date.now()
    });
  } else {
    res.status(400).json({
      status: "failed"
    });
  }
};