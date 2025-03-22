import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Pre-defined responses for common questions
const faqResponses: Record<string, string> = {
  "how does scanning work": "Simply point your camera at a grocery item and tap the 'Scan Item' button. Our AI will recognize the product and add it to your cart automatically!",
  "how do i checkout": "Once you've added all your items, click the 'Checkout' button. You'll be able to review your cart one final time before completing your purchase.",
  "how do i add items manually": "If scanning doesn't work, you can tap the '+' button to manually search for and add items to your cart.",
  "what items can i scan": "SmartCart can recognize most grocery items including packaged goods, produce, beverages, and more. Some very small items or items with damaged packaging might be harder to identify.",
  "do i need to scan barcodes": "No! Our advanced AI can recognize products from their appearance - no barcode scanning needed.",
  "what payment methods": "SmartCart supports credit cards, debit cards, mobile payment services like Apple Pay and Google Pay, and store loyalty accounts.",
  "how accurate is the scanner": "Our AI scanner is over 95% accurate for common grocery items. If an item isn't recognized correctly, you can always add it manually.",
  "is my data secure": "Yes, SmartCart uses bank-level encryption to protect your personal and payment information. We never share your data with third parties.",
  "how do i create an account": "Tap the profile icon and select 'Sign Up' to create a new account. You'll need to provide an email address and create a password.",
  "what stores support smartcart": "SmartCart works with major grocery chains including Loblaws, Sobeys, Metro, Walmart, and many independent grocers across the country.",
  "help": "I'm SmartCart AI, your shopping assistant! I can help with scanning items, finding products, checkout, or answering questions about the app. What would you like to know?",
};

export function SmartCartAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    {text: "Hello! I'm SmartCart AI, your shopping assistant. How can I help you today?", isUser: false}
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Function to get response based on user input
  const getResponse = (userInput: string) => {
    const lowercaseInput = userInput.toLowerCase();
    
    // Check for keywords in the user input that match our FAQ entries
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (lowercaseInput.includes(keyword)) {
        return response;
      }
    }
    
    // Check for common greeting patterns
    if (/^(hi|hello|hey|greetings)/i.test(lowercaseInput)) {
      return "Hello! How can I assist you with your shopping today?";
    }
    
    // Check for thanks
    if (/thank|thanks/i.test(lowercaseInput)) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    // Check for questions about scanning items
    if (/scan|camera|picture|photo/i.test(lowercaseInput)) {
      return "To scan an item, simply center it in the camera view and tap the 'Scan Item' button. I'll identify it and add it to your cart!";
    }
    
    // Check for questions about the cart
    if (/cart|basket|add|item/i.test(lowercaseInput)) {
      return "You can view your cart items on the right side of the screen. Items you scan will automatically be added to your cart.";
    }
    
    // Default response when we don't understand
    return "I'm not sure I understand. You can ask me about scanning items, using the app, checkout process, or try rephrasing your question.";
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI thinking time (0.5-1.5 seconds)
    setTimeout(() => {
      const aiResponse = { text: getResponse(input), isUser: false };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, Math.random() * 1000 + 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex items-center">
        <Bot className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="font-medium text-gray-900">SmartCart AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about scanning, checkout, or help..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}