require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows your React frontend to communicate with this backend
app.use(express.json());

// Set up Nodemailer transporter using your .env credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, 
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/send-email', async (req, res) => {
  const { to, subject, documentData, docType, companyName } = req.body;

  // Build a simple HTML email template
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1e293b;">New ${docType} from ${companyName}</h2>
      <p>Hello,</p>
      <p>Please find the details for your recent <strong>${docType} #${documentData.id}</strong> regarding the project <strong>${documentData.projectName}</strong>.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Grand Total:</strong> $${documentData.items.reduce((sum, item) => sum + (item.qty * item.unitMaterial), 0).toFixed(2)}</p>
        <p><strong>Status:</strong> ${documentData.status}</p>
      </div>

      <p>If you have any questions, please reply directly to this email.</p>
      <br/>
      <p>Thank you,</p>
      <p><strong>${companyName}</strong></p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${companyName}" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email SMTP server running on port ${PORT}`);
});