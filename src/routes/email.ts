import express from "express";
import { sendEmail } from "../services/emailService.js";

const router = express.Router();

// Rota para envio de e-mail
router.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ success: false, message: "Dados incompletos" });
  }

  const result = await sendEmail(to, subject, body);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
