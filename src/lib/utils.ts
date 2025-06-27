import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.1 guidelines for color contrast
 */
function getRelativeLuminance(color: string): number {
  // Remove # if present and convert to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const getRGB = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const rLinear = getRGB(r);
  const gLinear = getRGB(g);
  const bLinear = getRGB(b);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get the best contrasting text color (black or white) for a given background color
 * Returns the color that provides the highest contrast ratio
 * @param backgroundColor - Hex color string (e.g., "#FFFFFF")
 * @returns "#000000" for black text or "#FFFFFF" for white text
 */
export function getContrastingTextColor(backgroundColor: string): string {
  if (!backgroundColor || !backgroundColor.startsWith('#')) {
    // Default to black text for invalid colors
    return '#000000';
  }

  const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');

  // Return the color with higher contrast ratio
  // WCAG AA requires at least 4.5:1 for normal text, 3:1 for large text
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

/**
 * Check if a color is considered "light" (luminance > 0.5)
 * Useful for quick light/dark detection
 */
export function isLightColor(color: string): boolean {
  if (!color || !color.startsWith('#')) {
    return true; // Default to light
  }
  return getRelativeLuminance(color) > 0.5;
} 