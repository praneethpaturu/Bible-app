import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Icon } from "react-native-elements";
import { supabase } from "./src/utils/supabase";
import { Linking, Alert } from "react-native";

// Auth Screens
import SignInScreen from "./src/screens/auth/SignInScreen";
import SignUpScreen from "./src/screens/auth/SignUpScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";

// Main Screens
import DashboardScreen from "./src/screens/dashboard/DashboardScreen";
import ChatScreen from "./src/screens/chat/ChatScreen";
import BibleBrowseScreen from "./src/screens/bible/BibleBrowseScreen";
import PricingScreen from "./src/screens/pricing/PricingScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === "Dashboard") {
          iconName = "home";
        } else if (route.name === "Chat") {
          iconName = "chat";
        } else if (route.name === "Bible") {
          iconName = "book";
        } else if (route.name === "Pricing") {
          iconName = "attach-money";
        }

        return (
          <Icon name={iconName} type="material" size={size} color={color} />
        );
      },
      tabBarActiveTintColor: "#3498db",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Bible"
      component={BibleBrowseScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Pricing"
      component={PricingScreen}
      options={{ headerShown: false }}
    />
  </Tab.Navigator>
);

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialUrl, setInitialUrl] = useState<string | null>(null);

  useEffect(() => {
    // Handle initial deep link if app was closed
    Linking.getInitialURL().then((url) => {
      if (url) {
        setInitialUrl(url);
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const linkingListener = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      linkingListener.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    // Parse the URL
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;

    // Handle Stripe payment success or cancel
    if (url.includes("biblechatapp://success")) {
      // Check for success or cancel status in the URL
      const status = parsedUrl.searchParams.get("status");

      if (status === "success") {
        Alert.alert(
          "Payment Successful",
          "Your subscription has been activated!",
        );
        // You could navigate to a success screen or refresh subscription status
      } else if (status === "cancel") {
        Alert.alert("Payment Cancelled", "Your payment was not completed.");
      }
    }
  };

  if (loading) {
    // You could add a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
