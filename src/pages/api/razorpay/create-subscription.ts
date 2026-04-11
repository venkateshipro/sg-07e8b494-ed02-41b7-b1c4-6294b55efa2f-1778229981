import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

// This would use the Razorpay Node.js SDK in production
// For now, this is a placeholder implementation

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, planSlug } = req.body;

    if (!userId || !planSlug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("slug", planSlug)
      .single();

    if (planError || !plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // In production, create Razorpay subscription here
    // const Razorpay = require("razorpay");
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    
    // const subscription = await razorpay.subscriptions.create({
    //   plan_id: plan.razorpay_plan_id,
    //   customer_notify: 1,
    //   total_count: 12,
    // });

    // Mock subscription ID for development
    const mockSubscriptionId = `sub_${Date.now()}`;

    // Create subscription record
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan: planSlug,
        status: "created",
        razorpay_subscription_id: mockSubscriptionId,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (subError) {
      console.error("Error creating subscription:", subError);
      return res.status(500).json({ error: "Failed to create subscription" });
    }

    return res.status(200).json({ 
      subscriptionId: mockSubscriptionId,
      amount: plan.price * 100, // Convert to paise
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}