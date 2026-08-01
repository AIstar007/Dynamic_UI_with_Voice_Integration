/**
 * IndiGo Premium Design System - Shadow/Elevation Tokens
 * 
 * Shadow tokens define depth and elevation in the design system.
 * Note: Specific shadow values are not defined in the Figma file,
 * so these are placeholder values that should be updated based on
 * actual design specifications.
 */

// Shadow Definitions
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// Semantic Shadow Tokens
export const semanticShadows = {
  // Cards: Medium shadow
  card: shadows.md,
  // Modals: Large shadow
  modal: shadows.xl,
  // Dropdowns: Medium shadow
  dropdown: shadows.md,
  // Tooltips: Small shadow
  tooltip: shadows.sm,
  // Floating elements: X-Large shadow
  floating: shadows['2xl'],
} as const;

// Complete Shadow Token Object
export const shadowTokens = {
  base: shadows,
  semantic: semanticShadows,
} as const;

// Type exports
export type Shadow = typeof shadows[keyof typeof shadows];

