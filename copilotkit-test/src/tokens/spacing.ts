/**
 * IndiGo Premium Design System - Spacing Tokens
 * 
 * Spacing tokens define consistent spacing values for margins, paddings, and gaps.
 * The system follows an 8px base grid system for consistency.
 */

// Base Spacing Scale (8px grid system)
export const spacing = {
  0: '0',
  1: '4px',   // 0.5 × 8px
  2: '8px',   // 1 × 8px
  3: '12px',  // 1.5 × 8px
  4: '16px',  // 2 × 8px
  5: '20px',  // 2.5 × 8px
  6: '24px',  // 3 × 8px
  7: '28px',  // 3.5 × 8px
  8: '32px',  // 4 × 8px
  9: '36px',  // 4.5 × 8px
  10: '40px', // 5 × 8px
  11: '44px', // 5.5 × 8px
  12: '48px', // 6 × 8px
  13: '52px', // 6.5 × 8px
  14: '56px', // 7 × 8px (Large button height)
  15: '60px', // 7.5 × 8px
  16: '64px', // 8 × 8px
} as const;

// Semantic Padding Tokens
export const padding = {
  none: spacing[0],
  xs: spacing[1],   // 4px
  sm: spacing[2],  // 8px
  md: spacing[3],  // 12px
  base: spacing[4], // 16px
  lg: spacing[6],  // 24px
  xl: spacing[8],  // 32px
  '2xl': spacing[10], // 40px
  '3xl': spacing[12], // 48px
} as const;

// Semantic Margin Tokens
export const margin = {
  none: spacing[0],
  xs: spacing[1],   // 4px
  sm: spacing[2],  // 8px
  md: spacing[3],  // 12px
  base: spacing[4], // 16px
  lg: spacing[6],  // 24px
  xl: spacing[8],  // 32px
  '2xl': spacing[12], // 48px
} as const;

// Semantic Gap Tokens (for flex/grid layouts)
export const gap = {
  none: spacing[0],
  xs: spacing[1],   // 4px
  sm: spacing[2],  // 8px
  md: spacing[3],  // 12px
  base: spacing[4], // 16px
  lg: spacing[6],  // 24px
  xl: spacing[8],  // 32px
  '2xl': spacing[10], // 40px
} as const;

// Component-Specific Spacing
export const componentSpacing = {
  // Button heights (from component tokens)
  button: {
    large: spacing[14],   // 56px
    medium: spacing[10],  // 40px
    small: spacing[9],    // 36px
    mini: spacing[8],     // 32px
  },
  // Input heights
  input: {
    web: {
      standard: spacing[11], // 44px
      error: spacing[16],    // 64px (includes error message)
    },
    mobile: {
      standard: spacing[10], // 40px
      error: spacing[15],     // 60px (includes error message)
    },
  },
  // Checkbox sizes
  checkbox: {
    web: spacing[8],   // 32px
    mobile: spacing[6], // 24px
  },
  // Radio button sizes
  radio: {
    web: spacing[8],   // 32px
    mobile: spacing[6], // 24px
  },
  // Toggle sizes
  toggle: {
    small: spacing[9],  // 36px
    medium: spacing[11], // 44px
    large: spacing[12],  // 48px
  },
} as const;

// Complete Spacing Token Object
export const spacingTokens = {
  base: spacing,
  padding,
  margin,
  gap,
  component: componentSpacing,
} as const;

// Type exports
export type Spacing = typeof spacing[keyof typeof spacing];
export type Padding = typeof padding[keyof typeof padding];
export type Margin = typeof margin[keyof typeof margin];
export type Gap = typeof gap[keyof typeof gap];

