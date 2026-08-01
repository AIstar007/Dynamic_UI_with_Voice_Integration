# Button Component

Flexible button component with multiple variants, sizes, and states for IndiGo Premium applications.

## Features

- 🎨 **3 Variants**: Primary, Secondary, Ghost
- 📏 **4 Sizes**: Large (56px), Medium (40px), Small (36px), Mini (32px)
- 🔄 **Multiple States**: Default, Hover, Active, Disabled, Loading
- 🎯 **Icon Support**: Left and/or right icons
- ♿ **Accessible**: WCAG 2.1 AA compliant
- ⌨️ **Keyboard**: Full keyboard navigation support

## Installation

```bash
npm install @indigo/design-system
```

## Usage

### Basic Usage

```tsx
import { Button } from '@indigo/design-system';

function Example() {
  return (
    <Button variant="primary" size="large">
      Search Flights
    </Button>
  );
}
```

### With Icons

```tsx
import { Button } from '@indigo/design-system';
import { DirectionNe } from '@indigo/design-system';

function Example() {
  return (
    <>
      {/* Right icon */}
      <Button variant="primary" rightIcon={<DirectionNe />}>
        Continue
      </Button>
      
      {/* Left icon */}
      <Button variant="secondary" leftIcon={<DirectionNe />}>
        Back
      </Button>
      
      {/* Both icons */}
      <Button 
        leftIcon={<Icon1 />}
        rightIcon={<Icon2 />}
      >
        Action
      </Button>
    </>
  );
}
```

### Loading State

```tsx
<Button loading>
  Processing...
</Button>
```

### Full Width

```tsx
<Button fullWidth>
  Full Width Button
</Button>
```

### Disabled State

```tsx
<Button disabled>
  Unavailable
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style variant |
| `size` | `'large' \| 'medium' \| 'small' \| 'mini'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state with spinner |
| `fullWidth` | `boolean` | `false` | Make button full width |
| `leftIcon` | `ReactNode` | - | Icon on the left side |
| `rightIcon` | `ReactNode` | - | Icon on the right side |
| `children` | `ReactNode` | - | Button content (required) |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `aria-label` | `string` | - | Accessibility label |
| `className` | `string` | - | Additional CSS class |

Extends all standard HTML button attributes.

## Variants

### Primary
Solid gold background for primary actions (CTAs):

```tsx
<Button variant="primary">Book Now</Button>
```

### Secondary
Outlined button for secondary actions:

```tsx
<Button variant="secondary">Learn More</Button>
```

### Ghost
Text-only button for tertiary actions:

```tsx
<Button variant="ghost">Cancel</Button>
```

## Sizes

```tsx
<Button size="large">Large (56px)</Button>
<Button size="medium">Medium (40px)</Button>
<Button size="small">Small (36px)</Button>
<Button size="mini">Mini (32px)</Button>
```

## Examples

### Form Submit Button

```tsx
<form onSubmit={handleSubmit}>
  <Button 
    type="submit"
    variant="primary"
    size="large"
    fullWidth
  >
    Submit Booking
  </Button>
</form>
```

### Navigation Button

```tsx
<Button 
  variant="secondary"
  rightIcon={<DirectionNe />}
  onClick={() => router.push('/next-page')}
>
  Continue
</Button>
```

### Loading State

```tsx
function BookingButton() {
  const [loading, setLoading] = useState(false);
  
  const handleBook = async () => {
    setLoading(true);
    await bookFlight();
    setLoading(false);
  };
  
  return (
    <Button loading={loading} onClick={handleBook}>
      {loading ? 'Booking...' : 'Book Flight'}
    </Button>
  );
}
```

## Accessibility

### Keyboard Support

- **Enter/Space**: Activate button
- **Tab**: Move focus to/from button

### Screen Reader

- Uses semantic `<button>` element
- Supports `aria-label` for icon-only buttons
- Announces loading state with `aria-busy`
- Announces disabled state with `aria-disabled`

### Best Practices

```tsx
// ✅ Good: Text provides context
<Button>Save Changes</Button>

// ✅ Good: Icon-only with aria-label
<Button aria-label="Close dialog">×</Button>

// ❌ Bad: Icon-only without label
<Button><CloseIcon /></Button>

// ✅ Good: Disabled state
<Button disabled>Processing...</Button>

// ❌ Bad: Using onClick to disable
<Button onClick={isDisabled ? undefined : handleClick}>
```

## Design Tokens

The button component uses the following design tokens:

**Colors**:
- Primary: `--color-base-gold` (#A97D0E)
- Hover: `--color-base-gold-hover` (#7F5E0B)
- Disabled: `--color-base-light-grey` (#7A85A0)
- Text: `--color-text-primary` (#EFEFEF)

**Spacing**:
- Large: 56px height, 36px horizontal padding
- Medium: 40px height, 36px horizontal padding
- Small: 36px height, 20px horizontal padding
- Mini: 32px height, 12px horizontal padding

**Typography**:
- Font: Poppins Semi Bold (600)
- Large/Medium: 12px
- Small/Mini: 10px

## Related Components

- [Input](../Input/README.md) - Text input with validation
- [Icon](../Icon/README.md) - Icon system

## Support

For issues or questions, please contact the Design System team or open an issue on GitHub.

