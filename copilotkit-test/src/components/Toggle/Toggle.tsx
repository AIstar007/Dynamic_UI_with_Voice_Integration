import React from 'react';

export interface ToggleProps {
  /**
   * Label text for the toggle
   */
  label?: string;
  
  /**
   * Toggle state (on/off)
   */
  checked?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Toggle size
   * - small: 28×12px
   * - medium: 36×16px
   * - large: 40×20px
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;
  
  /**
   * Name attribute for form submission
   */
  name?: string;
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * ARIA label for accessibility (required if no label)
   */
  'aria-label'?: string;
  
  /**
   * ARIA described by
   */
  'aria-describedby'?: string;
  
  /**
   * Required field
   */
  required?: boolean;
  
  /**
   * Toggle ID for label association (auto-generated if not provided)
   */
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked = false,
  disabled = false,
  size = 'medium',
  onChange,
  name,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  required = false,
  id: providedId,
}) => {
  const toggleId = React.useId();
  const finalToggleId = providedId || toggleId;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  const wrapperClasses = [
    'indigo-toggle-wrapper',
    `indigo-toggle-wrapper--${size}`,
    disabled && 'indigo-toggle-wrapper--disabled',
    className,
  ].filter(Boolean).join(' ');

  const toggleClasses = [
    'indigo-toggle',
    `indigo-toggle--${size}`,
    checked && 'indigo-toggle--checked',
    disabled && 'indigo-toggle--disabled',
  ].filter(Boolean).join(' ');
  
  // Accessibility warning in development
  if (process.env.NODE_ENV === 'development') {
    if (!label && !ariaLabel) {
      console.warn(
        'Toggle: Please provide either label or aria-label for accessibility'
      );
    }
  }

  return (
    <label className={wrapperClasses}>
      <input
        id={finalToggleId}
        type="checkbox"
        className="indigo-toggle__input"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        name={name}
        required={required}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      />
      <span className={toggleClasses} aria-hidden="true">
        <span className="indigo-toggle__track" />
        <span className="indigo-toggle__thumb" />
      </span>
      {label && <span className="indigo-toggle__label">{label}</span>}
    </label>
  );
};

export default Toggle;

