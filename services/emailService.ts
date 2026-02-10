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
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
        <div style="font-weight: bold; color: #333;">${item.name}</div>
        <div style="font-size: 12px; color: #888;">Generic for ${item.brandExample}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${(item.genericPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  // 2. Create HTML Template
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #009688; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Confirmed!</h1>
          <p style="color: #e0f2f1; margin: 10px 0 0;">Thank you for trusting UpcharGeneric</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #555;">Namaste <strong>${address.fullName}</strong>,</p>
          <p style="font-size: 16px; color: #555; line-height: 1.5;">
            We have received your order. Your medicines are being packed at our licensed generic pharmacy partner.
          </p>

          <!-- Order Info Box -->
          <div style="background-color: #e0f2f1; border-radius: 12px; padding: 20px; margin: 25px 0; display: flex; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; color: #00796b; text-transform: uppercase; font-weight: bold;">Order ID</div>
              <div style="font-size: 18px; color: #004d40; font-weight: bold;">#${id}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #00796b; text-transform: uppercase; font-weight: bold;">Est. Delivery</div>
              <div style="font-size: 18px; color: #004d40; font-weight: bold;">${order.deliveryTime}</div>
            </div>
          </div>

          <!-- Items Table -->
          <h3 style="color: #333; margin-bottom: 15px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #fafafa; color: #666;">
                <th style="text-align: left; padding: 10px;">Medicine</th>
                <th style="text-align: center; padding: 10px;">Qty</th>
                <th style="text-align: right; padding: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${medicineRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; color: #555;">Total Amount</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; color: #009688; font-size: 18px;">₹${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Disclaimer -->
          <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin-top: 30px; font-size: 13px; color: #856404;">
            <strong>Important Medical Disclaimer:</strong> Medicines should be taken only as prescribed by a qualified doctor. Please verify the contents of this package upon delivery.
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>Need help? Contact us at <a href="mailto:support@upchargeneric.in" style="color: #009688; text-decoration: none;">support@upchargeneric.in</a></p>
            <p>&copy; ${new Date().getFullYear()} UpcharGeneric India. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 3. Log to Console (Simulating Email Sending)
  console.group('%c📧 [Backend Simulation] Sending Order Confirmation Email', 'color: #009688; font-weight: bold; font-size: 14px;');
  console.log(`%cTo: %c${customerEmail}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log(`%cSubject: %cYour Medicine Order is Confirmed – Order #${id}`, 'color: gray', 'color: #333; font-weight: bold');
  console.log('%cTemplate Preview (HTML):', 'color: gray', '\n' + emailTemplate.replace(/\s+/g, ' ').substring(0, 150) + '...');
  console.groupEnd();

  return true;
};