import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button, Card, Icon } from "react-native-elements";
import { supabase } from "../../utils/supabase";

const DashboardScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Icon name="logout" type="material" color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Icon name="info-outline" type="material" color="#666" size={16} />
        <Text style={styles.infoText}>
          This is a protected page only visible to authenticated users
        </Text>
      </View>

      <Card containerStyle={styles.userCard}>
        <View style={styles.userHeader}>
          <Icon
            name="person-circle-outline"
            type="ionicon"
            size={48}
            color="#3498db"
          />
          <View>
            <Text style={styles.userCardTitle}>User Profile</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.userDataContainer}>
          <ScrollView style={styles.userDataScroll}>
            <Text style={styles.userDataText}>
              {JSON.stringify(user, null, 2)}
            </Text>
          </ScrollView>
        </View>
      </Card>

      <View style={styles.featuresContainer}>
        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => navigation.navigate("BibleBrowse")}
        >
          <Icon name="book-outline" type="ionicon" size={24} color="#3498db" />
          <Text style={styles.featureText}>Browse Bible</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => navigation.navigate("Chat")}
        >
          <Icon
            name="chatbubble-outline"
            type="ionicon"
            size={24}
            color="#3498db"
          />
          <Text style={styles.featureText}>Bible Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => navigation.navigate("SavedChats")}
        >
          <Icon
            name="bookmark-outline"
            type="ionicon"
            size={24}
            color="#3498db"
          />
          <Text style={styles.featureText}>Saved Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Icon
            name="settings-outline"
            type="ionicon"
            size={24}
            color="#3498db"
          />
          <Text style={styles.featureText}>Settings</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  userCard: {
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 16,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
  },
  userDataContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  userDataScroll: {
    flex: 1,
  },
  userDataText: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  featureButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default DashboardScreen;
