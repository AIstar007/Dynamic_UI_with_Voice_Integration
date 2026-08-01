/**
 * IndiGo Premium Design System - Border Radius Tokens
 * 
 * Border radius tokens define the curvature of component corners.
 * Values are organized by size scale and semantic usage.
 */

// Base Border Radius Scale
export const borderRadius = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  base: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
  full: '50%', // Circular elements
} as const;

// Semantic Border Radius Tokens
export const semanticBorderRadius = {
  // Buttons: Medium to Large radius
  button: {
    small: borderRadius.base,  // 8px
    medium: borderRadius.lg,   // 12px
    large: borderRadius.xl,     // 16px
  },
  // Cards: Medium radius
  card: borderRadius.lg, // 12px
  // Inputs: Small to Medium radius
  input: {
    small: borderRadius.sm,  // 4px
    medium: borderRadius.base, // 8px
    large: borderRadius.lg,   // 12px
  },
  // Badges: Large to X-Large radius
  badge: {
    small: borderRadius.xl,   // 16px
    medium: borderRadius['2xl'], // 20px
    large: borderRadius['3xl'],  // 24px
  },
  // Avatars: Full radius (circular)
  avatar: borderRadius.full, // 50%
  // Checkbox/Radio: Small radius
  checkbox: borderRadius.sm, // 4px
  radio: borderRadius.full,   // 50% (circular)
  // Toggle: Full radius (pill-shaped)
  toggle: borderRadius.full, // 50%
} as const;

// Complete Border Radius Token Object
export const borderRadiusTokens = {
  base: borderRadius,
  semantic: semanticBorderRadius,
} as const;

// Type exports
export type BorderRadius = typeof borderRadius[keyof typeof borderRadius];

