# Issue Editor Implementation

## Overview

Complete issue editor UI with drag-and-drop reordering, custom fields, live preview, and auto-saving.

---

## ✅ Features Implemented

### 1. **Split-View Editor**

- **Left Panel**: Editor with drag-and-drop item management
- **Right Panel**: Live email preview
- **Sticky Header**: Breadcrumb navigation and status badge
- **Responsive**: Full-width on mobile, split on desktop

### 2. **Auto-Freeze on Open**

- When user opens editor, issue status changes from `draft` → `frozen`
- Prevents accidental regeneration
- Visual status badge in header

### 3. **Introduction Editor**

- Textarea for markdown content
- Auto-save after 1 second of inactivity
- Visual feedback (Saving... / ✓ Saved)
- Supports full Markdown syntax
- Help text with examples

### 4. **Drag-and-Drop Reordering**

- @hello-pangea/dnd library
- Visual drag handle (⋮⋮ icon)
- Smooth animations
- Instant local update + server save
- Position numbers update automatically

### 5. **Item Management**

Each item has:
- **Custom Title**: Override original title (optional)
- **Custom Summary**: Override original summary (optional)
- **Remove/Restore**: Toggle removed status
- **Original Content**: Always visible below custom fields
- **Metadata**: Source name, publish date, author
- **Link**: Direct link to original article

### 6. **Removed Items Section**

- Separate section below active items
- Shows count of removed items
- Restore button for each
- Grayed out appearance
- Doesn't affect numbering

### 7. **Live Email Preview**

- Realistic email template
- Header with gradient
- Formatted article list
- Footer with unsubscribe links
- Markdown rendering for intro
- Updates in real-time
- Mobile-friendly design

### 8. **Auto-Saving**

- Intro: Debounced 1 second after typing stops
- Custom fields: Immediate save on change
- Reordering: Immediate save after drop
- Remove/Restore: Immediate save
- No manual save button needed

---

## 📁 Files Created/Modified

### **New Files** (4)

1. **`app/(app)/app/org/[orgId]/newsletters/[newsletterId]/issues/[issueId]/page.tsx`** (REPLACED ~40 lines)
   - Server component
   - Fetches issue data with items
   - Auto-freezes draft issues
   - Passes data to client component

2. **`app/(app)/app/org/[orgId]/newsletters/[newsletterId]/issues/[issueId]/IssueEditorClient.tsx`** (~140 lines)
   - Main client wrapper
   - Split-view layout
   - State management for items and intro
   - Header with breadcrumb and status

3. **`app/(app)/app/org/[orgId]/newsletters/[newsletterId]/issues/[issueId]/EditorPanel.tsx`** (~310 lines)
   - Left panel with editor
   - Intro textarea with auto-save
   - Drag-and-drop item list
   - Custom title/summary inputs
   - Remove/Restore functionality
   - Removed items section

4. **`app/(app)/app/org/[orgId]/newsletters/[newsletterId]/issues/[issueId]/PreviewPanel.tsx`** (~230 lines)
   - Right panel with email preview
   - Realistic email template
   - Markdown rendering
   - Formatted article list
   - Footer with links

### **Modified Files** (2)

5. **`app/actions/issues.ts`** (MODIFIED +240 lines)
   - Added `getIssueWithItems()` - Fetch issue with all item data
   - Added `freezeIssue()` - Change status to frozen
   - Added `updateIssueIntro()` - Save intro markdown
   - Added `updateIssueItem()` - Update custom fields or removed status
   - Added `reorderIssueItems()` - Batch update positions

6. **`package.json`** (MODIFIED)
   - Added `@hello-pangea/dnd` - Drag-and-drop library
   - Added `react-markdown` - Markdown rendering

---

## 🚀 Usage

### **Opening the Editor**

1. Go to newsletter detail page
2. Click "Issues" tab
3. Generate or select an existing issue
4. Click "Edit" button
5. Editor opens in split view
6. Status automatically changes to "Frozen" (if was draft)

### **Editing Content**

**Introduction:**
- Type in textarea at top of editor
- Markdown supported: **bold**, *italic*, [links](url)
- Auto-saves after 1 second
- Watch "Saving..." → "✓ Saved" indicator

**Reordering Items:**
- Click and hold drag handle (⋮⋮)
- Drag item to new position
- Drop to place
- Order saves automatically
- Preview updates instantly

**Custom Titles/Summaries:**
- Click in input field below "Original:"
- Type custom text
- Saves automatically on blur
- Leave blank to use original
- Preview shows custom version

**Removing Items:**
- Click "Remove" button on item
- Item moves to "Removed Items" section
- Hidden from preview
- Doesn't delete from database

**Restoring Items:**
- Scroll to "Removed Items" section
- Click "Restore" button
- Item returns to end of active list
- Appears in preview again

---

## 🎨 UI Layout

### **Header**
```
┌──────────────────────────────────────────────────┐
│ ← Back to Issues / Issue Title      [Frozen]    │
└──────────────────────────────────────────────────┘
```

### **Split View**
```
┌────────────────────┬────────────────────┐
│  EDITOR PANEL      │  PREVIEW PANEL     │
│  (Scroll)          │  (Scroll)          │
│                    │                    │
│  Intro Textarea    │  Email Template    │
│  Content Items     │  - Header          │
│  Removed Items     │  - Intro           │
│                    │  - Articles        │
│                    │  - Footer          │
└────────────────────┴────────────────────┘
```

---

## ✅ Summary

**Complete issue editor** with:

✅ Split-view layout (editor + preview)  
✅ Auto-freeze on open (draft → frozen)  
✅ Intro editor with auto-save  
✅ Drag-and-drop reordering  
✅ Custom title/summary per item  
✅ Remove/restore functionality  
✅ Removed items section  
✅ Live email preview  
✅ Markdown rendering  
✅ Realistic email template  
✅ Optimistic UI updates  
✅ Server action integration  
✅ Mobile responsive  
✅ Authorization checks  
✅ Error handling  
✅ Clean Tailwind UI  

**Your newsletter editor is production-ready!** 🎨📧✨

