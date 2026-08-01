import React from 'react';
import { BookActive } from '../Icon';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarType = 'icon' | 'text' | 'image';

export interface AvatarProps {
  /**
   * Size of the avatar
   * - xs: 16×16px
   * - sm: 24×24px
   * - md: 32×32px
   * - lg: 40×40px
   * - xl: 48×48px
   * @default 'md'
   */
  size?: AvatarSize;
  
  /**
   * Type of avatar
   * - icon: Display icon (default user icon)
   * - text: Display initials
   * - image: Display profile photo
   * @default 'icon'
   */
  type?: AvatarType;
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Text to display (for text type)
   * Automatically converts to uppercase for md/lg/xl
   * Maximum 2 characters recommended
   */
  text?: string;
  
  /**
   * Image source (for image type)
   */
  src?: string;
  
  /**
   * Alt text for image
   */
  alt?: string;
  
  /**
   * Custom icon (for icon type)
   */
  icon?: React.ReactNode;
  
  /**
   * Click handler
   */
  onClick?: () => void;
  
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Avatar component for displaying user profile pictures, initials, or icons
 * 
 * Supports 5 sizes (xs, sm, md, lg, xl) and 3 types (icon, text, image)
 * with disabled state support
 * 
 * @example
 * ```tsx
 * // Icon avatar (default)
 * <Avatar size="md" />
 * 
 * // Text avatar with initials
 * <Avatar size="lg" type="text" text="JD" />
 * 
 * // Image avatar
 * <Avatar 
 *   size="xl" 
 *   type="image" 
 *   src="/profile.jpg"
 *   alt="John Doe"
 * />
 * 
 * // Disabled state
 * <Avatar size="md" disabled />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  type = 'icon',
  disabled = false,
  text = 'SS',
  src,
  alt,
  icon,
  onClick,
  'aria-label': ariaLabel,
  className = '',
}) => {
  const isInteractive = Boolean(onClick) && !disabled;
  
  // Auto-uppercase for medium and larger sizes when displaying text
  const displayText = type === 'text' && (size === 'md' || size === 'lg' || size === 'xl')
    ? text.toUpperCase()
    : text;

  const baseClasses = [
    'indigo-avatar',
    `indigo-avatar--${size}`,
    `indigo-avatar--${type}`,
    disabled && 'indigo-avatar--disabled',
    isInteractive && 'indigo-avatar--interactive',
    className,
  ].filter(Boolean).join(' ');
  
  // Development warnings
  if (process.env.NODE_ENV === 'development') {
    if (type === 'text' && !text) {
      console.warn('Avatar: Please provide text prop when using type="text"');
    }
    if (type === 'image' && !src) {
      console.warn('Avatar: Please provide src prop when using type="image"');
    }
    if (type === 'image' && !alt && !ariaLabel) {
      console.warn('Avatar: Please provide alt or aria-label for image avatars');
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'icon':
        const iconColor = disabled ? '#7A85A0' : '#EFEFEF';
        return (
          <span className="indigo-avatar__icon" aria-hidden="true">
            {icon || <BookActive color={iconColor} />}
          </span>
        );
      
      case 'text':
        return (
          <span className="indigo-avatar__text" aria-hidden="true">
            {displayText}
          </span>
        );
      
      case 'image':
        return (
          <img
            src={src}
            alt={alt || ''}
            className="indigo-avatar__image"
          />
        );
      
      default:
        return null;
    }
  };

  const Component = isInteractive ? 'button' : 'div';
  const ariaRole = type === 'image' ? undefined : 'img';

  return (
    <Component
      className={baseClasses}
      onClick={isInteractive ? onClick : undefined}
      disabled={disabled}
      aria-label={ariaLabel || (type === 'text' ? `Avatar with initials ${text}` : 'User avatar')}
      role={ariaRole}
      {...(Component === 'button' ? { type: 'button' } : {})}
    >
      {renderContent()}
    </Component>
  );
};

export default Avatar;

