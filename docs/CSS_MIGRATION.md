# CSS Migration Script
# Run this to update color classes from old to new design system

This document helps migrate from old blue/gray colors to the new coral/slate design system.

## Color Mapping

### Primary Colors
```
OLD → NEW
bg-blue-600 → bg-coral-500
bg-blue-700 → bg-coral-600
bg-blue-50 → bg-coral-50
bg-blue-100 → bg-coral-100

hover:bg-blue-700 → hover:bg-coral-600
text-blue-600 → text-coral-500
border-blue-500 → border-coral-500
```

### Text Colors
```
OLD → NEW
text-gray-900 → text-slate-600
text-gray-800 → text-slate-600
text-gray-700 → text-slate-500
text-gray-600 → text-slate-500
text-gray-500 → text-slate-400
text-gray-400 → text-slate-300
```

### Background Colors
```
OLD → NEW
bg-gray-50 → bg-background
bg-gray-100 → bg-slate-50
bg-white → bg-surface
```

### Border Colors
```
OLD → NEW
border-gray-200 → border-slate-100
border-gray-300 → border-slate-100
```

## Component Updates

### Buttons
```tsx
// Old
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">

// New
<button className="btn-primary">
// or
<button className="h-[48px] px-4 rounded-lg bg-coral-500 hover:bg-coral-600 text-white">
```

### Cards
```tsx
// Old
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">

// New
<div className="card card-hover p-6">
// or
<div className="bg-surface p-6 rounded-xl shadow-card border border-slate-100">
```

### Inputs
```tsx
// Old
<input className="border-gray-300 focus:border-blue-500 rounded-md">

// New
<input className="input">
// or
<input className="h-[44px] px-3 border-slate-100 focus:border-coral-500 rounded-lg">
```

## Find & Replace Patterns

Use your editor's find & replace (regex mode):

1. **Blue to Coral**
   - Find: `bg-blue-600`
   - Replace: `bg-coral-500`

2. **Gray to Slate (headings)**
   - Find: `text-gray-900`
   - Replace: `text-slate-600`

3. **Gray to Slate (body)**
   - Find: `text-gray-600`
   - Replace: `text-slate-500`

4. **Borders**
   - Find: `border-gray-200`
   - Replace: `border-slate-100`

5. **Backgrounds**
   - Find: `bg-gray-50`
   - Replace: `bg-background`

## Manual Review Needed

Some components need manual review:

1. **Status badges** (green/red/yellow are fine)
2. **Error states** (keep red)
3. **Success states** (keep green)
4. **Warning states** (keep yellow/orange)

## Testing Checklist

After updates:
- [ ] Buttons have correct coral color
- [ ] Text is readable (slate colors)
- [ ] Cards have rounded-xl corners
- [ ] Inputs have proper focus states
- [ ] Hover states work
- [ ] Mobile responsive
- [ ] Dark backgrounds have light text
- [ ] Light backgrounds have dark text

