import React from 'react';
import { Icon, IconProps } from './Icon';

/**
 * Chevron Down Icon
 * Used in inputs for selection dropdowns
 */
export const ChevronDown: React.FC<Omit<IconProps, 'children'>> = ({
  size = 20,
  className = '',
  ...props
}) => {
  return (
    <Icon size={size} className={className} viewBox="0 0 20 20" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z"
        fill="currentColor"
      />
    </Icon>
  );
};

export default ChevronDown;

