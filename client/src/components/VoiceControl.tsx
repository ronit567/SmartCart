import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/cart-context';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceControlProps {
  enabled?: boolean;
}

export function VoiceControl({ enabled = true }: VoiceControlProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const [isListening, setIsListening] = useState(false);
  const [wakePhraseDetected, setWakePhraseDetected] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  const wakePhrase = 'hey smart cart';
  
  const commands = [
    {
      command: 'go to checkout',
      callback: () => navigate('/checkout'),
      description: 'Navigate to checkout page'
    },
    {
      command: 'go to cart',
      callback: () => navigate('/cart'),
      description: 'Navigate to cart page'
    },
    {
      command: 'go home',
      callback: () => navigate('/'),
      description: 'Navigate to home page'
    },
    {
      command: 'start scanning',
      callback: () => navigate('/scan'),
      description: 'Navigate to scan page'
    },
    {
      command: 'view order history',
      callback: () => navigate('/order-history'),
      description: 'Navigate to order history'
    },
    {
      command: 'clear cart',
      callback: () => {
        clearCart();
        speak('Cart has been cleared');
      },
      description: 'Clear all items from cart'
    },
    {
      command: 'pay now',
      callback: () => {
        if (cartItems.length === 0) {
          speak('Your cart is empty. Please add items before checkout.');
        } else {
          navigate('/checkout');
          setTimeout(() => {
            speak('Ready to place your order. Would you like to confirm?');
          }, 1000);
        }
      },
      description: 'Proceed to payment'
    },
    {
      command: 'confirm order',
      callback: () => {
        if (window.location.pathname === '/checkout') {
          // Simulate clicking the Place Order button
          const placeOrderButton = document.querySelector('button.w-full') as HTMLButtonElement;
          if (placeOrderButton) {
            placeOrderButton.click();
            speak('Order confirmed. Thank you for shopping with Smart Cart.');
          } else {
            speak('Unable to find the place order button. Please try again.');
          }
        } else {
          speak('Please go to checkout first to confirm your order.');
        }
      },
      description: 'Confirm and place order'
    },
    {
      command: 'read cart',
      callback: () => {
        if (cartItems.length === 0) {
          speak('Your cart is empty.');
        } else {
          const cartSummary = cartItems.map(item => 
            `${item.quantity} ${item.product.name} at $${item.product.price.toFixed(2)} each`
          ).join(', ');
          
          speak(`Your cart contains: ${cartSummary}`);
        }
      },
      description: 'Read cart contents aloud'
    },
    {
      command: 'what can I say',
      callback: () => {
        speak('You can say: go to checkout, go to cart, go home, start scanning, view order history, clear cart, pay now, confirm order, or read cart.');
      },
      description: 'List available voice commands'
    },
    {
      command: 'stop listening',
      callback: () => {
        SpeechRecognition.stopListening();
        setIsListening(false);
        setWakePhraseDetected(false);
        speak('Voice control deactivated.');
      },
      description: 'Stop listening for commands'
    }
  ];
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });
  
  // Text-to-speech function
  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1.0;
    speech.pitch = 1.0;
    speech.volume = 1.0;
    window.speechSynthesis.speak(speech);
  };
  
  useEffect(() => {
    if (!enabled) return;
    
    // Start continuous listening in the background
    if (!listening && isListening) {
      SpeechRecognition.startListening({
        continuous: true,
        language: 'en-US'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, isListening, enabled]);
  
  useEffect(() => {
    if (!transcript) return;
    
    const lowerCaseTranscript = transcript.toLowerCase();
    
    // Check for wake phrase
    if (!wakePhraseDetected && lowerCaseTranscript.includes(wakePhrase)) {
      setWakePhraseDetected(true);
      resetTranscript();
      speak('How can I help you?');
      return;
    }
    
    // Process command if wake phrase has been detected
    if (wakePhraseDetected) {
      // Check if transcript contains any of our command keywords
      for (const cmd of commands) {
        if (lowerCaseTranscript.includes(cmd.command)) {
          setLastCommand(cmd.command);
          cmd.callback();
          resetTranscript();
          
          // Reset wake phrase after command is processed
          setTimeout(() => {
            setWakePhraseDetected(false);
          }, 5000);
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, wakePhraseDetected]);
  
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-full shadow-lg">
        <MicOff className="h-6 w-6 text-gray-500" />
      </div>
    );
  }
  
  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      setWakePhraseDetected(false);
      toast({
        title: "Voice Control Deactivated",
        description: "Voice commands are now disabled.",
      });
    } else {
      setIsListening(true);
      toast({
        title: "Voice Control Activated",
        description: 'Say "Hey Smart Cart" to activate commands.',
      });
      speak('Voice control activated. Say "Hey Smart Cart" followed by a command.');
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
      {wakePhraseDetected && (
        <div className="bg-indigo-100 p-2 rounded-lg shadow text-sm mb-2 max-w-xs">
          <div className="font-medium text-indigo-800">Listening...</div>
          {lastCommand && <div className="text-gray-700">Last command: {lastCommand}</div>}
        </div>
      )}
      
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        className={`rounded-full h-12 w-12 ${isListening ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
        onClick={toggleListening}
        aria-label={isListening ? "Disable voice control" : "Enable voice control"}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          </div>
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {wakePhraseDetected && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 bg-indigo-50"
          onClick={() => speak('You can say: go to checkout, go to cart, go home, start scanning, view order history, clear cart, pay now, confirm order, or read cart.')}
          aria-label="Help with voice commands"
        >
          <Volume2 className="h-5 w-5 text-indigo-600" />
        </Button>
      )}
    </div>
  );
}