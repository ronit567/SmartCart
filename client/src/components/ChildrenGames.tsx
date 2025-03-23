import { useState } from "react";
import { Gamepad2, Sparkles, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function ChildrenGames() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-300 w-48 flex items-center justify-center"
        >
          <Gamepad2 className="mr-2 h-4 w-4" />
          Kids Games
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-indigo-800 mb-2">Kids Corner</DialogTitle>
          <DialogDescription className="text-center mb-4">
            Have fun with these games while your parents shop!
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="grocery-hunt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grocery-hunt">Grocery Hunt</TabsTrigger>
            <TabsTrigger value="memory-match">Memory Match</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grocery-hunt" className="mt-4">
            <GroceryHuntGame />
          </TabsContent>
          
          <TabsContent value="memory-match" className="mt-4">
            <MemoryMatchGame />
          </TabsContent>
        </Tabs>
        
        <DialogClose asChild>
          <Button variant="outline" className="w-full mt-4">
            Done Playing
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function GroceryHuntGame() {
  const [score, setScore] = useState(0);
  const [itemsFound, setItemsFound] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  
  const groceryItems = [
    "Apple", "Banana", "Carrot", "Milk", "Bread", "Eggs"
  ];
  
  const startGame = () => {
    setScore(0);
    setItemsFound([]);
    setGameStarted(true);
  };
  
  const findItem = (item: string) => {
    if (!itemsFound.includes(item)) {
      setItemsFound([...itemsFound, item]);
      setScore(score + 10);
    }
  };
  
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-indigo-100 rounded-lg p-4 mb-4 text-center">
          <h3 className="font-medium mb-2">How to Play:</h3>
          <p className="text-sm mb-2">Find items on your shopping list to earn points!</p>
          <p className="text-xs text-gray-600">Tap each item when you see it in the store.</p>
        </div>
        <Button onClick={startGame} className="bg-indigo-600 hover:bg-indigo-700">
          Start Game
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">Your Score: {score}</div>
        <Button size="sm" variant="outline" onClick={() => setGameStarted(false)}>
          Restart
        </Button>
      </div>
      
      <div className="bg-indigo-50 p-3 rounded-lg mb-4">
        <h3 className="font-medium mb-2 text-center">Find These Items:</h3>
        <div className="grid grid-cols-2 gap-2">
          {groceryItems.map(item => (
            <Button
              key={item}
              variant={itemsFound.includes(item) ? "default" : "outline"}
              className={itemsFound.includes(item) 
                ? "bg-green-100 text-green-800 border-green-300" 
                : "bg-white"}
              onClick={() => findItem(item)}
            >
              {item} {itemsFound.includes(item) && <Sparkles className="h-4 w-4 ml-1" />}
            </Button>
          ))}
        </div>
      </div>
      
      {itemsFound.length === groceryItems.length && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
          <h3 className="font-bold mb-1">All items found!</h3>
          <p>Great job! You found all the items on your list.</p>
        </div>
      )}
    </div>
  );
}

function MemoryMatchGame() {
  const [cards, setCards] = useState<Array<{id: number, emoji: string, flipped: boolean, matched: boolean}>>([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const emojis = ["🍎", "🍌", "🥕", "🥛", "🍞", "🥚"];
  
  const startGame = () => {
    // Create pairs of cards
    const cardPairs = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }));
    
    setCards(cardPairs);
    setFlippedCount(0);
    setFlippedIndexes([]);
    setMoves(0);
    setGameStarted(true);
  };
  
  const flipCard = (index: number) => {
    // Don't flip if already matched or flipped
    if (cards[index].matched || cards[index].flipped || flippedCount === 2) return;
    
    // Create a new card array with the flipped card
    const newCards = [...cards];
    newCards[index].flipped = true;
    
    // Track flipped cards
    const newFlippedIndexes = [...flippedIndexes, index];
    
    // If we flipped 2 cards
    if (newFlippedIndexes.length === 2) {
      setMoves(moves + 1);
      
      // Check if the cards match
      const firstCard = newCards[newFlippedIndexes[0]];
      const secondCard = newCards[newFlippedIndexes[1]];
      
      if (firstCard.emoji === secondCard.emoji) {
        // Mark as matched
        firstCard.matched = true;
        secondCard.matched = true;
      }
      
      // After a delay, flip unmatched cards back
      setTimeout(() => {
        newCards.forEach(card => {
          if (!card.matched) card.flipped = false;
        });
        setCards([...newCards]);
        setFlippedCount(0);
        setFlippedIndexes([]);
      }, 1000);
    }
    
    setCards(newCards);
    setFlippedCount(newFlippedIndexes.length);
    setFlippedIndexes(newFlippedIndexes);
  };
  
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-indigo-100 rounded-lg p-4 mb-4 text-center">
          <h3 className="font-medium mb-2">How to Play:</h3>
          <p className="text-sm mb-2">Flip cards to find matching pairs!</p>
          <p className="text-xs text-gray-600">Try to match all pairs with the fewest moves.</p>
        </div>
        <Button onClick={startGame} className="bg-indigo-600 hover:bg-indigo-700">
          Start Game
        </Button>
      </div>
    );
  }
  
  const allMatched = cards.every(card => card.matched);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">Moves: {moves}</div>
        <Button size="sm" variant="outline" onClick={startGame}>
          Restart
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`aspect-square flex items-center justify-center text-2xl rounded-lg cursor-pointer ${
              card.flipped || card.matched 
                ? "bg-indigo-100 text-indigo-800" 
                : "bg-indigo-600"
            }`}
            onClick={() => flipCard(index)}
          >
            {(card.flipped || card.matched) ? card.emoji : ""}
          </div>
        ))}
      </div>
      
      {allMatched && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
          <h3 className="font-bold mb-1">You won!</h3>
          <p>All pairs matched in {moves} moves.</p>
        </div>
      )}
    </div>
  );
}