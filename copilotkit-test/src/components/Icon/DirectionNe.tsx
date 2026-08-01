import React from 'react';
import { Icon, IconProps } from './Icon';

/**
 * Direction-NE (Northeast Arrow) Icon
 * Used in buttons to indicate forward/next action
 */
export const DirectionNe: React.FC<Omit<IconProps, 'children'>> = ({
  size = 24,
  className = '',
  ...props
}) => {
  return (
    <Icon size={size} className={className} {...props}>
      <g id="Vector">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.1597 0.422414C13.8668 0.129521 13.3919 0.129521 13.099 0.422414L0.21967 13.3017C-0.0732231 13.5946 -0.0732234 14.0695 0.21967 14.3624C0.512563 14.6553 0.987437 14.6553 1.28033 14.3624L14.1597 1.48307C14.4525 1.19018 14.4525 0.715307 14.1597 0.422414Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.77172 0.75C1.77172 1.16421 2.1075 1.5 2.52172 1.5L13.0823 1.5V12.0668C13.0823 12.4811 13.4181 12.8168 13.8323 12.8168C14.2465 12.8168 14.5823 12.4811 14.5823 12.0668V0.75C14.5823 0.335787 14.2465 2.56253e-07 13.8323 2.472e-07L2.52172 0C2.1075 -9.05292e-09 1.77172 0.335786 1.77172 0.75Z"
          fill="currentColor"
        />
      </g>
    </Icon>
  );
};

export default DirectionNe;

