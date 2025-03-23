import { useEffect } from "react";
import { useAccessibility } from "@/contexts/accessibility-context";

export function FontSizeScaler({ children }: { children: React.ReactNode }) {
  const { fontSizeScale, highContrastMode } = useAccessibility();
  
  useEffect(() => {
    // Apply font scaling to the HTML root element
    document.documentElement.style.setProperty('--font-size-scale', fontSizeScale.toString());
    
    // Apply high contrast mode
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
    
    return () => {
      // Clean up
      document.documentElement.style.removeProperty('--font-size-scale');
      document.documentElement.classList.remove('high-contrast-mode');
    };
  }, [fontSizeScale, highContrastMode]);
  
  return <>{children}</>;
}