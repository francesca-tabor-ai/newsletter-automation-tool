# Role-Based Access Control & UX Enhancements

## Overview

Complete RBAC system with three roles and comprehensive UX improvements including toast notifications, onboarding checklist, empty states, and loading indicators.

---

## ✅ Role-Based Access Control

### **Three Roles**

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Owner** | Full access: manage members, billing, delete newsletters | Organization admin |
| **Editor** | Manage content: newsletters, issues, sources, subscribers | Content manager |
| **Viewer** | Read-only access: view all content, no modifications | Stakeholder, reviewer |

### **Permission Hierarchy**

```
Owner (Level 3)
  ├─ All editor permissions
  ├─ Manage organization members
  ├─ Delete newsletters
  └─ Access billing (future)

Editor (Level 2)
  ├─ All viewer permissions
  ├─ Create/edit newsletters
  ├─ Manage sources & rules
  ├─ Manage subscribers
  ├─ Generate & send issues
  └─ Configure schedules

Viewer (Level 1)
  ├─ View newsletters
  ├─ View sources & rules
  ├─ View issues
  ├─ View subscribers
  └─ View analytics
```

---

## 📁 Files Created

### **Database** (1 migration)

1. **`db/migrations/004_add_role_based_access.sql`**
   - Add `role` column to `org_members`
   - Set existing members as 'owner'
   - Add CHECK constraint for valid roles
   - Create index for role queries

### **Utilities** (1 file)

2. **`lib/permissions.ts`** (~120 lines)
   - `getUserRole()` - Get user's role in org
   - `hasPermission()` - Check if user has required role
   - `canRead()` - Check viewer+ access
   - `canEdit()` - Check editor+ access
   - `isOwner()` - Check owner access
   - `requirePermission()` - Throw error if insufficient
   - `getPermissionError()` - Get error message

### **Components** (4 files)

3. **`components/ToastProvider.tsx`** (~180 lines)
   - Toast context provider
   - Success/error/info/warning toasts
   - Auto-dismiss after 5 seconds
   - Slide-in animation
   - Close button
   - Stacked toasts

4. **`components/OnboardingChecklist.tsx`** (~150 lines)
   - 5-step checklist
   - Progress bar
   - Completed/pending states
   - Clickable links to actions
   - Dismissible
   - Auto-hide when complete

5. **`components/EmptyState.tsx`** (~60 lines)
   - Reusable empty state
   - Icon, title, description
   - Primary & secondary actions
   - Consistent styling

6. **`components/Loading.tsx`** (~120 lines)
   - LoadingSpinner (sm/md/lg)
   - LoadingCard
   - LoadingTable
   - LoadingList
   - LoadingPage

### **Modified Files** (1 file)

7. **`app/actions/newsletters.ts`** (MODIFIED)
   - Import permissions utilities
   - Add permission checks to all actions
   - canEdit() for create/update
   - isOwner() for delete
   - Return permission error messages

---

## 🗄️ **Database Migration**

### **Run Migration**

```sql
-- In Supabase SQL Editor or psql:
ALTER TABLE org_members
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer' 
CHECK (role IN ('owner', 'editor', 'viewer'));

-- Set existing members as owners
UPDATE org_members SET role = 'owner' WHERE role IS NULL;

-- Make role NOT NULL
ALTER TABLE org_members ALTER COLUMN role SET NOT NULL;
```

### **New Column**

| Column | Type | Default | Constraint |
|--------|------|---------|------------|
| `role` | `TEXT` | `'viewer'` | `IN ('owner', 'editor', 'viewer')` |

---

## 🔒 **Permission Enforcement**

### **Server Actions**

All server actions now check permissions:

```typescript
// Read operations (all roles)
export async function getNewsletter(newsletterId: string) {
  const newsletter = await fetchNewsletter(newsletterId)
  
  if (!(await canRead(newsletter.org_id))) {
    return null
  }
  
  return newsletter
}

// Edit operations (editor or owner)
export async function createNewsletter(orgId: string, formData: FormData) {
  if (!(await canEdit(orgId))) {
    return { error: getPermissionError('editor') }
  }
  
  // ... create newsletter
}

// Owner-only operations
export async function deleteNewsletter(newsletterId: string) {
  const newsletter = await getNewsletter(newsletterId)
  
  if (!(await isOwner(newsletter.org_id))) {
    return { error: getPermissionError('owner') }
  }
  
  // ... delete newsletter
}
```

### **Permission Checks**

| Action | Required Role | Function |
|--------|---------------|----------|
| View content | Viewer+ | `canRead()` |
| Create newsletter | Editor+ | `canEdit()` |
| Edit newsletter | Editor+ | `canEdit()` |
| Delete newsletter | Owner | `isOwner()` |
| Add sources | Editor+ | `canEdit()` |
| Edit rules | Editor+ | `canEdit()` |
| Generate issues | Editor+ | `canEdit()` |
| Send issues | Editor+ | `canEdit()` |
| Add subscribers | Editor+ | `canEdit()` |
| Manage members | Owner | `isOwner()` |

---

## 🎨 **Toast Notifications**

### **Usage**

```typescript
'use client'

import { useToast } from '@/components/ToastProvider'

function MyComponent() {
  const toast = useToast()
  
  const handleAction = async () => {
    try {
      await performAction()
      toast.success('Success!', 'Newsletter created successfully')
    } catch (error) {
      toast.error('Error', error.message)
    }
  }
  
  return <button onClick={handleAction}>Action</button>
}
```

### **Toast Types**

```typescript
// Success (green)
toast.success('Newsletter sent!', '150 emails delivered successfully')

// Error (red)
toast.error('Failed to save', 'Please check your input and try again')

// Info (blue)
toast.info('New feature', 'Check out the new analytics dashboard')

// Warning (yellow)
toast.warning('Low credits', 'You have 10 sends remaining this month')
```

### **Features**

- ✅ Auto-dismiss after 5 seconds
- ✅ Manual close button
- ✅ Stack multiple toasts
- ✅ Slide-in animation
- ✅ Color-coded by type
- ✅ Icon per type
- ✅ Title + optional message

---

## 🚀 **Onboarding Checklist**

### **5 Steps**

```
1. ✓ Create your first newsletter
2. ✓ Add content sources
3. ○ Configure filtering rules
4. ○ Add subscribers
5. ○ Send your first issue
```

### **Progress Bar**

```
3 of 5 completed                    60%
[████████████░░░░░░░░]
```

### **Features**

- ✅ Progress percentage
- ✅ Visual progress bar
- ✅ Check marks for completed steps
- ✅ Numbers for pending steps
- ✅ Clickable links to actions
- ✅ Dismissible (X button)
- ✅ Auto-hide when 100% complete
- ✅ Gradient background

### **Integration**

```typescript
<OnboardingChecklist
  orgId={orgId}
  newsletterId={newsletterId}
  hasNewsletter={newsletters.length > 0}
  hasSources={sources.length > 0}
  hasRules={!!rules}
  hasSubscribers={subscribers.length > 0}
  hasSentIssue={sentIssues.length > 0}
/>
```

---

## 📭 **Empty States**

### **Usage**

```typescript
import EmptyState from '@/components/EmptyState'
import { NewspaperIcon } from '@heroicons/react/24/outline'

<EmptyState
  icon={<NewspaperIcon className="h-8 w-8 text-gray-400" />}
  title="No newsletters yet"
  description="Get started by creating your first newsletter"
  action={{
    label: "Create Newsletter",
    href: "/newsletters/create"
  }}
  secondaryAction={{
    label: "Learn More",
    href: "/docs"
  }}
/>
```

### **Features**

- ✅ Icon in circle
- ✅ Title + description
- ✅ Primary action button (blue)
- ✅ Optional secondary action (gray)
- ✅ Consistent styling
- ✅ Responsive layout

---

## ⏳ **Loading States**

### **Components**

```typescript
import { 
  LoadingSpinner,
  LoadingCard,
  LoadingTable,
  LoadingList,
  LoadingPage 
} from '@/components/Loading'

// Inline spinner
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// Card skeleton
<LoadingCard />

// Table skeleton
<LoadingTable />

// List skeleton
<LoadingList />

// Full page skeleton
<LoadingPage />
```

### **Features**

- ✅ Spinning blue loader
- ✅ Skeleton screens
- ✅ Pulse animation
- ✅ Multiple sizes
- ✅ Different layouts (card/table/list)

---

## 🎯 **Permission Error Messages**

### **User-Friendly Errors**

```typescript
// Viewer trying to edit
"You need editor or owner access to perform this action."

// Editor trying to delete
"Only organization owners can perform this action."

// Non-member
"You need at least viewer access to perform this action."
```

---

## 🧪 **Testing**

### **1. Test Roles**

```sql
-- Check current role
SELECT role FROM org_members 
WHERE org_id = 'your-org-id' AND user_id = 'your-user-id';

-- Update role for testing
UPDATE org_members 
SET role = 'viewer' 
WHERE org_id = 'your-org-id' AND user_id = 'your-user-id';

-- Test each role:
-- owner: Can do everything
-- editor: Can edit content, can't delete newsletters
-- viewer: Can only view, no edit buttons
```

### **2. Test Permissions**

```bash
# As viewer
- Try to create newsletter → Show error toast
- Try to add source → Show error
- Try to delete subscriber → Show error
- View analytics → Should work ✓

# As editor
- Create newsletter → Should work ✓
- Edit sources → Should work ✓
- Send issue → Should work ✓
- Delete newsletter → Show error

# As owner
- All actions → Should work ✓
```

### **3. Test Toasts**

```typescript
// Success
await createNewsletter()
toast.success('Newsletter created!')

// Error
try {
  await invalidOperation()
} catch (error) {
  toast.error('Operation failed', error.message)
}

// Info
toast.info('Pro tip', 'Use keyboard shortcuts for faster editing')

// Warning
if (credits < 10) {
  toast.warning('Low credits', 'Consider upgrading your plan')
}
```

### **4. Test Onboarding**

```
1. New user logs in
2. See checklist (0/5 completed)
3. Create newsletter → Step 1 checked ✓
4. Add source → Step 2 checked ✓
5. Continue until 5/5
6. Checklist auto-hides
```

---

## ✅ **Summary**

**Role-Based Access:**
✅ Three roles (owner/editor/viewer)  
✅ Permission hierarchy  
✅ Database migration  
✅ Permission utilities  
✅ Server action enforcement  
✅ User-friendly error messages  

**UX Enhancements:**
✅ Toast notifications (4 types)  
✅ Onboarding checklist (5 steps)  
✅ Empty states (reusable)  
✅ Loading states (multiple variants)  
✅ Progress bars  
✅ Animations  
✅ Consistent styling  

**Your app now has professional RBAC and UX!** 🔒✨🎨

