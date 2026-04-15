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

/**
 * Helper to clean and normalize Google Private Key
 */
function getCleanedGoogleAuth(privateKey: string, serviceAccountEmail: string) {
  let keyToUse = privateKey;
  let emailToUse = serviceAccountEmail;

  // Try to parse as JSON in case the user pasted the entire service account file
  try {
    const trimmedKey = privateKey.trim();
    if (trimmedKey.startsWith("{")) {
      const credentials = JSON.parse(trimmedKey);
      if (credentials.private_key) {
        keyToUse = credentials.private_key;
        if (credentials.client_email) {
          emailToUse = credentials.client_email;
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse error
  }

  // Clean the key: remove extra quotes, replace literal \n, and normalize headers
  let cleanedKey = keyToUse.trim();
  
  // Remove surrounding quotes if any
  if ((cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) || 
      (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))) {
    cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
  }

  // Replace literal \n with actual newlines
  cleanedKey = cleanedKey.replace(/\\n/g, "\n");

  // If it looks like it's all on one line but has headers, fix the newlines after headers
  if (cleanedKey.includes("-----BEGIN PRIVATE KEY-----") && !cleanedKey.includes("\n", cleanedKey.indexOf("-----BEGIN PRIVATE KEY-----") + 26)) {
     cleanedKey = cleanedKey.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n");
     cleanedKey = cleanedKey.replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
  }

  // Final check: if it still has no headers, wrap it and remove internal whitespace
  if (!cleanedKey.includes("-----BEGIN")) {
    cleanedKey = `-----BEGIN PRIVATE KEY-----\n${cleanedKey.replace(/\s/g, "")}\n-----END PRIVATE KEY-----`;
  }
  
  return { key: cleanedKey, email: emailToUse };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Order Submission
  app.post("/api/order", async (req, res) => {
    const { name, phone, address, productTitle, productPrice } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Execute tasks in parallel to speed up response
    const tasks = [];

    // 1. Task: Save to Google Sheets
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (serviceAccountEmail && privateKey) {
      tasks.push((async () => {
        try {
          const { key: cleanedKey, email: emailToUse } = getCleanedGoogleAuth(privateKey, serviceAccountEmail);
          
          const auth = new google.auth.JWT({
            email: emailToUse,
            key: cleanedKey,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
          });

          const sheets = google.sheets({ version: "v4", auth });
          let spreadsheetId = process.env.GOOGLE_SHEET_ID || "1M4_qp-EtknLxpUryNCu19qJmEAtpS0ZB_5kZ-OJjVRc";
          
          if (spreadsheetId.includes("docs.google.com/spreadsheets/d/")) {
            const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match) spreadsheetId = match[1];
          }
          
          const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";
          
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:F`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[
                new Date().toLocaleString("vi-VN"), 
                name, 
                phone, 
                address,
                productTitle || "N/A",
                productPrice || "N/A"
              ]],
            },
          });
          console.log("Successfully saved to Google Sheets");
        } catch (err) {
          console.error("Google Sheets Error:", err);
          throw new Error("Failed to save to Google Sheets");
        }
      })());
    }

    // 2. Task: Send Email Notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      tasks.push((async () => {
        try {
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
            subject: `Đơn hàng mới: ${productTitle || 'Sản phẩm'} từ ${name}`,
            text: `
              Có đơn hàng mới từ Landing Page:
              - Sản phẩm: ${productTitle || "Không rõ"}
              - Giá: ${productPrice || "Không rõ"}
              - Họ tên: ${name}
              - Số điện thoại: ${phone}
              - Địa chỉ: ${address}
              - Thời gian: ${new Date().toLocaleString("vi-VN")}
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log("Successfully sent email notification");
        } catch (err) {
          console.error("Email Error:", err);
        }
      })());
    }

    try {
      // Wait for all critical tasks to finish
      await Promise.all(tasks);
      res.status(200).json({ success: true, message: "Order placed successfully" });
    } catch (error) {
      console.error("Error processing order:", error);
      res.status(500).json({ error: "Failed to process order. Please check server logs." });
    }
  });

  // API Route to fetch products from Google Sheets
  app.get("/api/products", async (req, res) => {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!privateKey || !serviceAccountEmail || !spreadsheetId) {
      return res.status(500).json({ error: "Google Sheets not configured" });
    }

    try {
      // Clean spreadsheetId
      if (spreadsheetId.includes("docs.google.com/spreadsheets/d/")) {
        const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) spreadsheetId = match[1];
      }

      const { key: cleanedKey, email: emailToUse } = getCleanedGoogleAuth(privateKey, serviceAccountEmail);

      const auth = new google.auth.JWT({
        email: emailToUse,
        key: cleanedKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const productSheetName = process.env.GOOGLE_PRODUCT_SHEET_NAME || "Products";

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${productSheetName}!A2:F`, // ID, Image, Title, Price, Category, Tag
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.json([]);
      }

      const products = rows.map((row, index) => ({
        id: row[0] || index + 1,
        image: row[1] || "",
        title: row[2] || "",
        price: row[3] || "",
        category: row[4] || "",
        tag: row[5] || ""
      }));

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
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

  return app;
}

const appPromise = startServer();
export default appPromise;
