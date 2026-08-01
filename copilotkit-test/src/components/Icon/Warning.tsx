import React from 'react';
import { Icon, IconProps } from './Icon';

/**
 * Warning Icon
 * Used in inputs to indicate error state
 */
export const Warning: React.FC<Omit<IconProps, 'children'>> = ({
  size = 16,
  className = '',
  ...props
}) => {
  return (
    <Icon size={size} className={className} viewBox="0 0 16 16" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM7 4a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0V4Zm1 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        fill="currentColor"
      />
    </Icon>
  );
};

export default Warning;

