import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: "Missing subscription ID" });
    }

    // In production, cancel via Razorpay API
    // const Razorpay = require("razorpay");
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    
    // await razorpay.subscriptions.cancel(subscriptionId, {
    //   cancel_at_cycle_end: 1,
    // });

    // Update database
    const { error } = await supabase
      .from("subscriptions")
      .update({ 
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("razorpay_subscription_id", subscriptionId);

    if (error) {
      console.error("Error cancelling subscription:", error);
      return res.status(500).json({ error: "Failed to cancel subscription" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}