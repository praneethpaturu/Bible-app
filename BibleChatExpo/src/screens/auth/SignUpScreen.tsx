import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Input, Button } from "react-native-elements";
import { supabase } from "../../utils/supabase";

const SignUpScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email: email,
          },
        },
      });

      if (error) throw error;

      if (user) {
        try {
          const { error: updateError } = await supabase.from("users").insert({
            id: user.id,
            user_id: user.id,
            name: fullName,
            email: email,
            token_identifier: user.id,
            created_at: new Date().toISOString(),
          });

          if (updateError) throw updateError;
        } catch (err: any) {
          Alert.alert("Error updating user", err.message);
        }
      }

      Alert.alert(
        "Success",
        "Thanks for signing up! Please check your email for a verification link.",
        [{ text: "OK", onPress: () => navigation.navigate("SignIn") }],
      );
    } catch (error: any) {
      Alert.alert("Error signing up", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Already have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("SignIn")}
          >
            Sign in
          </Text>
        </Text>

        <Input
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          containerStyle={styles.inputContainer}
        />

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.inputContainer}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.inputContainer}
        />

        <Button
          title={loading ? "Signing up..." : "Sign up"}
          onPress={handleSignUp}
          disabled={loading}
          buttonStyle={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  link: {
    color: "#3498db",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 5,
    padding: 15,
  },
});

export default SignUpScreen;
