import { useState } from "react";
import { Mic, Volume2, Eye, Sun, Minimize, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAccessibility } from "@/contexts/accessibility-context";

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const {
    voiceControlEnabled,
    toggleVoiceControl,
    screenReaderMode,
    toggleScreenReaderMode,
    highContrastMode,
    toggleHighContrastMode,
    fontSizeScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  } = useAccessibility();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-20 right-4 rounded-full h-10 w-10 bg-white shadow-md"
          aria-label="Accessibility Options"
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-center">Accessibility Options</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Voice and Audio</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4 text-indigo-600" />
                <Label htmlFor="voice-control">Voice Control</Label>
              </div>
              <Switch 
                id="voice-control" 
                checked={voiceControlEnabled}
                onCheckedChange={toggleVoiceControl}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-indigo-600" />
                <Label htmlFor="screen-reader">Screen Reader Mode</Label>
              </div>
              <Switch 
                id="screen-reader" 
                checked={screenReaderMode}
                onCheckedChange={toggleScreenReaderMode}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Display</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-indigo-600" />
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
              </div>
              <Switch 
                id="high-contrast" 
                checked={highContrastMode}
                onCheckedChange={toggleHighContrastMode}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-indigo-600" />
                <span>Font Size (Scale: {fontSizeScale.toFixed(1)})</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={fontSizeScale <= 0.8}
                >
                  <Minimize className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-indigo-600 rounded-full" 
                    style={{ width: `${((fontSizeScale - 0.8) / 0.7) * 100}%` }}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={fontSizeScale >= 1.5}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFontSize}
                  disabled={fontSizeScale === 1}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <h3 className="text-lg font-medium">Voice Command Help</h3>
            <p className="text-sm text-gray-600">
              Activate voice control and say "Hey Smart Cart" followed by commands like:
            </p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>go to checkout</li>
              <li>go to cart</li>
              <li>go home</li>
              <li>start scanning</li>
              <li>read cart</li>
              <li>pay now</li>
              <li>confirm order</li>
              <li>what can I say</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}