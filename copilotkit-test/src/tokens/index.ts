/**
 * IndiGo Premium Design System - Design Tokens
 * 
 * Main export file for all design tokens.
 * Import from this file to access all tokens in your React components.
 * 
 * @example
 * import { colors, typography, spacing } from './tokens';
 * 
 * const buttonStyle = {
 *   backgroundColor: colors.background.primary,
 *   color: colors.text.cta,
 *   padding: spacing.padding.md,
 *   borderRadius: borderRadius.semantic.button.medium,
 * };
 */
import { colors, typography, spacingTokens,borderRadiusTokens,shadowTokens } from '../tokens';
// Color Tokens
export {
  colors,
  baseColors,
  backgroundColors,
  textColors,
  iconColors,
  borderColors,
  gradients,
  getColor,
  type BaseColor,
  type BackgroundColor,
  type TextColor,
  type IconColor,
  type BorderColor,
} from './colors';

// Typography Tokens
export {
  typography,
  fontFamilies,
  fontWeights,
  webTypography,
  mobileTypography,
  getTypographyStyle,
} from './typography';

// Spacing Tokens
export {
  spacingTokens,
  spacing,
  padding,
  margin,
  gap,
  componentSpacing,
  type Spacing,
  type Padding,
  type Margin,
  type Gap,
} from './spacing';

// Border Radius Tokens
export {
  borderRadiusTokens,
  borderRadius,
  semanticBorderRadius,
  type BorderRadius,
} from './borderRadius';

// Shadow Tokens
export {
  shadowTokens,
  shadows,
  semanticShadows,
  type Shadow,
} from './shadows';

// Complete Token Object (for convenience)
export const tokens = {
  colors,
  typography,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  shadows: shadowTokens,
} as const;

// Default export
export default tokens;

