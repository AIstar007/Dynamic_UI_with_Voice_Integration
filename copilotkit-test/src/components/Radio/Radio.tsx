import React from 'react';

export interface RadioProps {
  /**
   * Label text for the radio button
   */
  label?: string;
  
  /**
   * Selected state
   */
  checked?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Device variant - affects size
   * - web: 23px × 23px
   * - mobile: 19px × 19px
   */
  device?: 'web' | 'mobile';
  
  /**
   * Change handler
   */
  onChange?: (checked: boolean) => void;
  
  /**
   * Name attribute for grouping radio buttons (required for proper radio behavior)
   */
  name: string;
  
  /**
   * Value attribute (required)
   */
  value: string;
  
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
   * Radio ID for label association (auto-generated if not provided)
   */
  id?: string;
}

export const Radio: React.FC<RadioProps> = ({
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
}) => {
  const radioId = React.useId();
  const finalRadioId = providedId || radioId;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };

  const wrapperClasses = [
    'indigo-radio-wrapper',
    `indigo-radio-wrapper--${device}`,
    disabled && 'indigo-radio-wrapper--disabled',
    className,
  ].filter(Boolean).join(' ');

  const radioClasses = [
    'indigo-radio',
    `indigo-radio--${device}`,
    checked && 'indigo-radio--checked',
    disabled && 'indigo-radio--disabled',
  ].filter(Boolean).join(' ');
  
  // Accessibility warning in development
  if (process.env.NODE_ENV === 'development') {
    if (!label && !ariaLabel) {
      console.warn(
        'Radio: Please provide either label or aria-label for accessibility'
      );
    }
    if (!name) {
      console.warn(
        'Radio: Please provide a name prop to group radio buttons together'
      );
    }
  }

  return (
    <label className={wrapperClasses}>
      <input
        id={finalRadioId}
        type="radio"
        className="indigo-radio__input"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        name={name}
        value={value}
        required={required}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      />
      <span className={radioClasses} aria-hidden="true">
        {checked && <span className="indigo-radio__dot" />}
      </span>
      {label && <span className="indigo-radio__label">{label}</span>}
    </label>
  );
};

export default Radio;

