# IndiGo Premium Design System - Design Tokens

This directory contains all design tokens for the IndiGo Premium Design System, extracted from Figma variables.

## Structure

```
tokens/
├── colors.ts           # Color tokens (background, text, icon, border, gradients)
├── typography.ts       # Typography tokens (Web & Mobile)
├── spacing.ts          # Spacing tokens (padding, margin, gap)
├── borderRadius.ts     # Border radius tokens
├── shadows.ts          # Shadow/elevation tokens
├── index.ts            # Main export file
├── css-variables.css   # CSS custom properties
└── README.md           # This file
```

## Usage

### TypeScript/JavaScript

Import tokens in your React components:

```typescript
import { colors, typography, spacing, borderRadius } from './tokens';

// Use in component styles
const buttonStyle = {
  backgroundColor: colors.background.primary,
  color: colors.text.cta,
  padding: spacing.padding.md,
  borderRadius: borderRadius.semantic.button.medium,
  fontFamily: typography.fontFamily.body,
  fontSize: typography.web.body.large.fontSize,
};
```

### CSS Custom Properties

Import the CSS file in your main stylesheet:

```css
@import './tokens/css-variables.css';

.my-button {
  background-color: var(--color-background-primary);
  color: var(--color-text-cta);
  padding: var(--spacing-padding-md);
  border-radius: var(--border-radius-button-medium);
}
```

## Token Categories

### Colors

Colors are organized by semantic usage:

- **Base Colors**: Primitive color values
- **Background Colors**: Component backgrounds
- **Text Colors**: Text content colors
- **Icon Colors**: Icon colors
- **Border Colors**: Border and divider colors
- **Gradients**: Gradient definitions

### Typography

Typography tokens support both Web and Mobile platforms:

- **Web Typography**: 17 text styles optimized for desktop
- **Mobile Typography**: 14 text styles optimized for mobile
- **Font Families**: Bauhaus Std (Display), Poppins (Body)
- **Font Weights**: Regular (400), Medium (500), Semi Bold (600)

### Spacing

Spacing follows an 8px grid system:

- **Base Scale**: 0px to 64px in 4px increments
- **Semantic Tokens**: Padding, Margin, Gap
- **Component Spacing**: Button heights, Input heights, etc.

### Border Radius

Border radius values for component corners:

- **Base Scale**: 0px to 50% (full)
- **Semantic Tokens**: Button, Card, Input, Badge, Avatar, etc.

### Shadows

Shadow definitions for elevation:

- **Base Scale**: None to 2XL
- **Semantic Tokens**: Card, Modal, Dropdown, Tooltip, Floating

## Token Naming Convention

Tokens follow a hierarchical naming pattern:

```
category.subcategory.variant
```

Examples:
- `colors.background.primary`
- `typography.web.body.large`
- `spacing.padding.md`
- `borderRadius.semantic.button.medium`

## Type Safety

All tokens are fully typed with TypeScript. Import types for better IDE support:

```typescript
import type { BackgroundColor, TextColor, Spacing } from './tokens';
```

## Best Practices

1. **Always use semantic tokens** - Never reference base colors directly
2. **Use platform-specific typography** - Choose `web` or `mobile` based on context
3. **Follow spacing scale** - Use semantic spacing tokens (padding, margin, gap)
4. **Maintain consistency** - Use the same tokens across similar components

## Updating Tokens

When updating tokens:

1. Update the TypeScript file (e.g., `colors.ts`)
2. Update the CSS custom properties file (`css-variables.css`)
3. Update this README if structure changes
4. Test components that use the updated tokens

## References

- Design Token Structure: See `../design-token-structure.md`
- Figma File: `Aj7Bq0KFGKM8kwy6VHOrfM`

