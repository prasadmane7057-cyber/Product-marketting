import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

if (config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

export const sendOrderConfirmationEmail = async (order) => {
  const subject = `Order Confirmation #${order.orderNumber} - NovaMarket`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <h2 style="color: #4f46e5;">Thank you for your purchase!</h2>
      <p>Hello <strong>${order.customerName}</strong>,</p>
      <p>Your order <strong>#${order.orderNumber}</strong> has been received and is being prepared.</p>
      
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h4 style="margin-top: 0;">Order Summary</h4>
        <p><strong>Total Amount:</strong> $${order.grandTotal.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>

      <p>You can track your order status in your customer portal anytime.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b;">NovaMarket Inc. - Dedicated to Acoustic & Tech Excellence.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `NovaMarket <${config.smtp.from}>`,
        to: order.customerEmail,
        subject,
        html,
      });
      console.log(`✉️ Order confirmation email sent to ${order.customerEmail}`);
    } catch (err) {
      console.error('Failed to send email via SMTP, fallback simulated:', err.message);
    }
  } else {
    console.log(`✉️ [SIMULATED EMAIL] Order confirmation for #${order.orderNumber} dispatched to ${order.customerEmail}`);
  }
};

export const sendNewsletterWelcomeEmail = async (email) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `NovaMarket <${config.smtp.from}>`,
        to: email,
        subject: 'Welcome to the NovaMarket Inner Circle (Use code WELCOME10)',
        text: 'Thank you for subscribing to NovaMarket. Enjoy 10% off your first order with coupon WELCOME10.',
      });
    } catch (err) {
      console.error('Email error:', err.message);
    }
  } else {
    console.log(`✉️ [SIMULATED EMAIL] Welcome newsletter email dispatched to ${email}`);
  }
};
