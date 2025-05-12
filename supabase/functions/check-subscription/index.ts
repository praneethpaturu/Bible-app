import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface User {
  id: string;
  email: string;
}

interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");

    // Verify the token and get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid token or user not found");
    }

    // Query the subscriptions table to get the user's subscription status
    const { data: subscription, error: subscriptionError } =
      await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      throw new Error(
        `Error fetching subscription: ${subscriptionError.message}`,
      );
    }

    // Check if the user is in trial period
    const now = new Date();
    const trialEndsAt = subscription?.trial_ends_at
      ? new Date(subscription.trial_ends_at)
      : null;
    const isInTrial = trialEndsAt && trialEndsAt > now;

    // Check if subscription is active
    const currentPeriodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end)
      : null;
    const isSubscriptionActive =
      currentPeriodEnd &&
      currentPeriodEnd > now &&
      subscription.status === "active";

    // Determine if the user has an active subscription (either paid or in trial)
    const isActive = isInTrial || isSubscriptionActive;

    // Prepare the response
    const status: SubscriptionStatus = {
      isActive,
      plan: subscription?.plan_id || null,
      trialEndsAt: trialEndsAt?.toISOString() || null,
      currentPeriodEnd: currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    };

    return new Response(JSON.stringify(status), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
