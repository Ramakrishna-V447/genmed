
import { Order } from '../types';

/**
 * Simulates a backend email service using an HTML template.
 * In a real app, this would be an API call to a Node.js server using Nodemailer or SendGrid.
 */
export const sendOrderConfirmationEmail = async (order: Order): Promise<boolean> => {
  // Simulate network latency for email server
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { id, items, totalAmount, address, customerEmail } = order;

  // 1. Generate Dynamic Item List
  const medicineRows = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
        <div style="font-weight: bold; color: #1e293b;">${item.name}</div>
        <div style="font-size: 12px; color: #64748b;">Generic for ${item.brandExample}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #475569;">₹${(item.genericPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  // 2. Create HTML Template
  // Using hex codes: Primary #0D9488 (Teal), Secondary #38BDF8 (Light Blue), Text #475569 (Grey)
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background-color: #0D9488; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Order Confirmed!</h1>
          <p style="color: #f0fdfa; margin: 10px 0 0; font-size: 14px;">Thank you for trusting MediGen</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #475569;">Namaste <strong>${address.fullName}</strong>,</p>
          <p style="font-size: 15px; color: #64748b; line-height: 1.6;">
            We have received your order. Your medicines are being packed at our licensed generic pharmacy partner.
          </p>

          <!-- Order Info Box -->
          <div style="background-color: #f0fdfa; border-radius: 8px; padding: 20px; margin: 25px 0; display: flex; justify-content: space-between; border: 1px solid #ccfbf1;">
            <div>
              <div style="font-size: 11px; color: #0d9488; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Order ID</div>
              <div style="font-size: 16px; color: #1e293b; font-weight: bold; margin-top: 4px;">#${id}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #0d9488; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Est. Delivery</div>
              <div style="font-size: 16px; color: #1e293b; font-weight: bold; margin-top: 4px;">${order.deliveryTime}</div>
            </div>
          </div>

          <!-- Items Table -->
          <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #f8fafc; color: #64748b;">
                <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Medicine</th>
                <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; color: #475569; border-top: 2px solid #e2e8f0;">Total Amount</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; color: #0D9488; font-size: 18px; border-top: 2px solid #e2e8f0;">₹${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Disclaimer -->
          <div style="background-color: #f0f9ff; border-left: 4px solid #38bdf8; padding: 15px; margin-top: 30px; font-size: 13px; color: #0369a1; border-radius: 0 4px 4px 0;">
            <strong>Important Medical Disclaimer:</strong> Medicines should be taken only as prescribed by a qualified doctor. Please verify the contents of this package upon delivery.
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p>Need help? Contact us at <a href="mailto:support@medigen.in" style="color: #0D9488; text-decoration: none; font-weight: 500;">support@medigen.in</a></p>
            <p>&copy; ${new Date().getFullYear()} MediGen India. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 3. Log to Console (Simulating Email Sending)
  console.group('%c📧 [Backend Simulation] Sending Order Confirmation Email', 'color: #0D9488; font-weight: bold; font-size: 14px;');
  console.log(`%cTo: %c${customerEmail}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log(`%cSubject: %cYour Medicine Order is Confirmed – Order #${id}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log('%cTemplate Preview (HTML):', 'color: gray', '\n' + emailTemplate.replace(/\s+/g, ' ').substring(0, 150) + '...');
  console.groupEnd();

  return true;
};
