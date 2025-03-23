import { createContext, ReactNode, useContext, useState } from "react";

interface AccessibilityContextType {
  voiceControlEnabled: boolean;
  toggleVoiceControl: () => void;
  screenReaderMode: boolean;
  toggleScreenReaderMode: () => void;
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
  fontSizeScale: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState(1);

  const toggleVoiceControl = () => {
    setVoiceControlEnabled(prev => !prev);
  };

  const toggleScreenReaderMode = () => {
    setScreenReaderMode(prev => !prev);
  };

  const toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };

  const increaseFontSize = () => {
    setFontSizeScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const decreaseFontSize = () => {
    setFontSizeScale(prev => Math.max(prev - 0.1, 0.8));
  };

  const resetFontSize = () => {
    setFontSizeScale(1);
  };

  return (
    <AccessibilityContext.Provider
      value={{
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
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}