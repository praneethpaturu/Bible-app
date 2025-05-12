import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Card, Button, Icon } from "react-native-elements";
import { supabase } from "../../utils/supabase";

type Plan = {
  id: string;
  name: string;
  amount: number;
  interval: string;
  popular?: boolean;
};

const PricingScreen = ({ navigation }: any) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getPlans = async () => {
      try {
        // Get user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);

        // Get plans
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-get-plans",
        );
        if (error) throw error;
        setPlans(data || []);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    getPlans();
  }, []);

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to subscribe to a plan", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => navigation.navigate("SignIn") },
      ]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            // Using deep linking scheme for handling payment return
            return_url: "biblechatapp://success?status=success",
            cancel_url: "biblechatapp://success?status=cancel",
          },
        },
      );

      if (error) throw error;

      // Open the checkout URL in the device's browser
      if (data?.url) {
        Linking.openURL(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pricing Plans</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Simple, Transparent Pricing</Text>
        <Text style={styles.subtitle}>
          Choose the perfect plan for your Bible study journey
        </Text>

        {plans.map((plan) => (
          <Card
            key={plan.id}
            containerStyle={[
              styles.planCard,
              plan.popular && styles.popularCard,
            ]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${plan.amount / 100}</Text>
              <Text style={styles.interval}>/{plan.interval}</Text>
            </View>
            <Button
              title="Get Started"
              onPress={() => handleCheckout(plan.id)}
              buttonStyle={styles.button}
              loading={loading}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: "#3498db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  popularBadge: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
  },
  interval: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default PricingScreen;
