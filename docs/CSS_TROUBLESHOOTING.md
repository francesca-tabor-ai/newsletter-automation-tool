# CSS Setup & Troubleshooting Guide

## ✅ Current Setup

### **Files Configured**

1. **`tailwind.config.js`** - Design system tokens
2. **`postcss.config.js`** - PostCSS with Tailwind & Autoprefixer
3. **`app/globals.css`** - Global styles with Tailwind directives
4. **`app/layout.tsx`** - Imports globals.css

---

## 🔍 **Troubleshooting CSS Issues**

### **Step 1: Confirm CSS is Loading**

Open DevTools → Network → Filter "css"

✅ **Should see**: `globals.css` with Status 200  
❌ **If missing**: CSS not bundled (go to Step 2)

**Check Console for errors**:
- "Failed to load resource … .css (404)"
- MIME type errors
- Tailwind warnings

---

### **Step 2: Verify Import Chain**

**Next.js App Router** (our setup):

```tsx
// app/layout.tsx
import '@/app/globals.css' // ✅ Already configured

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**globals.css must include**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

✅ **Already configured** in `app/globals.css`

---

### **Step 3: Verify Tailwind Config**

**tailwind.config.js must include**:

```js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // ... other paths
  ],
  // ... theme config
}
```

✅ **Already configured** with AutoNews design system

---

### **Step 4: Check PostCSS Config**

**postcss.config.js required**:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

✅ **Now configured**

---

### **Step 5: Verify Class Names in Components**

**Example - Button**:

```tsx
// ❌ Wrong - old blue classes
<button className="bg-blue-600 text-white">

// ✅ Correct - new coral classes
<button className="bg-coral-500 text-white">
```

**Check in DevTools**:
- Inspect element → Styles panel
- Should see rules from Tailwind
- Should see custom colors applied

---

### **Step 6: Check CSS Order**

**Load order matters**:

```tsx
// app/layout.tsx
import '@/app/globals.css' // ← First (includes Tailwind)
// Other imports below
```

**If using CSS Modules**:
- `something.module.css` → scoped styles
- `globals.css` → global styles

We use **global styles** for design system.

---

### **Step 7: Hard Refresh**

1. **Development**: Cmd/Ctrl + Shift + R
2. **Clear browser cache**
3. **Restart dev server**: `npm run dev`

---

## 🎨 **Using the Design System**

### **Color Classes**

```tsx
// Primary accent
className="bg-coral-500"      // Background
className="text-coral-500"    // Text
className="border-coral-500"  // Border

// Headings & text
className="text-slate-600"    // Headings
className="text-slate-500"    // Body text
className="text-slate-400"    // Muted text

// Backgrounds & borders
className="bg-background"     // Page background
className="bg-surface"        // Card background
className="border-slate-100"  // Light borders
```

### **Typography**

```tsx
<h1 className="text-h1">Big heading</h1>
<h2 className="text-h2">Section heading</h2>
<h3 className="text-h3">Subsection</h3>
<p className="text-body">Body text</p>
<span className="text-small">Small text</span>
```

### **Components**

```tsx
// Button
<button className="btn-primary">Click me</button>
<button className="btn-secondary">Cancel</button>

// Card
<div className="card card-hover">
  Content
</div>

// Input
<input type="text" className="input" />
```

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: Styles not applying**

**Symptom**: Components look unstyled

**Fix**:
1. Check Network tab for CSS file
2. Hard refresh (Cmd+Shift+R)
3. Restart dev server
4. Clear `.next` cache: `rm -rf .next`

### **Issue 2: Custom colors not working**

**Symptom**: `bg-coral-500` doesn't work

**Check**:
1. Tailwind config includes extended colors
2. PostCSS config exists
3. Dev server restarted after config change

**Fix**:
```bash
rm -rf .next
npm run dev
```

### **Issue 3: Typography classes missing**

**Symptom**: `text-h1` doesn't exist

**Check**: `tailwind.config.js` has `fontSize` in `extend`

**Already configured** ✅

### **Issue 4: Shadows not showing**

**Symptom**: `shadow-card` has no effect

**Check**: `tailwind.config.js` has `boxShadow` in `extend`

**Already configured** ✅

### **Issue 5: CSS works locally but not in production**

**Fix**:
1. Ensure all files committed to git
2. Rebuild: `npm run build`
3. Check build output for CSS errors
4. Verify Vercel environment

---

## 📋 **Quick Checklist**

Before reporting CSS issues:

- [ ] `app/globals.css` exists with Tailwind directives
- [ ] `app/layout.tsx` imports `globals.css`
- [ ] `tailwind.config.js` exists with correct paths
- [ ] `postcss.config.js` exists
- [ ] Dev server restarted after config changes
- [ ] Hard refresh in browser (Cmd+Shift+R)
- [ ] Console has no CSS errors
- [ ] Network tab shows CSS loading (Status 200)
- [ ] Using correct class names (coral-500, not blue-600)

---

## 🔧 **If CSS Still Not Working**

### **Nuclear Option**

```bash
# 1. Clear everything
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 2. Fresh install
npm install

# 3. Start dev server
npm run dev

# 4. Hard refresh browser
Cmd/Ctrl + Shift + R
```

### **Verify Installation**

```bash
# Check Tailwind is installed
npm list tailwindcss

# Check PostCSS is installed
npm list postcss autoprefixer
```

### **Check File Paths**

All these files should exist:

```
newsletter-automation-tool/
├── app/
│   ├── globals.css          ✅
│   └── layout.tsx            ✅
├── tailwind.config.js        ✅
├── postcss.config.js         ✅
└── package.json              ✅
```

---

## 📚 **Reference**

### **Tailwind Directives**

```css
@tailwind base;       /* Preflight CSS reset */
@tailwind components; /* Component classes */
@tailwind utilities;  /* Utility classes */
```

### **Layer System**

```css
@layer base {
  /* Base styles (applied to raw HTML) */
  body { ... }
}

@layer components {
  /* Reusable component classes */
  .btn-primary { ... }
}

@layer utilities {
  /* Custom utility classes */
  .text-balance { ... }
}
```

### **Custom Properties**

```css
:root {
  --coral-500: #FF6B4A;
  --slate-600: #253645;
  /* ... */
}

/* Use in CSS */
color: var(--coral-500);

/* Or use Tailwind classes */
className="text-coral-500"
```

---

## ✅ **Summary**

**Your CSS is now properly configured with**:

1. ✅ Tailwind directives in `globals.css`
2. ✅ PostCSS config with Tailwind plugin
3. ✅ Design system tokens in Tailwind config
4. ✅ Global import in root layout
5. ✅ Custom component classes
6. ✅ AutoNews color palette

**To apply styles**: Use the new class names from the design system!

```tsx
// Old (won't work)
className="bg-blue-600 text-gray-900"

// New (works!)
className="bg-coral-500 text-slate-600"
```

---

**CSS is ready to use!** 🎨✨

