import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Send, Mic, Bot, User, LoaderCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAccessibility } from "@/contexts/accessibility-context";

// Bubble component for chat messages
interface BubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

function Bubble({ message, isUser, timestamp }: BubbleProps) {
  const formattedTime = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className="flex items-start max-w-[80%]">
        {!isUser && (
          <div className="mr-2 bg-indigo-100 rounded-full p-2 self-start">
            <Bot className="h-5 w-5 text-indigo-600" />
          </div>
        )}
        
        <div 
          className={`py-3 px-4 rounded-2xl ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
        >
          <p className="text-sm">{message}</p>
          <div className={`text-xs mt-1 ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
            {formattedTime}
          </div>
        </div>
        
        {isUser && (
          <div className="ml-2 bg-indigo-100 rounded-full p-2 self-start">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { voiceControlEnabled } = useAccessibility();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! I'm your SmartCart assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Common questions for quick access
  const commonQuestions = [
    "How do I scan items?",
    "Where can I find my order history?",
    "What payment methods are accepted?",
    "How do I use voice control?",
    "Can I edit items in my cart?"
  ];

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBack = () => {
    navigate("/");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Simulate AI response after a short delay
    // In a real implementation, this would call the Anthropic API
    setTimeout(() => {
      let response = "";
      
      // Simple pattern matching for demo purposes
      const lowerInput = inputText.toLowerCase();
      
      if (lowerInput.includes("scan") || lowerInput.includes("scanning")) {
        response = "To scan items, tap the 'Start Scanning' button on the homepage or go to the Scan page. Point your camera at the barcode of any grocery item, and SmartCart will identify it automatically.";
      } else if (lowerInput.includes("history") || lowerInput.includes("orders")) {
        response = "You can view your order history by clicking on your profile in the top right corner and selecting 'Order History' from the dropdown menu.";
      } else if (lowerInput.includes("payment") || lowerInput.includes("pay")) {
        response = "SmartCart accepts all major credit cards, debit cards, and digital wallets like Apple Pay and Google Pay. Your payment information is securely stored for a seamless checkout experience.";
      } else if (lowerInput.includes("voice") || lowerInput.includes("speak")) {
        response = "To use voice control, enable it in the accessibility panel at the bottom right corner. Then simply say 'Hey SmartCart' followed by your command, like 'Hey SmartCart, add milk to cart' or 'Hey SmartCart, checkout'.";
      } else if (lowerInput.includes("edit") || lowerInput.includes("cart")) {
        response = "You can edit items in your cart by going to the Cart page. There you can adjust quantities, remove items, or clear your entire cart if needed.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
        response = `Hello ${user?.firstName || "there"}! How can I help you with SmartCart today?`;
      } else {
        response = "I'm sorry, I'm not sure I understand that question. Could you try rephrasing it or select one of the common questions below?";
      }

      const aiMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Focus back on input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    // Wait a tiny bit for the state to update
    setTimeout(() => {
      handleSubmit();
    }, 10);
  };

  return (
    <div className="h-full flex flex-col">
      <Header>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
            {!isMobile && <span className="ml-1">Back</span>}
          </Button>
          <h1 className="text-xl font-semibold text-indigo-900">SmartCart Assistant</h1>
        </div>
      </Header>

      <div className="flex-grow flex flex-col bg-gray-50 p-4 overflow-hidden">
        <div className="flex-grow overflow-y-auto px-2 pb-4">
          {/* Messages container */}
          <div className="max-w-2xl mx-auto">
            {messages.map((msg, index) => (
              <Bubble 
                key={index}
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center bg-gray-100 py-3 px-4 rounded-2xl rounded-tl-none">
                  <LoaderCircle className="h-5 w-5 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">SmartCart is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick questions */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex space-x-2 pb-2 max-w-2xl mx-auto">
            {commonQuestions.map((q, i) => (
              <Button 
                key={i}
                variant="outline" 
                size="sm"
                className="whitespace-nowrap bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200"
                onClick={() => handleQuickQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white rounded-lg shadow-md p-3 max-w-2xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question here..."
              className="flex-grow resize-none min-h-[60px] max-h-[150px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              {voiceControlEnabled && (
                <Button 
                  type="button" 
                  size="icon"
                  variant="outline"
                  className="rounded-full h-10 w-10 border-indigo-200"
                >
                  <Mic className="h-5 w-5 text-indigo-700" />
                </Button>
              )}
              <Button 
                type="submit" 
                size="icon"
                className="rounded-full h-10 w-10 bg-indigo-600 hover:bg-indigo-700"
                disabled={!inputText.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}