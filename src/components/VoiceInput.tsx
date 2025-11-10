import { FaMicrophone } from "react-icons/fa";
import { useState } from "react";

const VoiceInput = ({ onResult }: { onResult: (text: string) => void }) => {
  const [listening, setListening] = useState(false);

  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };
  }

  const handleMicClick = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <FaMicrophone
      className={`cursor-pointer w-6 h-6 ${listening ? "text-red-500 animate-pulse" : ""}`}
      onClick={handleMicClick}
      title={listening ? "Listening..." : "Click to speak"}
    />
  );
};

export default VoiceInput;
