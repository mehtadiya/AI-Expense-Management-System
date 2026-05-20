import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RecordAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setTranscript("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      setIsProcessing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob);



      
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post("http://127.0.0.1:8000/voice", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { intent, data, transcript: userText } = res.data;
        setTranscript(userText || "");

        const normalizedIntent = intent?.toUpperCase();

        // Handle errors first
        if (normalizedIntent === "ERROR" && data?.error) {
          alert(data.error);
        }
        else if (normalizedIntent === "GET_EXPENSES") {
          navigate("/main/expenses");
        }
        else if (normalizedIntent === "ADD_EXPENSE") {
          navigate("/main/manual", { state: { voiceData: data } });
        }
        else if (normalizedIntent === "ADD_MULTIPLE") {
          navigate("/main/multiple", { state: { voiceData: data } });
        }
        else {
          alert("Command not recognized. Speak clearly.");
        }
      } catch (err) {
        console.error(err);
        alert("Voice processing failed");
      } finally {
        setIsProcessing(false);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setTranscript("Recording... 🎙️");
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setTranscript("Processing voice... ⏳");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎤 Voice Expense Manager</h2>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            ...styles.button,
            backgroundColor: isRecording ? "#e63946" : "#2a9d8f"
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>

        <div style={styles.section}>
          <h3>Status / Transcript</h3>
          <div style={styles.transcriptBox}>
            {transcript || "Speak your command (e.g., add 200 food or show expenses)"}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", background: "white" },
  card: { width: "420px", background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
  title: { textAlign: "center", marginBottom: "20px" },
  button: { width: "100%", padding: "12px", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginBottom: "20px" },
  section: { marginTop: "20px" },
  transcriptBox: { background: "#f1f3f5", padding: "12px", borderRadius: "8px", minHeight: "40px" }
};

export default RecordAudio;