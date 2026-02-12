
import { db } from './db';
import { Order } from '../types';

/**
 * Simulates a backend email service.
 */
export const sendOrderConfirmationEmail = async (order: Order): Promise<boolean> => {
  // Simulate network latency for email server
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { id, totalAmount, customerEmail } = order;

  // In a real app, this would use an email provider like SendGrid or AWS SES
  const emailBody = `
    <h1>Order Confirmed</h1>
    <p>Thank you for ordering with MediGen.</p>
    <p>Order ID: <strong>${id}</strong></p>
    <p>Total Amount: <strong>₹${totalAmount}</strong></p>
    <p>Status: Placed</p>
  `;

  // Log to our local "database" so Admin can see it
  await db.saveEmail(customerEmail, `Order Confirmation - #${id}`, emailBody);

  console.group('%c📧 [Email Service Simulation] Email Sent', 'color: #0D9488; font-weight: bold; font-size: 14px;');
  console.log(`%cTo: %c${customerEmail}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log(`%cSubject: %cYour Medicine Order is Confirmed – Order #${id}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log(`%cAmount: %c₹${totalAmount}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log('%cStatus: Sent successfully (Logged to DB)', 'color: green');
  console.groupEnd();

  return true;
};
