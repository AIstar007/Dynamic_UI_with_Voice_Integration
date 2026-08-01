import React from 'react';

export interface CheckboxProps {
  /**
   * Label text for the checkbox
   */
  label?: string;
  
  /**
   * Checked state
   */
  checked?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Device variant - affects size
   * - web: 24×24px visual (32×32px hit area)
   * - mobile: 20×20px visual (24×24px hit area)
   */
  device?: 'web' | 'mobile';
  
  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;
  
  /**
   * Name attribute for form submission
   */
  name?: string;
  
  /**
   * Value attribute
   */
  value?: string;
  
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
   * Checkbox ID for label association (auto-generated if not provided)
   */
  id?: string;
  
  /**
   * Indeterminate state (for "select all" checkboxes)
   */
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  disabled = false,
  device = 'web',
  onChange,
  name,
  value,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  required = false,
  id: providedId,
  indeterminate = false,
}) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  const checkboxId = React.useId();
  const finalCheckboxId = providedId || checkboxId;
  
  // Set indeterminate state via ref
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  const wrapperClasses = [
    'indigo-checkbox-wrapper',
    `indigo-checkbox-wrapper--${device}`,
    disabled && 'indigo-checkbox-wrapper--disabled',
    className,
  ].filter(Boolean).join(' ');

  const checkboxClasses = [
    'indigo-checkbox',
    `indigo-checkbox--${device}`,
    checked && 'indigo-checkbox--checked',
    disabled && 'indigo-checkbox--disabled',
    indeterminate && 'indigo-checkbox--indeterminate',
  ].filter(Boolean).join(' ');
  
  // Accessibility warning in development
  if (process.env.NODE_ENV === 'development') {
    if (!label && !ariaLabel) {
      console.warn(
        'Checkbox: Please provide either label or aria-label for accessibility'
      );
    }
  }

  return (
    <label className={wrapperClasses}>
      <input
        ref={checkboxRef}
        id={finalCheckboxId}
        type="checkbox"
        className="indigo-checkbox__input"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        name={name}
        value={value}
        required={required}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-checked={indeterminate ? 'mixed' : checked}
      />
      <span className={checkboxClasses} aria-hidden="true">
        {checked && !indeterminate && (
          <svg
            className="indigo-checkbox__icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3334 4L6.00002 11.3333L2.66669 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {indeterminate && (
          <svg
            className="indigo-checkbox__icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 8H12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      {label && <span className="indigo-checkbox__label">{label}</span>}
    </label>
  );
};

export default Checkbox;

