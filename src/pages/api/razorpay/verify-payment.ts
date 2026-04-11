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
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify signature
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    //   .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    //   .digest("hex");

    // if (expectedSignature !== razorpay_signature) {
    //   return res.status(400).json({ error: "Invalid signature" });
    // }

    // Update subscription status
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("razorpay_subscription_id", razorpay_subscription_id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return res.status(500).json({ error: "Failed to update subscription" });
    }

    // Get subscription to update user plan
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("user_id, plan")
      .eq("razorpay_subscription_id", razorpay_subscription_id)
      .single();

    if (subscription) {
      // Update user plan
      await supabase
        .from("users")
        .update({ plan: subscription.plan })
        .eq("id", subscription.user_id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}