import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Maximize, Minimize } from "lucide-react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatRef = useRef(null);

  const API_KEY = "AIzaSyBXkxKp8RRplGch03Rt6umywoud-lNc9cc";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && !isFullscreen) {
        setIsOpen(false); 
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isFullscreen]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          contents: [{ role: "user", parts: [{ text: input }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const botMessage = {
        text: response.data.candidates[0]?.content?.parts[0]?.text || "I didn't understand that.",
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prevMessages) => [
        { text: "AI is currently unavailable. Try again later.", sender: "bot" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4">
      {!isOpen && (
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div
          ref={chatRef}
          className={`bg-white ${isFullscreen ? "w-full h-full fixed inset-0" : "w-80 h-96 fixed bottom-4 right-4"} 
            border border-gray-300 shadow-xl rounded-lg flex flex-col`}
        >
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <span className="font-bold">Ask me</span>
            <button
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ?  (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg my-1 ${
                  msg.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <p className="text-gray-500 text-sm">Thinking...</p>}
          </div>
          <div className="p-2 border-t flex">
            <input
              className="flex-1 p-2 border rounded-l-lg focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
