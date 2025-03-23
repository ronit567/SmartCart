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
        
        <Tabs defaultValue="color-sort" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="color-sort">Color Sort</TabsTrigger>
            <TabsTrigger value="memory-match">Memory Match</TabsTrigger>
          </TabsList>
          
          <TabsContent value="color-sort" className="mt-4">
            <ColorSortGame />
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

function ColorSortGame() {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<null | { id: string, emoji: string, color: string }>(null);
  const [items, setItems] = useState<Array<{ id: string, emoji: string, color: string, sorted: boolean }>>([]);
  const [level, setLevel] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Define color categories with corresponding food items
  const colorCategories = [
    { name: "Red", color: "bg-red-500", items: ["🍎", "🍓", "🍒", "🍅", "🌶️"] },
    { name: "Yellow", color: "bg-yellow-400", items: ["🍌", "🍋", "🍍", "🌽", "🧀"] },
    { name: "Green", color: "bg-green-500", items: ["🥝", "🥑", "🥬", "🥦", "🫑"] },
    { name: "Orange", color: "bg-orange-500", items: ["🍊", "🥕", "🎃", "🍑", "🧡"] }
  ];
  
  // Initialize game based on level
  const startGame = () => {
    const numberOfCategories = Math.min(level + 1, colorCategories.length);
    const itemsPerCategory = level + 1;
    
    let gameItems: Array<{ id: string, emoji: string, color: string, sorted: boolean }> = [];
    
    // Select categories based on level
    const selectedCategories = colorCategories.slice(0, numberOfCategories);
    
    // Add items from each category
    selectedCategories.forEach(category => {
      // Take a random subset of items from this category
      const categoryItems = [...category.items]
        .sort(() => Math.random() - 0.5)
        .slice(0, itemsPerCategory);
      
      // Add them to the game items
      categoryItems.forEach((emoji, index) => {
        gameItems.push({
          id: `${category.name}-${index}`,
          emoji,
          color: category.name.toLowerCase(),
          sorted: false
        });
      });
    });
    
    // Shuffle all items
    gameItems = gameItems.sort(() => Math.random() - 0.5);
    
    setItems(gameItems);
    setScore(0);
    setGameStarted(true);
    setGameComplete(false);
  };
  
  // Handle drag start
  const handleDragStart = (item: { id: string, emoji: string, color: string }) => {
    setDraggedItem(item);
  };
  
  // Handle dropping item in a category
  const handleDrop = (categoryName: string) => {
    if (!draggedItem) return;
    
    const itemColor = draggedItem.color;
    const isCorrect = itemColor.toLowerCase() === categoryName.toLowerCase();
    
    // Update items array
    const updatedItems = items.map(item => {
      if (item.id === draggedItem.id) {
        return {
          ...item,
          sorted: true
        };
      }
      return item;
    });
    
    // Update score
    if (isCorrect) {
      setScore(prevScore => prevScore + 10);
    } else {
      setScore(prevScore => Math.max(0, prevScore - 5));
    }
    
    setItems(updatedItems);
    setDraggedItem(null);
    
    // Check if all items are sorted
    if (updatedItems.every(item => item.sorted)) {
      // Level complete
      if (level < 3) {
        setTimeout(() => {
          setLevel(level + 1);
          startGame();
        }, 1500);
      } else {
        setGameComplete(true);
      }
    }
  };
  
  // Drag over handler (prevent default to allow drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-indigo-100 rounded-lg p-4 mb-4 text-center">
          <h3 className="font-medium mb-2">How to Play:</h3>
          <p className="text-sm mb-2">Sort food items into their matching color categories!</p>
          <p className="text-xs text-gray-600">Drag each food to its matching colored basket.</p>
        </div>
        <Button onClick={startGame} className="bg-indigo-600 hover:bg-indigo-700">
          Start Game
        </Button>
      </div>
    );
  }
  
  // Get active categories for this level
  const activeCategories = colorCategories.slice(0, Math.min(level + 1, colorCategories.length));
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">Level: {level}</div>
        <div className="font-medium">Score: {score}</div>
        <Button size="sm" variant="outline" onClick={startGame}>
          Restart
        </Button>
      </div>
      
      {/* Color baskets (drop targets) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {activeCategories.map(category => (
          <div
            key={category.name}
            className={`${category.color} text-white p-2 rounded-lg text-center h-20 flex flex-col items-center justify-center`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(category.name)}
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-xs">Drop here</span>
          </div>
        ))}
      </div>
      
      {/* Food items to drag */}
      <div className="bg-indigo-50 p-3 rounded-lg">
        <h3 className="font-medium mb-2 text-center">Drag these items to their colors:</h3>
        <div className="grid grid-cols-4 gap-2">
          {items.filter(item => !item.sorted).map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg h-12 flex items-center justify-center cursor-grab text-2xl shadow-sm hover:shadow"
              draggable
              onDragStart={() => handleDragStart(item)}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      </div>
      
      {gameComplete && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center mt-4">
          <h3 className="font-bold mb-1">You completed all levels!</h3>
          <p>Amazing job! Your final score is {score} points.</p>
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
  const [isChecking, setIsChecking] = useState(false);
  
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
    setIsChecking(false);
  };
  
  const flipCard = (index: number) => {
    // Don't flip if already matched or flipped or we're currently checking a pair
    if (cards[index].matched || cards[index].flipped || flippedCount === 2 || isChecking) return;
    
    // Create a new card array with the flipped card
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    
    // Track flipped cards
    const newFlippedIndexes = [...flippedIndexes, index];
    setFlippedIndexes(newFlippedIndexes);
    setFlippedCount(newFlippedIndexes.length);
    
    // If we flipped 2 cards
    if (newFlippedIndexes.length === 2) {
      setIsChecking(true);
      setMoves(prevMoves => prevMoves + 1);
      
      // Check if the cards match
      const firstCardIndex = newFlippedIndexes[0];
      const secondCardIndex = newFlippedIndexes[1];
      const firstCard = newCards[firstCardIndex];
      const secondCard = newCards[secondCardIndex];
      
      if (firstCard.emoji === secondCard.emoji) {
        // Mark as matched
        const updatedCards = [...newCards];
        updatedCards[firstCardIndex].matched = true;
        updatedCards[secondCardIndex].matched = true;
        
        setTimeout(() => {
          setCards(updatedCards);
          setFlippedCount(0);
          setFlippedIndexes([]);
          setIsChecking(false);
        }, 500);
      } else {
        // After a delay, flip unmatched cards back
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[firstCardIndex].flipped = false;
          updatedCards[secondCardIndex].flipped = false;
          setCards(updatedCards);
          setFlippedCount(0);
          setFlippedIndexes([]);
          setIsChecking(false);
        }, 1000);
      }
    }
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
  
  const allMatched = cards.length > 0 && cards.every(card => card.matched);
  
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
            className={`aspect-square flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-all duration-300 ${
              card.flipped || card.matched 
                ? "bg-indigo-100 text-indigo-800 shadow-md transform hover:scale-105" 
                : "bg-indigo-600 hover:bg-indigo-700"
            } ${isChecking ? 'pointer-events-none' : ''}`}
            onClick={() => flipCard(index)}
          >
            {(card.flipped || card.matched) ? card.emoji : ""}
          </div>
        ))}
      </div>
      
      {allMatched && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center mt-2 animate-pulse">
          <h3 className="font-bold mb-1">You won! 🎉</h3>
          <p>All pairs matched in {moves} moves.</p>
          <Button 
            onClick={startGame} 
            className="mt-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}