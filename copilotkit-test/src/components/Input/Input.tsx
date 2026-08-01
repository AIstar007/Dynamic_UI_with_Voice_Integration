import React, { useState } from 'react';
import { Warning } from '../Icon';
// CSS is imported globally in main.tsx via index.css

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Label text for the input (required for accessibility)
   */
  label: string;
  /**
   * Helper text to display below input
   */
  helperText?: string;
  /**
   * Error message (replaces helper text if provided)
   */
  error?: string;
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
  /**
   * Mobile sizing variant
   * @default false
   */
  mobile?: boolean;
  /**
   * Left selection component (e.g. country code dropdown)
   */
  leftSelection?: React.ReactNode;
  /**
   * Right selection component
   */
  rightSelection?: React.ReactNode;
  /**
   * Container className
   */
  containerClassName?: string;
  /**
   * Show character count for maxLength inputs
   */
  showCharacterCount?: boolean;
  /**
   * Full width input
   */
  fullWidth?: boolean;
  /**
   * Input ID for label association (auto-generated if not provided)
   */
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  mobile = false,
  leftSelection,
  rightSelection,
  disabled,
  className = '',
  containerClassName = '',
  value,
  onFocus,
  onBlur,
  onChange,
  showCharacterCount = false,
  fullWidth = true,
  id: providedId,
  required,
  maxLength,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  // Generate unique ID for input-label association
  const inputId = React.useId();
  const finalInputId = providedId || inputId;
  const errorId = `${finalInputId}-error`;
  const helperId = `${finalInputId}-helper`;
  
  // Check if input is filled (either controlled or uncontrolled)
  const isFilled = value !== '' && value !== undefined && value !== null || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Check if input has value when blurring
    const inputHasValue = e.target.value !== '';
    setHasValue(inputHasValue);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputHasValue = e.target.value !== '';
    setHasValue(inputHasValue);
    onChange?.(e);
  };

  const wrapperClasses = [
    'indigo-input-wrapper',
    mobile ? 'indigo-input-wrapper--mobile' : '',
    disabled ? 'indigo-input-wrapper--disabled' : '',
    error ? 'indigo-input-wrapper--error' : '',
    isFocused ? 'indigo-input-wrapper--focused' : '',
    isFilled ? 'indigo-input-wrapper--filled' : '',
    leftIcon ? 'indigo-input-wrapper--has-left-icon' : '',
    leftSelection ? 'indigo-input-wrapper--has-left-selection' : '',
  ].filter(Boolean).join(' ');
  
  const containerClasses = [
    'indigo-input-container',
    disabled ? 'indigo-input-container--disabled' : '',
    fullWidth ? 'indigo-input-container--full-width' : '',
    containerClassName,
  ].filter(Boolean).join(' ');
  
  // Calculate character count for display
  const characterCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className={containerClasses}>
      <div className={wrapperClasses}>
        {/* Floating Label */}
        <label htmlFor={finalInputId} className="indigo-input-label">
          {label}
          {required && <span className="indigo-input-label__required" aria-label="required"> *</span>}
        </label>

        {/* Left Selection */}
        {leftSelection && (
          <div className="indigo-input-selection indigo-input-selection--left">
            {leftSelection}
          </div>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <div className="indigo-input-icon indigo-input-icon--left">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          id={finalInputId}
          className={`indigo-input ${className}`}
          disabled={disabled}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          required={required}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-required={required}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="indigo-input-icon indigo-input-icon--right">
            {rightIcon}
          </div>
        )}

        {/* Right Selection */}
        {rightSelection && (
          <div className="indigo-input-selection indigo-input-selection--right">
            {rightSelection}
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div 
          id={error ? errorId : helperId}
          className={`indigo-input-message ${error ? 'indigo-input-message--error' : ''}`}
          role={error ? 'alert' : undefined}
        >
          {error && <Warning size={16} className="indigo-input-message-icon" />}
          <span>{error || helperText}</span>
        </div>
      )}
      
      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div className="indigo-input-character-count" aria-live="polite">
          {characterCount} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default Input;

