/**
 * IndiGo Premium Design System - Color Tokens
 * 
 * Color tokens are organized by semantic usage categories:
 * - Background: Colors used for component backgrounds
 * - Text: Colors used for text content
 * - Icon: Colors used for icons
 * - Border: Colors used for borders and dividers
 * - Gradient: Gradient definitions for special effects
 * 
 * All colors follow semantic naming based on usage context.
 */

// Base Color Values (Primitive Tokens)
export const baseColors = {
  blackWash: '#0D0D0D',
  darkGrey: '#25304B',
  yellow: '#FFBD12',
  red: '#E23B42',
  indigo: '#000099',
  powderBlue: '#AFE4FF',
  brightBlue: '#00AEE5',
  green: '#7FD287',
  lightGrey: '#7A85A0',
  gold: '#A97D0E',
  goldHover: '#7F5E0B',
  whiteOff: '#EFEFEF',
  white: '#FFFFFF',
  darkGreyAlt: '#30343E', // Used in gradients
  yellowLight: '#FFD25D', // Used in gradients
  darkBrown: '#5C4407', // Used in gradients
  cyan: '#58C9F2', // Used in gradients
} as const;

// Background Colors (Semantic Tokens)
export const backgroundColors = {
  primary: baseColors.blackWash,
  secondary: baseColors.darkGrey,
  warning: baseColors.yellow,
  danger: baseColors.red,
  footerBlue: baseColors.indigo,
  whiteOff: baseColors.whiteOff,
  white: baseColors.white,
} as const;

// Text Colors (Semantic Tokens)
export const textColors = {
  primary: baseColors.whiteOff,
  highlightTitle: baseColors.powderBlue, // Limited to highlighting titles only
  highlightContent: baseColors.brightBlue, // Limited to highlighting body, title, subheadings content
  success: baseColors.green, // Limited for promotional text
  disabled: baseColors.lightGrey, // Disabled CTAs can have this color
  cta: baseColors.gold, // Only CTAs can have this color
  ctaHover: baseColors.goldHover, // CTAs hover can have this color
  danger: baseColors.red, // On exceptional usage for danger/error text content
} as const;

// Icon Colors (Semantic Tokens)
export const iconColors = {
  primary: baseColors.whiteOff, // All icons
  success: baseColors.green, // Limited for promotional iconography
  disabled: baseColors.lightGrey, // Disabled icons
  cta: baseColors.gold, // Icons with CTAs can have this color
  ctaHover: baseColors.goldHover, // Icons with CTAs hover effect
} as const;

// Border Colors (Semantic Tokens)
export const borderColors = {
  primary: baseColors.whiteOff, // All borders
  divider: baseColors.darkGrey, // Subtle divider
  disabled: baseColors.lightGrey, // Disabled borders
  highlight: baseColors.brightBlue, // Limited to highlighting sections
  cta: baseColors.gold, // CTA borders can have this color
  ctaHover: baseColors.goldHover, // CTA border hover effect
} as const;

// Gradient Definitions
export const gradients = {
  silver: {
    name: 'Silver Gradient (Disabled)',
    colors: [baseColors.whiteOff, baseColors.darkGreyAlt],
    usage: 'Semi Premium - Borders and icons',
    css: `linear-gradient(180deg, ${baseColors.whiteOff} 0%, ${baseColors.darkGreyAlt} 100%)`,
  },
  cta: {
    name: 'Call to action',
    colors: [baseColors.yellow, baseColors.yellowLight, baseColors.darkBrown],
    usage: 'Text, Borders and icons',
    css: `linear-gradient(180deg, ${baseColors.yellow} 0%, ${baseColors.yellowLight} 50%, ${baseColors.darkBrown} 100%)`,
  },
  ctaHover: {
    name: 'Call to action [:hover]',
    colors: [baseColors.cyan, baseColors.powderBlue, baseColors.brightBlue],
    usage: 'Borders and icons',
    css: `linear-gradient(180deg, ${baseColors.cyan} 0%, ${baseColors.powderBlue} 50%, ${baseColors.brightBlue} 100%)`,
  },
} as const;

// Complete Color Token Object
export const colors = {
  base: baseColors,
  background: backgroundColors,
  text: textColors,
  icon: iconColors,
  border: borderColors,
  gradient: gradients,
} as const;

// Type exports for TypeScript
export type BaseColor = typeof baseColors[keyof typeof baseColors];
export type BackgroundColor = typeof backgroundColors[keyof typeof backgroundColors];
export type TextColor = typeof textColors[keyof typeof textColors];
export type IconColor = typeof iconColors[keyof typeof iconColors];
export type BorderColor = typeof borderColors[keyof typeof borderColors];

// Helper function to get color by path
export const getColor = (path: string): string => {
  const parts = path.split('.');
  let value: any = colors;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      throw new Error(`Color path "${path}" not found`);
    }
  }
  
  return typeof value === 'string' ? value : value.css || value;
};

