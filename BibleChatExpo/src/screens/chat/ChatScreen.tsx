import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Icon } from "react-native-elements";
import { supabase } from "../../utils/supabase";
import Tts from "react-native-tts";
import Voice from "@react-native-voice/voice";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to Bible Chat! Ask me anything about the Bible.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage("en-US");
    Tts.addEventListener("tts-start", () => setIsSpeaking(true));
    Tts.addEventListener("tts-finish", () => setIsSpeaking(false));
    Tts.addEventListener("tts-cancel", () => setIsSpeaking(false));

    // Initialize Voice
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = () => {
      setIsListening(false);
      Alert.alert("Voice Recognition Error", "Please try again later");
    };

    return () => {
      // Cleanup
      Tts.removeAllListeners();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      const recognizedText = e.value[0];
      setInputText(recognizedText);
    }
  };

  const startVoiceRecognition = async () => {
    try {
      if (isSpeaking) {
        await Tts.stop();
      }
      await Voice.start("en-US");
    } catch (e) {
      console.error("Voice recognition error:", e);
      Alert.alert("Error", "Voice recognition failed to start");
    }
  };

  const speakText = (text: string) => {
    // Remove any markdown or special formatting that might be in the text
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");

    if (isSpeaking) {
      Tts.stop();
      setIsSpeaking(false);
    } else {
      Tts.speak(cleanText);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuestion = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Call the Supabase Edge Function for Bible Chat
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-bible-chat",
        {
          body: { message: userQuestion },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      // Add AI response to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        isUser: false,
        timestamp: new Date(data.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling Bible Chat API:", error);
      Alert.alert(
        "Error",
        "Failed to get a response. Please try again later.",
        [{ text: "OK" }],
      );

      // Add fallback message if API call fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {!item.isUser && (
          <TouchableOpacity
            onPress={() => speakText(item.text)}
            style={styles.speakButton}
          >
            <Icon
              name={isSpeaking ? "volume-up" : "volume-mute"}
              type="material"
              size={16}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible Chat</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Icon
            name="bookmark-outline"
            type="ionicon"
            size={24}
            color="#3498db"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about the Bible..."
          multiline
          editable={!isLoading && !isListening}
        />
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={startVoiceRecognition}
          disabled={isLoading}
        >
          <Icon
            name={isListening ? "mic" : "mic-none"}
            type="material"
            color={isListening ? "#3498db" : "#999"}
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.disabledButton,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" type="material" color="#fff" size={20} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  saveButton: {
    padding: 8,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginRight: 8,
  },
  speakButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#b2d6f5",
  },
});

export default ChatScreen;
