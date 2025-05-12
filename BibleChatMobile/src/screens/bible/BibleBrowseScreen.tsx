import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Icon } from "react-native-elements";
import Voice from "@react-native-voice/voice";

// Sample Bible books data
const bibleBooks = [
  { id: "1", name: "Genesis", chapters: 50 },
  { id: "2", name: "Exodus", chapters: 40 },
  { id: "3", name: "Leviticus", chapters: 27 },
  { id: "4", name: "Numbers", chapters: 36 },
  { id: "5", name: "Deuteronomy", chapters: 34 },
  { id: "6", name: "Joshua", chapters: 24 },
  { id: "7", name: "Judges", chapters: 21 },
  { id: "8", name: "Ruth", chapters: 4 },
  { id: "9", name: "Matthew", chapters: 28 },
  { id: "10", name: "Mark", chapters: 16 },
  { id: "11", name: "Luke", chapters: 24 },
  { id: "12", name: "John", chapters: 21 },
  // Add more books as needed
];

const BibleBrowseScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState(bibleBooks);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Initialize Voice
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Destroy Voice instance on unmount
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    console.log("Speech started");
  };

  const onSpeechEnd = () => {
    setIsListening(false);
    console.log("Speech ended");
  };

  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setSearchQuery(recognizedText);
      handleSearch(recognizedText);
    }
  };

  const onSpeechError = (e: any) => {
    console.error("Speech recognition error:", e);
    setIsListening(false);
    Alert.alert("Voice Recognition Error", "Please try again later");
  };

  const startVoiceRecognition = async () => {
    try {
      await Voice.start("en-US");
      setIsListening(true);
    } catch (e) {
      console.error("Voice recognition error:", e);
      Alert.alert("Error", "Voice recognition failed to start");
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = bibleBooks.filter((book) =>
        book.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(bibleBooks);
    }
  };

  const renderBookItem = ({ item }: { item: (typeof bibleBooks)[0] }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigation.navigate("BibleChapter", { book: item })}
    >
      <Text style={styles.bookName}>{item.name}</Text>
      <Text style={styles.chapterCount}>{item.chapters} chapters</Text>
      <Icon name="chevron-right" type="material" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          type="material"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          onPress={startVoiceRecognition}
          style={styles.voiceButton}
        >
          <Icon
            name={isListening ? "mic" : "mic-none"}
            type="material"
            size={24}
            color={isListening ? "#3498db" : "#999"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.booksList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 4,
  },
  booksList: {
    paddingHorizontal: 16,
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bookName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  chapterCount: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
});

export default BibleBrowseScreen;
