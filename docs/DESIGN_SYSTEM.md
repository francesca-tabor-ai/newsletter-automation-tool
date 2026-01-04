# AutoNews Design System

HubSpot-inspired design system for AutoNews - bright, airy, and approachable.

---

## 🎨 **Core Philosophy**

**Bright, Airy, Approachable**
- Simple shapes with generous padding
- Rounded corners everywhere
- Subtle shadows (never heavy or neon)
- Friendly microcopy
- Helpful empty states

---

## 🌈 **Color Palette**

### **Primary Accent: Warm Coral**

```css
coral-500: #FF6B4A  /* Primary CTA color */
coral-600: #E85A3E  /* Hover state */
```

**Usage**: Buttons, links, highlights, active states

### **Ink & Text Colors**

```css
slate-600: #253645  /* Headings */
slate-500: #4A5B6A  /* Body text */
slate-300: #A8B5C3  /* Muted text */
```

### **Borders & Backgrounds**

```css
slate-100: #E6ECF1  /* Borders */
slate-50: #F7FAFC   /* Background */
surface: #FFFFFF    /* Cards, surfaces */
```

### **Color System**

```tsx
// Tailwind classes
bg-coral-500        // Primary coral
bg-slate-600        // Deep ink
bg-slate-500        // Body text
bg-slate-100        // Borders
bg-background       // Off-white
bg-surface          // White
```

---

## 🔤 **Typography**

### **Font Family**

```css
font-sans: Inter, SF Pro Display, DM Sans, -apple-system
```

### **Type Scale**

| Element | Size | Line Height | Weight | Tailwind |
|---------|------|-------------|--------|----------|
| **H1** | 48px | 1.2 | 700 | `text-h1` |
| **H2** | 32px | 1.25 | 700 | `text-h2` |
| **H3** | 24px | 1.3 | 600 | `text-h3` |
| **H4** | 20px | 1.4 | 600 | `text-h4` |
| **Body** | 16px | 1.6 | 400 | `text-body` |
| **Small** | 14px | 1.5 | 400 | `text-small` |
| **XS** | 12px | 1.5 | 400 | `text-xs` |

### **Examples**

```tsx
<h1 className="text-h1 text-slate-600">AutoNews</h1>
<h2 className="text-h2 text-slate-600">Your Daily Digest</h2>
<p className="text-body text-slate-500">Stay informed with curated content</p>
<span className="text-small text-slate-400">2 hours ago</span>
```

---

## 📏 **Layout & Spacing**

### **Spacing System (8px base)**

```css
spacing-1: 8px
spacing-2: 16px
spacing-3: 24px
spacing-4: 32px
spacing-5: 40px
spacing-6: 48px
```

**Usage**:
```tsx
p-2   // padding: 16px
p-3   // padding: 24px
p-4   // padding: 32px

gap-2 // gap: 16px
gap-3 // gap: 24px
```

### **Max Content Width**

```tsx
<div className="max-w-content mx-auto">
  {/* Content constrained to 1200px */}
</div>
```

### **Grid Layouts**

```tsx
// 2-column grid
<div className="grid grid-cols-2 gap-3">

// 3-column grid
<div className="grid grid-cols-3 gap-4">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
```

---

## 🎯 **Components**

### **Buttons**

#### **Primary Button (Coral)**

```tsx
<button className="
  h-[48px] 
  px-4 
  rounded-lg 
  bg-coral-500 
  hover:bg-coral-600 
  text-white 
  font-medium 
  shadow-button 
  transition-colors
">
  Create Digest
</button>
```

#### **Secondary Button (Outlined)**

```tsx
<button className="
  h-[48px] 
  px-4 
  rounded-lg 
  bg-surface 
  hover:bg-slate-50 
  text-slate-600 
  font-medium 
  border 
  border-slate-100 
  shadow-button 
  transition-colors
">
  Cancel
</button>
```

#### **Tertiary Button (Text Only)**

```tsx
<button className="
  h-[48px] 
  px-4 
  text-coral-500 
  hover:text-coral-600 
  font-medium 
  transition-colors
">
  Learn More
</button>
```

#### **Button Sizes**

```tsx
// Large (default)
h-[48px] px-4

// Medium
h-[44px] px-3

// Small
h-[36px] px-3 text-small
```

---

### **Cards**

#### **Basic Card**

```tsx
<div className="
  bg-surface 
  border 
  border-slate-100 
  rounded-xl 
  p-4 
  shadow-card 
  hover:shadow-card-hover 
  transition-shadow
">
  <h3 className="text-h4 text-slate-600 mb-2">Card Title</h3>
  <p className="text-body text-slate-500">Card content goes here</p>
</div>
```

#### **Story Card**

```tsx
<div className="
  bg-surface 
  border 
  border-slate-100 
  rounded-xl 
  p-3 
  shadow-card 
  hover:shadow-card-hover 
  transition-shadow
">
  {/* Source header */}
  <div className="flex items-center gap-2 mb-2">
    <img src="/favicon.ico" className="w-4 h-4 rounded-sm" />
    <span className="text-small text-slate-400">TechCrunch</span>
  </div>
  
  {/* Headline */}
  <h3 className="text-h4 text-slate-600 mb-2 line-clamp-2">
    AI Breakthrough: New Model Achieves Human-Level Performance
  </h3>
  
  {/* Summary */}
  <p className="text-body text-slate-500 mb-3 line-clamp-3">
    Researchers announce major advancement in artificial intelligence...
  </p>
  
  {/* Tags */}
  <div className="flex flex-wrap gap-2 mb-3">
    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md">
      AI/ML
    </span>
    <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md">
      Technology
    </span>
  </div>
  
  {/* Actions */}
  <div className="flex items-center gap-2">
    <button className="
      px-3 py-1.5 
      bg-slate-50 
      hover:bg-slate-100 
      text-slate-600 
      text-small 
      rounded-md 
      transition-colors
    ">
      Save
    </button>
    <button className="
      px-3 py-1.5 
      bg-slate-50 
      hover:bg-slate-100 
      text-slate-600 
      text-small 
      rounded-md 
      transition-colors
    ">
      Share
    </button>
    <button className="
      px-3 py-1.5 
      bg-coral-50 
      hover:bg-coral-100 
      text-coral-600 
      text-small 
      rounded-md 
      transition-colors
    ">
      Summarize
    </button>
  </div>
</div>
```

---

### **Inputs**

#### **Text Input**

```tsx
<input 
  type="text"
  placeholder="Enter your email"
  className="
    h-[44px] 
    px-3 
    w-full 
    bg-surface 
    border 
    border-slate-100 
    rounded-lg 
    text-body 
    text-slate-600 
    placeholder:text-slate-300 
    focus:border-coral-500 
    focus:ring-0 
    focus:shadow-input-focus 
    transition-all
  "
/>
```

#### **Textarea**

```tsx
<textarea 
  placeholder="Enter your message"
  rows={4}
  className="
    p-3 
    w-full 
    bg-surface 
    border 
    border-slate-100 
    rounded-lg 
    text-body 
    text-slate-600 
    placeholder:text-slate-300 
    focus:border-coral-500 
    focus:ring-0 
    focus:shadow-input-focus 
    transition-all
  "
/>
```

#### **Select Dropdown**

```tsx
<select className="
  h-[44px] 
  px-3 
  w-full 
  bg-surface 
  border 
  border-slate-100 
  rounded-lg 
  text-body 
  text-slate-600 
  focus:border-coral-500 
  focus:ring-0 
  focus:shadow-input-focus 
  transition-all
">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

### **Navigation**

#### **Top Navigation**

```tsx
<nav className="
  bg-surface 
  border-b 
  border-slate-100 
  h-16
">
  <div className="max-w-content mx-auto px-4 h-full flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <span className="text-h3 text-slate-600 font-bold">AutoNews</span>
    </div>
    
    {/* Nav links */}
    <div className="flex items-center gap-6">
      <a href="#" className="text-body text-slate-500 hover:text-slate-600 transition-colors">
        Dashboard
      </a>
      <a href="#" className="text-body text-slate-500 hover:text-slate-600 transition-colors">
        Digests
      </a>
      <a href="#" className="text-body text-slate-500 hover:text-slate-600 transition-colors">
        Sources
      </a>
    </div>
    
    {/* CTA */}
    <button className="
      h-[44px] 
      px-4 
      rounded-lg 
      bg-coral-500 
      hover:bg-coral-600 
      text-white 
      font-medium 
      shadow-button 
      transition-colors
    ">
      Get Started Free
    </button>
  </div>
</nav>
```

---

### **Filter Rail (Left Sidebar)**

```tsx
<aside className="w-64 bg-surface border-r border-slate-100 p-4">
  {/* Section */}
  <div className="mb-4">
    <h4 className="text-h4 text-slate-600 mb-2">Topics</h4>
    <div className="space-y-1">
      <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
        <input type="checkbox" className="rounded text-coral-500" />
        <span className="text-body text-slate-500">Technology</span>
      </label>
      <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md cursor-pointer">
        <input type="checkbox" className="rounded text-coral-500" />
        <span className="text-body text-slate-500">Business</span>
      </label>
    </div>
  </div>
  
  <div className="mb-4">
    <h4 className="text-h4 text-slate-600 mb-2">Sources</h4>
    {/* More filters */}
  </div>
  
  <div className="mb-4">
    <h4 className="text-h4 text-slate-600 mb-2">Date Range</h4>
    {/* Date picker */}
  </div>
</aside>
```

---

### **Empty States**

```tsx
<div className="text-center py-12 px-4">
  {/* Icon */}
  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-slate-50 rounded-2xl">
    <svg className="w-8 h-8 text-slate-300">...</svg>
  </div>
  
  {/* Title */}
  <h3 className="text-h3 text-slate-600 mb-2">
    No stories yet
  </h3>
  
  {/* Description */}
  <p className="text-body text-slate-500 mb-6 max-w-md mx-auto">
    Add your first content source to start curating stories. We'll automatically fetch and organize articles for you.
  </p>
  
  {/* Action */}
  <button className="
    h-[48px] 
    px-4 
    rounded-lg 
    bg-coral-500 
    hover:bg-coral-600 
    text-white 
    font-medium 
    shadow-button 
    transition-colors
  ">
    Add Content Source
  </button>
</div>
```

---

## 🎨 **Design Patterns**

### **Card Grid Layout**

```tsx
<div className="max-w-content mx-auto p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Story cards */}
  </div>
</div>
```

### **Two-Column Layout with Sidebar**

```tsx
<div className="flex min-h-screen">
  {/* Left filter rail */}
  <aside className="w-64 border-r border-slate-100">
    {/* Filters */}
  </aside>
  
  {/* Main content */}
  <main className="flex-1 p-6">
    {/* Story grid */}
  </main>
</div>
```

### **Section Headers**

```tsx
<div className="mb-6">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-h2 text-slate-600">Today's Stories</h2>
      <p className="text-body text-slate-400 mt-1">42 new articles from 12 sources</p>
    </div>
    <button className="
      h-[44px] 
      px-4 
      rounded-lg 
      bg-coral-500 
      hover:bg-coral-600 
      text-white 
      font-medium 
      shadow-button 
      transition-colors
    ">
      Create Digest
    </button>
  </div>
</div>
```

---

## 🎯 **Usage Examples**

### **Dashboard Page**

```tsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-surface border-b border-slate-100 h-16">
        {/* Nav content */}
      </nav>
      
      {/* Main content */}
      <main className="max-w-content mx-auto p-6">
        <h1 className="text-h1 text-slate-600 mb-2">
          Good morning, Alex 👋
        </h1>
        <p className="text-body text-slate-500 mb-6">
          Here's what's happening today
        </p>
        
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-slate-100 rounded-xl p-4">
            <div className="text-small text-slate-400 mb-1">New Stories</div>
            <div className="text-h2 text-slate-600">42</div>
          </div>
          {/* More stats */}
        </div>
        
        {/* Story grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Story cards */}
        </div>
      </main>
    </div>
  )
}
```

---

## ✅ **Checklist**

Apply this design system:

- [x] Update `tailwind.config.js` with new colors
- [x] Set up typography scale
- [x] Define spacing system
- [x] Create shadow utilities
- [ ] Update all buttons to new style
- [ ] Update all cards to rounded-xl
- [ ] Update all inputs with new styling
- [ ] Replace colors across app
- [ ] Add friendly empty states
- [ ] Update navigation bar
- [ ] Test on mobile/tablet/desktop

---

## 🎨 **Quick Reference**

**Colors**:
- Primary: `bg-coral-500` / `text-coral-500`
- Heading: `text-slate-600`
- Body: `text-slate-500`
- Muted: `text-slate-400`
- Border: `border-slate-100`
- Background: `bg-background`

**Buttons**:
- Primary: `bg-coral-500 hover:bg-coral-600 text-white h-[48px] px-4 rounded-lg`
- Secondary: `bg-surface border border-slate-100 text-slate-600 h-[48px] px-4 rounded-lg`

**Cards**:
- `bg-surface border border-slate-100 rounded-xl p-4 shadow-card`

**Inputs**:
- `h-[44px] px-3 border border-slate-100 rounded-lg focus:border-coral-500`

**Spacing**:
- Use `p-2` (16px), `p-3` (24px), `p-4` (32px)
- Use `gap-2`, `gap-3`, `gap-4` for grids

---

**Design system complete!** 🎨✨

