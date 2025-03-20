import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! 👋 Welcome to ChatbotX platform. How can I assist you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: inputValue }]);
    setInputValue("");
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          sender: "bot", 
          text: "Thanks for your message! This is a demo of how your chatbot will appear on your website. You can customize the appearance and behavior in the chatbot builder."
        }
      ]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end space-y-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200" style={{ height: "500px" }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-primary-600 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary-600 text-sm font-medium">AI</div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Support Assistant</h3>
                <p className="text-xs text-primary-100">Online</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-primary-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start ${message.sender === "user" ? "justify-end" : ""}`}>
                {message.sender === "bot" && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">AI</div>
                  </div>
                )}
                <div className={`${
                  message.sender === "bot" 
                    ? "bg-gray-100 rounded-lg rounded-tl-none text-gray-900" 
                    : "bg-primary-600 text-white rounded-lg rounded-tr-none"
                  } px-4 py-2 max-w-[80%]`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                {message.sender === "user" && (
                  <div className="flex-shrink-0 ml-2">
                    <Avatar className="h-8 w-8 bg-gray-300">
                      <AvatarFallback className="text-gray-700 text-sm">U</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <Input 
                type="text" 
                className="flex-1 rounded-r-none" 
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                type="button" 
                variant="default"
                onClick={handleSendMessage}
                className="rounded-l-none"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Powered by ChatbotX
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-14 h-14 rounded-full shadow-lg p-0"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-7 w-7" />}
      </Button>
    </div>
  );
}
