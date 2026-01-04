# Heroicons Fix & Usage Guide

## ✅ Fixed

Heroicons v2 is now installed: `@heroicons/react@^2.2.0`

---

## 📦 Installation

If you ever need to reinstall:

```bash
npm install @heroicons/react@latest
```

---

## 🎨 Usage

### **Import Icons**

```tsx
// Outline icons (most common)
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon 
} from '@heroicons/react/24/outline'

// Solid icons (filled)
import { 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/solid'
```

### **Using in Components**

```tsx
// Simple icon
<CheckCircleIcon className="h-5 w-5 text-coral-500" />

// Icon in button
<button className="btn-primary">
  <PlusIcon className="h-5 w-5 mr-2" />
  Add Item
</button>

// Icon with different sizes
<XMarkIcon className="h-4 w-4" />  // Small
<XMarkIcon className="h-5 w-5" />  // Medium (default)
<XMarkIcon className="h-6 w-6" />  // Large
<XMarkIcon className="h-8 w-8" />  // Extra large
```

---

## 🎯 Common Icons Used

### **Actions**
- `PlusIcon` - Add/Create
- `TrashIcon` - Delete
- `PencilIcon` - Edit
- `ArrowUpTrayIcon` - Upload/Import
- `ArrowDownTrayIcon` - Download/Export

### **Navigation**
- `ChevronLeftIcon` - Back
- `ChevronRightIcon` - Forward
- `ChevronDownIcon` - Dropdown
- `ArrowLeftIcon` - Return
- `Bars3Icon` - Menu (hamburger)

### **Status**
- `CheckCircleIcon` - Success
- `XCircleIcon` - Error
- `ExclamationCircleIcon` - Warning
- `InformationCircleIcon` - Info

### **UI Elements**
- `XMarkIcon` - Close
- `MagnifyingGlassIcon` - Search
- `Cog6ToothIcon` - Settings
- `BellIcon` - Notifications
- `UserIcon` - User/Profile

### **Content**
- `NewspaperIcon` - Newsletter
- `RssIcon` - RSS Feed
- `EnvelopeIcon` - Email
- `DocumentIcon` - Document
- `FolderIcon` - Folder

---

## 🔧 Integration with Design System

### **Icon Colors**

```tsx
// Primary accent (coral)
<CheckCircleIcon className="h-5 w-5 text-coral-500" />

// Headings (slate dark)
<PlusIcon className="h-5 w-5 text-slate-600" />

// Body text (slate medium)
<XMarkIcon className="h-5 w-5 text-slate-500" />

// Muted (slate light)
<InformationCircleIcon className="h-5 w-5 text-slate-400" />
```

### **Icon in Buttons**

```tsx
// Primary button with icon
<button className="btn-primary">
  <PlusIcon className="h-5 w-5 mr-2" />
  Create Newsletter
</button>

// Secondary button with icon
<button className="btn-secondary">
  <TrashIcon className="h-5 w-5 mr-2" />
  Delete
</button>

// Icon-only button
<button className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600">
  <XMarkIcon className="h-5 w-5" />
</button>
```

### **Icon in Cards**

```tsx
<div className="card">
  <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center mb-4">
    <RssIcon className="h-6 w-6 text-coral-500" />
  </div>
  <h3 className="text-h4 text-slate-600">RSS Feeds</h3>
  <p className="text-body text-slate-500">Connect unlimited sources</p>
</div>
```

---

## 🐛 Troubleshooting

### **Error: Module not found**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Icons not showing**

1. Check import path: `@heroicons/react/24/outline`
2. Verify size classes: `h-5 w-5`
3. Check if component has `'use client'` (for client components)

### **TypeScript errors**

Make sure you're using TypeScript-compatible imports:

```tsx
import type { FC } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const MyComponent: FC = () => {
  return <XMarkIcon className="h-5 w-5" />
}
```

---

## 📚 Resources

- **Official Docs**: https://heroicons.com/
- **Browse Icons**: https://heroicons.com/ (visual search)
- **GitHub**: https://github.com/tailwindlabs/heroicons

---

## ✅ Already Using Heroicons

These components already use Heroicons:

- `ToastProvider.tsx` - XMark, CheckCircle, ExclamationCircle, InformationCircle
- `OnboardingChecklist.tsx` - CheckCircle, XMark
- `EmptyState.tsx` - (accepts any icon as prop)

---

**Heroicons is now ready to use!** 🎨✨

