import React from 'react';
// CSS is imported globally in main.tsx via index.css

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Size of the icon
   * @default 24
   */
  size?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Icon content (SVG paths/elements)
   */
  children: React.ReactNode;
}

/**
 * Base Icon component wrapper
 * Ensures icons inherit color from parent and maintain proper sizing
 */
export const Icon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  children,
  ...props
}) => {
  return (
    <svg
      className={`indigo-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
};

export default Icon;

