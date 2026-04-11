import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) return false;
    return data.role === "admin";
  },

  // Get admin stats
  async getAdminStats() {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get all subscriptions for MRR calculation
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("plan_id, plans(price)")
        .eq("status", "active");

      const mrr = subs?.reduce((sum, sub) => {
        const price = (sub.plans as any)?.price || 0;
        return sum + price;
      }, 0) || 0;

      // Calculate churn rate (simplified - last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: cancelledLastMonth } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled")
        .gte("cancelled_at", thirtyDaysAgo.toISOString());

      const churnRate = totalUsers && totalUsers > 0 
        ? ((cancelledLastMonth || 0) / totalUsers) * 100 
        : 0;

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        mrr: mrr,
        churnRate: churnRate.toFixed(1),
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  // Get user growth data (last 12 months)
  async getUserGrowthData() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by month
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return {
          month: d.toLocaleString("default", { month: "short" }),
          users: 0,
        };
      });

      data?.forEach((user) => {
        const userDate = new Date(user.created_at);
        const monthIndex = months.findIndex((m) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (11 - months.indexOf(m)));
          return (
            userDate.getMonth() === d.getMonth() &&
            userDate.getFullYear() === d.getFullYear()
          );
        });
        if (monthIndex !== -1) {
          months[monthIndex].users++;
        }
      });

      return months;
    } catch (error) {
      console.error("Error fetching user growth:", error);
      throw error;
    }
  },

  // Get revenue by plan
  async getRevenueByPlan() {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan_id, plans(name, price)")
        .eq("status", "active");

      if (error) throw error;

      const revenueMap: Record<string, number> = {};
      
      data?.forEach((sub) => {
        const plan = sub.plans as any;
        if (plan) {
          const planName = plan.name;
          const price = plan.price || 0;
          revenueMap[planName] = (revenueMap[planName] || 0) + price;
        }
      });

      return Object.entries(revenueMap).map(([name, revenue]) => ({
        plan: name,
        revenue,
      }));
    } catch (error) {
      console.error("Error fetching revenue by plan:", error);
      throw error;
    }
  },

  // Get platform usage breakdown
  async getPlatformUsage() {
    try {
      const { data, error } = await supabase
        .from("user_platforms")
        .select("platform");

      if (error) throw error;

      const platformCount: Record<string, number> = {};
      data?.forEach((up) => {
        platformCount[up.platform] = (platformCount[up.platform] || 0) + 1;
      });

      return Object.entries(platformCount).map(([platform, count]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        count,
      }));
    } catch (error) {
      console.error("Error fetching platform usage:", error);
      throw error;
    }
  },

  // Get recent signups
  async getRecentSignups(limit = 10) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, plan, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching recent signups:", error);
      throw error;
    }
  },

  // Get all users with filters
  async getUsers(filters?: {
    search?: string;
    plan?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      let query = supabase
        .from("users")
        .select("id, name, email, plan, created_at, last_login");

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.plan) {
        query = query.eq("plan", filters.plan);
      }

      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user details
  async getUserDetails(userId: string) {
    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Get user's subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", userId)
        .single();

      // Get user's platforms
      const { data: platforms } = await supabase
        .from("user_platforms")
        .select("*")
        .eq("user_id", userId);

      // Get user's usage
      const { data: usage } = await supabase
        .from("usage")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30);

      return {
        user,
        subscription,
        platforms: platforms || [],
        usage: usage || [],
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  },

  // Update user plan
  async updateUserPlan(userId: string, newPlan: string) {
    try {
      const { error } = await supabase
        .from("users")
        .update({ plan: newPlan })
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating user plan:", error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Get all subscriptions with filters
  async getSubscriptions(filters?: {
    plan?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      let query = supabase
        .from("subscriptions")
        .select("*, users(name, email), plans(name, price)");

      if (filters?.plan) {
        query = query.eq("plan_id", filters.plan);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },
};