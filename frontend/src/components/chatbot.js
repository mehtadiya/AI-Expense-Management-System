import { useState, useRef, useEffect } from "react";

const API_URL = process.env.REACT_APP_PYTHON_APP_API_URL;

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const token = localStorage.getItem("token");

  const isFirstRender = useRef(true);
  const prevMessagesLength = useRef(0);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    prevMessagesLength.current = messages.length;
    return;
  }

  if (messages.length > prevMessagesLength.current) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  prevMessagesLength.current = messages.length;
}, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg.text })
      });

      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: formatResponse(data)
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: " Server error" }
      ]);
    }

    setLoading(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let text = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }

      setInput(text);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>Expense AI Assistant</div>
          <div style={styles.subtitle}>Chat • Voice • Smart Tracking</div>
        </div>

        <div style={styles.chatBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background:
                  msg.sender === "user"
                    ? "linear-gradient(135deg,#DCF8C6,#b9f6ca)"
                    : "#ffffff",
                color: "#111",
                borderTopRightRadius: msg.sender === "user" ? 0 : 14,
                borderTopLeftRadius: msg.sender === "bot" ? 0 : 14
              }}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div style={styles.typing}>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        <div style={styles.inputBox}>
          <input
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or speak your expense..."
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />

          <button
            style={{
              ...styles.micButton,
              background: listening
                ? "linear-gradient(135deg,#ff4d4d,#ff1a1a)"
                : "linear-gradient(135deg,#2e7d32,#43a047)",
              transform: listening ? "scale(1.1)" : "scale(1)"
            }}
            onClick={listening ? stopListening : startListening}
          >
            🎤
          </button>

          <button style={styles.sendButton} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;

function formatResponse(data) {
  let text = data.reply || "";

  if (Array.isArray(data.expenses)) {
    text += "\n\n Summary:";
    text += `\nTotal: ₹${data.expenses.reduce(
      (s, e) => s + Number(e.expenseAmount || 0),
      0
    )}`;
  }

  return text;
}

const styles = {
  page: {
    height: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px"
  },
  container: {
    height: "85vh",
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    background: "#f5f7fb"
  },
  header: {
    padding: "12px 15px",
    background: "linear-gradient(135deg,#2e7d32,#1b5e20)",
    color: "white"
  },
  title: {
    fontSize: "16px",
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: "11px",
    opacity: 0.8
  },
  chatBox: {
  flex: 1,
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  gap: "8px",
  scrollBehavior: "smooth"
},
  message: {
    padding: "10px 12px",
    borderRadius: "14px",
    maxWidth: "75%",
    fontSize: "13px",
    whiteSpace: "pre-line",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  typing: {
    display: "flex",
    gap: "4px",
    padding: "6px 10px"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#666",
    animation: "blink 1.4s infinite"
  },
  inputBox: {
    display: "flex",
    padding: "10px",
    gap: "8px",
    background: "#fff",
    borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    outline: "none",
    fontSize: "13px"
  },
  micButton: {
    width: "42px",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    transition: "0.2s"
  },
  sendButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "10px",
    background: "#1976d2",
    color: "white",
    cursor: "pointer"
  }
};