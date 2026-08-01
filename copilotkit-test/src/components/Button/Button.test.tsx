import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('indigo-button--medium');
      expect(button).toHaveClass('indigo-button--primary');
    });
  });

  describe('Sizes', () => {
    it('applies large size class', () => {
      render(<Button size="large">Large Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--large');
    });

    it('applies medium size class', () => {
      render(<Button size="medium">Medium Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--medium');
    });

    it('applies small size class', () => {
      render(<Button size="small">Small Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--small');
    });

    it('applies mini size class', () => {
      render(<Button size="mini">Mini Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--mini');
    });
  });

  describe('Variants', () => {
    it('applies primary variant class', () => {
      render(<Button variant="primary">Primary Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--primary');
    });

    it('applies secondary variant class', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--secondary');
    });

    it('applies ghost variant class', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('indigo-button--ghost');
    });
  });

  describe('Disabled State', () => {
    it('applies inactive class when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('indigo-button--inactive');
      expect(button).toBeDisabled();
    });

    it('prevents click when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes through HTML button attributes', () => {
      render(
        <Button type="submit" aria-label="Submit form">
          Submit
        </Button>
      );
      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Combinations', () => {
    it('renders large primary button correctly', () => {
      render(
        <Button size="large" variant="primary">
          Large Primary
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('indigo-button--large');
      expect(button).toHaveClass('indigo-button--primary');
    });

    it('renders small secondary disabled button correctly', () => {
      render(
        <Button size="small" variant="secondary" disabled>
          Small Secondary Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('indigo-button--small');
      expect(button).toHaveClass('indigo-button--secondary');
      expect(button).toHaveClass('indigo-button--inactive');
      expect(button).toBeDisabled();
    });
  });
});

