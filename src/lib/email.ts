import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Global Ticket Resale <notifications@globalticketresale.com>";

/**
 * Sends a transactional email via Resend. No-ops (with a console warning)
 * when RESEND_API_KEY isn't configured, so local dev and deploys without
 * the key set don't crash — emails just silently don't send until it's
 * added.
 */
async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }
  await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
}

function layout(title: string, bodyHtml: string) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #0c2049;">
      <div style="background: #041a3d; padding: 24px; border-radius: 12px 12px 0 0;">
        <span style="color: #c69633; font-size: 20px; font-weight: bold;">Global Ticket Resale</span>
      </div>
      <div style="border: 1px solid #e2e8f5; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <h1 style="font-size: 18px; margin-top: 0;">${title}</h1>
        ${bodyHtml}
      </div>
    </div>
  `;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your Global Ticket Resale password",
    layout(
      "Reset your password",
      `<p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
       <p style="margin: 24px 0;"><a href="${resetUrl}" style="background:#041a3d;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">Reset password</a></p>
       <p style="color:#64748b;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`,
    ),
  );
}

export async function sendOrderConfirmedEmail(to: string, eventName: string, totalFormatted: string) {
  await sendEmail(
    to,
    `Your ticket for ${eventName} is confirmed`,
    layout(
      "Purchase confirmed",
      `<p>Your payment of <strong>${totalFormatted}</strong> for <strong>${eventName}</strong> is confirmed and held in escrow.</p>
       <p>Once you attend the event (or confirm the ticket worked), the seller gets paid. If anything's wrong with the ticket, you're covered by our refund guarantee.</p>`,
    ),
  );
}

export async function sendTicketSoldEmail(to: string, eventName: string, payoutFormatted: string) {
  await sendEmail(
    to,
    `Your ticket for ${eventName} sold!`,
    layout(
      "Your ticket sold",
      `<p>Good news — your ticket for <strong>${eventName}</strong> just sold. You'll receive <strong>${payoutFormatted}</strong> once the buyer confirms everything's fine, or automatically after the event.</p>`,
    ),
  );
}

export async function sendRefundProcessedEmail(to: string, eventName: string) {
  await sendEmail(
    to,
    `Refund processed for ${eventName}`,
    layout(
      "Refund processed",
      `<p>Your refund for <strong>${eventName}</strong> has been processed and sent back to your original payment method.</p>`,
    ),
  );
}

export async function sendPayoutReleasedEmail(to: string, eventName: string, payoutFormatted: string) {
  await sendEmail(
    to,
    `Payout sent for ${eventName}`,
    layout(
      "Payout on its way",
      `<p>Your payout of <strong>${payoutFormatted}</strong> for <strong>${eventName}</strong> has been sent to your connected Stripe account.</p>`,
    ),
  );
}
