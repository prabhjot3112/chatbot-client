import { FaMicrophone } from "react-icons/fa";
import { useState } from "react";

interface VoiceInputProps {
  onResult: (text: string) => void;
}


interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}
const VoiceInput = ({ onResult }: VoiceInputProps) => {
  const [listening, setListening] = useState(false);

  // @ts-expect-error: window.SpeechRecognition or webkitSpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition: typeof SpeechRecognition | null = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    // Fixing the SpeechRecognitionEvent type
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
