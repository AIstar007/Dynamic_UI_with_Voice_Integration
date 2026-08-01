import React from 'react';
// CSS is imported globally in main.tsx via index.css

export type ButtonSize = 'large' | 'medium' | 'small' | 'mini';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonState = 'default' | 'hover' | 'inactive';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize;
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Button content (required for accessibility)
   */
  children: React.ReactNode;
  /**
   * Icon to display on the left side of the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side of the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * ARIA label for accessibility (required if button has no text content)
   */
  'aria-label'?: string;
  /**
   * Indicates whether the button controls an expandable element
   */
  'aria-expanded'?: boolean;
  /**
   * Indicates the element that is controlled by the button
   */
  'aria-controls'?: string;
  /**
   * Loading state - shows loading indicator
   */
  loading?: boolean;
  /**
   * Makes button full width
   */
  fullWidth?: boolean;
}

/**
 * Button component following IndiGo Premium Design System
 * 
 * Supports 4 sizes (large, medium, small, mini) and 3 variants (primary, secondary, ghost)
 * with proper state management (default, hover, inactive/disabled)
 * 
 * Icons can be added on the left and/or right side of the button text
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="large">Search Flights</Button>
 * <Button variant="secondary" leftIcon={<DirectionNe />}>Continue</Button>
 * <Button variant="ghost" disabled>Unavailable</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  size = 'medium',
  variant = 'primary',
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  loading = false,
  fullWidth = false,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClassName = 'indigo-button';
  const sizeClassName = `${baseClassName}--${size}`;
  const variantClassName = `${baseClassName}--${variant}`;
  const stateClassName = disabled || loading ? `${baseClassName}--inactive` : '';
  const fullWidthClassName = fullWidth ? `${baseClassName}--full-width` : '';
  
  const combinedClassName = [
    baseClassName,
    sizeClassName,
    variantClassName,
    stateClassName,
    fullWidthClassName,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Accessibility: Warn if no accessible label
  if (process.env.NODE_ENV === 'development') {
    if (!children && !ariaLabel) {
      console.warn(
        'Button: Please provide either children or aria-label for accessibility'
      );
    }
  }

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="indigo-button__loader" aria-hidden="true" />}
      {!loading && leftIcon && (
        <span className="indigo-button__icon indigo-button__icon--left" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children && <span className="indigo-button__text">{children}</span>}
      {!loading && rightIcon && (
        <span className="indigo-button__icon indigo-button__icon--right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;

