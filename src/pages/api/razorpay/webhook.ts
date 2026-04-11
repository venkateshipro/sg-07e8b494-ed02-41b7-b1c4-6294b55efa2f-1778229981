import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    //   .update(webhookBody)
    //   .digest("hex");

    // if (expectedSignature !== webhookSignature) {
    //   console.error("Invalid webhook signature");
    //   return res.status(400).json({ error: "Invalid signature" });
    // }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log("Razorpay webhook event:", event);

    switch (event) {
      case "subscription.activated":
        await handleSubscriptionActivated(payload.subscription.entity);
        break;

      case "subscription.charged":
        await handleSubscriptionCharged(payload.payment.entity);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;

      case "subscription.paused":
        await handleSubscriptionPaused(payload.subscription.entity);
        break;

      case "subscription.resumed":
        await handleSubscriptionResumed(payload.subscription.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleSubscriptionActivated(subscription: any) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ 
      status: "active",
      current_period_start: new Date(subscription.current_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_end * 1000).toISOString(),
    })
    .eq("razorpay_subscription_id", subscription.id);

  if (error) {
    console.error("Error activating subscription:", error);
  }
}

async function handleSubscriptionCharged(payment: any) {
  // Could log this to an invoices table
  console.log("Subscription charged:", payment.id);
}

async function handleSubscriptionCancelled(subscription: any) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ 
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("razorpay_subscription_id", subscription.id);

  if (error) {
    console.error("Error cancelling subscription:", error);
  }

  // Get subscription to downgrade user to free
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("razorpay_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("users")
      .update({ plan: "free" })
      .eq("id", sub.user_id);
  }
}

async function handleSubscriptionPaused(subscription: any) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "paused" })
    .eq("razorpay_subscription_id", subscription.id);

  if (error) {
    console.error("Error pausing subscription:", error);
  }
}

async function handleSubscriptionResumed(subscription: any) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("razorpay_subscription_id", subscription.id);

  if (error) {
    console.error("Error resuming subscription:", error);
  }
}

async function handlePaymentFailed(payment: any) {
  // Could send notification to user
  console.log("Payment failed:", payment.id);
}