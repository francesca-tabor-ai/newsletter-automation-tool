# Components Directory

This directory contains reusable React components for the AutoNews application.

## Structure

```
components/
├── auth/                 # Authentication-related components
│   └── SignOutButton.tsx
├── ui/                   # (Future) Reusable UI components
├── layout/               # (Future) Layout components
└── index.ts              # Component exports
```

## Usage

Import components from the index file:

```typescript
import { SignOutButton } from '@/components'
```

Or import directly from the component file:

```typescript
import SignOutButton from '@/components/auth/SignOutButton'
```

## Adding New Components

When creating new components:

1. Create a new file in the appropriate subdirectory
2. Export the component as default
3. Add a named export in `index.ts`
4. Use TypeScript for type safety
5. Follow the existing naming conventions

### Example

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button onClick={onClick} className={/* styles */}>
      {children}
    </button>
  )
}

// components/index.ts
export { default as Button } from './ui/Button'
```

