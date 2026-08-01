import React from 'react';
import { Icon, IconProps } from './Icon';

/**
 * User Icon - Default avatar icon
 * Used in avatars when no image is provided
 */
export const User: React.FC<Omit<IconProps, 'children'>> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <Icon size={size} className={className} {...props}>
      <g id="User">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2ZM6 6C6 2.68629 8.68629 0 12 0C15.3137 0 18 2.68629 18 6C18 9.31371 15.3137 12 12 12C8.68629 12 6 9.31371 6 6Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 14C7.58172 14 4 17.5817 4 22V24H20V22C20 17.5817 16.4183 14 12 14ZM2 22C2 16.4772 6.47715 12 12 12C17.5228 12 22 16.4772 22 22V24C22 25.1046 21.1046 26 20 26H4C2.89543 26 2 25.1046 2 24V22Z"
          fill="currentColor"
        />
      </g>
    </Icon>
  );
};

export default User;

