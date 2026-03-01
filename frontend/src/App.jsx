import { useState } from "react";
import ImageDisplay from "./components/ImageDisplay";
import ConversationBox from "./components/ConversationBox";
import ConfettiEffect from "./components/ConfettiEffect";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useTextToSpeech from "./hooks/useTextToSpeech";
import { sendMessage } from "./services/api";
import "./App.css";

function App() {
  const [conversation, setConversation] = useState(
    "Tap Start Conversation to begin voice play."
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightedObject, setHighlightedObject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastChildText, setLastChildText] = useState("");
  const [imageData, setImageData] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const compressImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maxSize = 1024;
          const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
          const width = Math.max(1, Math.floor(image.width * scale));
          const height = Math.max(1, Math.floor(image.height * scale));

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Canvas not supported"));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          const base64 = dataUrl.split(",")[1] || "";

          resolve({
            imageBase64: base64,
            mimeType: "image/jpeg",
          });
        };

        image.onerror = () => reject(new Error("Invalid image"));
        image.src = String(reader.result || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageToBase64(file);
      setImageData(compressed);
      setImagePreviewUrl(URL.createObjectURL(file));
      setConversation("Image uploaded. Press Start Conversation.");
    } catch {
      setConversation("Could not read image. Please try another file.");
    }
  };


  const { speak } = useTextToSpeech();

  const getToolReply = (tool, args = {}) => {
    if (tool === "highlight_object") {
      const objectName = args.object_name || "object";
      return `Great job! I can see the ${objectName}. What else do you see?`;
    }

    if (tool === "celebrate_child") {
      return "Wow! Amazing answer! Can you tell me one more fun thing?";
    }

    return "That sounds wonderful! What do you see next?";
  };

  const getAutoVoiceStyle = (tool) => {
    if (tool === "celebrate_child") {
      return "superFun";
    }

    if (tool === "highlight_object") {
      return "cheerful";
    }

    return "cheerful";
  };

  const callBackend = async (message, options = {}) => {
    setIsLoading(true);
    try {
      const includeImage = options.includeImage === true;
      const data = await sendMessage(message, includeImage ? imageData || {} : {});
      return data;
    } catch (error) {
      setConversation(`Connection issue: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechResult = async (transcript) => {
    setLastChildText(transcript);

    let data;
    try {
      data = await callBackend(transcript, { includeImage: false });
    } catch {
      return;
    }

    let spokenText = data.reply;

    if (!spokenText && data.tool) {
      spokenText = getToolReply(data.tool, data.args);
    }

    if (spokenText) {
      setConversation(spokenText);
      speak(spokenText, getAutoVoiceStyle(data.tool));
    }

    if (data.tool === "highlight_object" && data.args?.object_name) {
      setHighlightedObject(data.args.object_name);
    }

    if (data.tool === "celebrate_child" || data.tool === "highlight_object") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const { startListening, isListening } =
    useSpeechRecognition(handleSpeechResult);

  const startConversation = async () => {
    setLastChildText("");
    let data;
    try {
      data = await callBackend("Start the conversation", { includeImage: true });
    } catch {
      return;
    }

    let spokenText = data.reply;
    if (!spokenText && data.tool) {
      spokenText = getToolReply(data.tool, data.args);
    }

    if (spokenText) {
      setConversation(spokenText);
      speak(spokenText, getAutoVoiceStyle(data.tool));
    }

    if (data.tool === "highlight_object" && data.args?.object_name) {
      setHighlightedObject(data.args.object_name);
    }
  };

  const checkConnection = async () => {
    try {
      await callBackend("ping", { includeImage: false });
    } catch {
      return;
    }
    setConversation("Backend connection is healthy. Ready to play!");
  };

  return (
    <div className="app-page">
      <div className="app-card">
        <div className="hero-row">
          <div>
            <h1>Speak With Zubi 🦁</h1>
            <p className="subtitle">Image-based voice play for kids</p>
          </div>
          <div className={`live-pill ${isListening ? "on" : "off"}`}>
            {isListening ? "🎤 Listening" : "🎧 Ready"}
          </div>
        </div>

        <ImageDisplay highlightedObject={highlightedObject} imageUrl={imagePreviewUrl} />

        <div className="upload-row">
          <label className="upload-label">
            📷 Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        <div className="actions-row">
          <button onClick={startConversation} disabled={isLoading} className="primary-btn">
            {isLoading ? "Loading..." : "Start Conversation"}
          </button>

          <button
            onClick={startListening}
            disabled={isLoading}
            className={`secondary-btn ${isListening ? "is-live" : ""}`}
          >
            {isListening ? "Listening..." : "Speak"}
          </button>

          <button onClick={checkConnection} disabled={isLoading} className="ghost-btn">
            Check Connection
          </button>
        </div>

        <div className="status-row">
          <span className="status-chip">Highlight: {highlightedObject || "None"}</span>
        </div>

        <ConversationBox text={conversation} userText={lastChildText} />

        <ConfettiEffect show={showConfetti} />
      </div>
    </div>
  );
}

export default App;