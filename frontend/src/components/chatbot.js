import { useState, useRef, useEffect } from "react";
const API_URL = process.env.PYTHON_APP_API_URL;


function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null); 

  const token = localStorage.getItem("token");

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
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
        { sender: "bot", text: "❌ Server error" }
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#DCF8C6" : "#F1F1F1"
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div style={styles.typing}>Bot is typing...</div>}

        <div ref={bottomRef}></div>
      </div>

      <div style={styles.inputBox}>
        <input
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
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
  container: {
    height: "80vh",
    maxWidth: "600px",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ccc",
    borderRadius: "10px"
  },
  chatBox: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto"
  },
  message: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "8px",
    maxWidth: "75%",
    whiteSpace: "pre-line"
  },
  typing: {
    fontStyle: "italic",
    color: "#777"
  },
  inputBox: {
    display: "flex",
    borderTop: "1px solid #ccc"
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none"
  },
  button: {
    padding: "10px 20px",
    border: "none",
    background: "#2e7d32",
    color: "white",
    cursor: "pointer"
  }
};