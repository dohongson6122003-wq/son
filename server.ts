import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Order Submission
  app.post("/api/order", async (req, res) => {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Save to Google Sheets
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

      if (serviceAccountEmail && privateKey) {
        let keyToUse = privateKey;
        let emailToUse = serviceAccountEmail;

        // Try to parse as JSON in case the user pasted the entire service account file
        try {
          const credentials = JSON.parse(privateKey);
          if (credentials.private_key) {
            keyToUse = credentials.private_key;
            if (credentials.client_email) {
              emailToUse = credentials.client_email;
            }
          }
        } catch (e) {
          // Not a JSON string, clean the key manually
          keyToUse = privateKey.replace(/\\n/g, "\n").replace(/^"(.*)"$/, "$1").trim();
        }

        // Final check for PEM headers
        if (!keyToUse.includes("-----BEGIN")) {
          keyToUse = `-----BEGIN PRIVATE KEY-----\n${keyToUse}\n-----END PRIVATE KEY-----`;
        }

        const auth = new google.auth.JWT({
          email: emailToUse,
          key: keyToUse,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID || "1M4_qp-EtknLxpUryNCu19qJmEAtpS0ZB_5kZ-OJjVRc";
        
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Sheet1!A:D",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[new Date().toLocaleString("vi-VN"), name, phone, address]],
          },
        });
      }

      // 2. Send Email Notification
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.NOTIFICATION_EMAIL || "doson380@gmail.com",
          subject: `Đơn hàng mới từ ${name}`,
          text: `
            Có đơn hàng mới từ Landing Page:
            - Họ tên: ${name}
            - Số điện thoại: ${phone}
            - Địa chỉ: ${address}
            - Thời gian: ${new Date().toLocaleString("vi-VN")}
          `,
        };

        await transporter.sendMail(mailOptions);
      }

      res.status(200).json({ success: true, message: "Order placed successfully" });
    } catch (error) {
      console.error("Error processing order:", error);
      res.status(500).json({ error: "Failed to process order. Please check server logs." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
