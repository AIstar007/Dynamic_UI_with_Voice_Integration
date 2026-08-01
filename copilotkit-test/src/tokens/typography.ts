/**
 * IndiGo Premium Design System - Typography Tokens
 * 
 * Typography tokens define text styles for both Web and Mobile platforms.
 * The system uses two font families:
 * - Bauhaus Std Medium: For display text
 * - Poppins: For body text and headings (Regular, Medium, Semi Bold)
 */

// Font Families
export const fontFamilies = {
  display: 'Bauhaus Std, sans-serif',
  body: 'Poppins, sans-serif',
} as const;

// Font Weights
export const fontWeights = {
  regular: 400,
  medium: 500,
  semiBold: 600,
} as const;

// Letter Spacing (all styles use 0)
export const letterSpacing = {
  none: '0',
} as const;

// Line Height (auto for all styles)
export const lineHeight = {
  auto: 'auto',
} as const;

// Paragraph Spacing (0 for all styles)
export const paragraphSpacing = {
  none: 0,
} as const;

// Text Transform
export const textTransform = {
  none: 'none',
  uppercase: 'uppercase',
} as const;

// Web Typography Styles
export const webTypography = {
  display: {
    large: {
      fontFamily: fontFamilies.display,
      fontSize: '44px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
    medium: {
      fontFamily: fontFamilies.display,
      fontSize: '40px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
    small: {
      fontFamily: fontFamilies.display,
      fontSize: '36px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
    xSmall: {
      fontFamily: fontFamilies.display,
      fontSize: '24px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for Section headings',
    },
  },
  heading: {
    xLarge: {
      fontFamily: fontFamilies.body,
      fontSize: '32px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for secondary headings',
    },
    large: {
      fontFamily: fontFamilies.body,
      fontSize: '28px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for secondary headings',
    },
    medium: {
      fontFamily: fontFamilies.body,
      fontSize: '24px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for secondary headings',
    },
    small: {
      fontFamily: fontFamilies.body,
      fontSize: '20px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for secondary headings',
    },
  },
  body: {
    large: {
      fontFamily: fontFamilies.body,
      fontSize: '16px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    largeSemiBold: {
      fontFamily: fontFamilies.body,
      fontSize: '16px',
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    largeAllCaps: {
      fontFamily: fontFamilies.body,
      fontSize: '16px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.uppercase,
      usage: 'To be used for body copy',
    },
    medium: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    mediumSemiBold: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    mediumAllCaps: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.uppercase,
      usage: 'To be used for body copy',
    },
  },
  label: {
    large: {
      fontFamily: fontFamilies.body,
      fontSize: '12px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for captions',
    },
    medium: {
      fontFamily: fontFamilies.body,
      fontSize: '10px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for captions',
    },
    small: {
      fontFamily: fontFamilies.body,
      fontSize: '8px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for captions',
    },
  },
} as const;

// Mobile Typography Styles
export const mobileTypography = {
  display: {
    large: {
      fontFamily: fontFamilies.display,
      fontSize: '28px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
    medium: {
      fontFamily: fontFamilies.display,
      fontSize: '24px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
    small: {
      fontFamily: fontFamilies.display,
      fontSize: '20px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
    xLarge: {
      fontFamily: fontFamilies.display,
      fontSize: '20px',
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for headings',
    },
  },
  heading: {
    xLarge: {
      fontFamily: fontFamilies.body,
      fontSize: '16px',
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for secondary headings',
    },
    large: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for secondary headings',
    },
  },
  body: {
    large: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    largeSemiBold: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    largeAllCaps: {
      fontFamily: fontFamilies.body,
      fontSize: '14px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.uppercase,
      usage: 'To be used for body copy',
    },
    medium: {
      fontFamily: fontFamilies.body,
      fontSize: '12px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    mediumSemiBold: {
      fontFamily: fontFamilies.body,
      fontSize: '12px',
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.none,
      usage: 'To be used for body copy',
    },
    mediumAllCaps: {
      fontFamily: fontFamilies.body,
      fontSize: '12px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      textTransform: textTransform.uppercase,
      usage: 'To be used for body copy',
    },
  },
  label: {
    medium: {
      fontFamily: fontFamilies.body,
      fontSize: '10px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for captions',
    },
    small: {
      fontFamily: fontFamilies.body,
      fontSize: '8px',
      fontWeight: fontWeights.regular,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.auto,
      paragraphSpacing: paragraphSpacing.none,
      usage: 'To be used for captions',
    },
  },
} as const;

// Complete Typography Token Object
export const typography = {
  fontFamily: fontFamilies,
  fontWeight: fontWeights,
  letterSpacing,
  lineHeight,
  paragraphSpacing,
  textTransform,
  web: webTypography,
  mobile: mobileTypography,
} as const;

// Helper function to get typography style
export const getTypographyStyle = (
  platform: 'web' | 'mobile',
  category: 'display' | 'heading' | 'body' | 'label',
  variant: string
) => {
  const platformStyles = platform === 'web' ? webTypography : mobileTypography;
  return (platformStyles[category] as any)[variant];
};

