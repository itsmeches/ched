# Ant Design Component Audit & Implementation Opportunities

**Scan Date:** May 11, 2026  
**Status:** Comprehensive audit complete  
**Total Opportunities:** 60+ components that can be enhanced

---

## 🎯 PRIORITY 1: Replace Custom Button Components

These custom button wrappers should be replaced with Ant Design `<Button>` to achieve consistent styling and behavior.

### Current Custom Buttons:

| File                             | Current                           | Ant Design Replacement                           | Impact                                |
| -------------------------------- | --------------------------------- | ------------------------------------------------ | ------------------------------------- |
| `Components/PrimaryButton.jsx`   | Custom styled `<button>` with CSS | `<Button type="primary">`                        | Standardize primary actions across UI |
| `Components/DangerButton.jsx`    | Custom red `<button>`             | `<Button danger>`                                | Consistent danger state styling       |
| `Components/SecondaryButton.jsx` | Custom secondary `<button>`       | `<Button type="default">`                        | Unified secondary actions             |
| `Components/ActionButton.jsx`    | Custom action wrapper             | `<Button type="link">` or `<Button type="text">` | Better action integration             |

**Files to Update:**

- All auth pages: `Pages/Auth/*.jsx` (Login, Register, ForgotPassword, etc.)
- Admin pages: `Pages/Admin/Users/*.jsx`, `Pages/Admin/Institutions/*.jsx`
- Dashboard pages: `Pages/Dashboard/*.jsx`
- Profile pages: `Pages/Accounts/Edit.jsx`

**Benefit:**

- Consistent button sizing, colors, and hover states
- Built-in loading states with spinners
- Better accessibility out-of-box
- Easier dark mode support

---

## 🎯 PRIORITY 2: Replace Custom Input Components

### Current Custom Inputs:

| File                       | Current                                   | Ant Design                                | Impact                      |
| -------------------------- | ----------------------------------------- | ----------------------------------------- | --------------------------- |
| `Components/TextInput.jsx` | Custom `<input>` with Tailwind            | `<Input>`                                 | Unified form field styling  |
| `Components/Checkbox.jsx`  | Custom `<input type="checkbox">`          | `<Checkbox>`                              | Ant Design checkbox styling |
| HTML form inputs           | Plain `<input>`, `<select>`, `<textarea>` | `<Input>`, `<Select>`, `<Input.TextArea>` | Consistency                 |

**Files Using Custom Inputs:**

- `Pages/Auth/ResetPassword.jsx` - uses TextInput
- `Pages/Auth/ConfirmPassword.jsx` - uses TextInput
- `Pages/Accounts/Edit.jsx` - inline inputs
- `Pages/Research/Partials/ResearchProposalForm.jsx` - mixed inputs

**Benefit:**

- Unified styling with error states
- Better accessibility
- Built-in validation UI support
- Consistent sizing and borders

---

## 🎯 PRIORITY 3: Replace Custom Form Handling

### Current Approach:

- `InputLabel.jsx` + `InputError.jsx` + native `<form>` elements
- Manual error state management

### Ant Design Replacement:

```jsx
<Form layout="vertical" form={form} onFinish={onSubmit}>
    <Form.Item label="Email" name="email" rules={[{ required: true }]}>
        <Input placeholder="Enter email" />
    </Form.Item>
    <Form.Item name="password" rules={[{ required: true }]}>
        <Input.Password />
    </Form.Item>
</Form>
```

**Files to Update:**

- `Pages/Auth/Login.jsx` - use Ant Form instead of custom labels
- `Pages/Auth/Register.jsx` - use Ant Form
- `Pages/Admin/Users/Partials/UserFormFields.jsx` - already partially using Ant Form (good pattern!)
- `Pages/Research/Partials/ResearchProposalForm.jsx` - use Ant Form
- `Pages/Admin/Institutions/Partials/InstitutionFormFields.jsx` - use Ant Form

**Already Good:**

- `Pages/Admin/Users/Partials/UserFormFields.jsx` ✅ - already using `<Form.Item>` correctly

**Benefit:**

- Automatic validation handling
- Better error message display
- Form state management built-in
- Consistent field spacing

---

## 🎯 PRIORITY 4: Replace Custom Dropdown

### Current:

- `Components/Dropdown.jsx` - custom React Context-based dropdown with Tailwind

### Ant Design Replacement:

```jsx
<Dropdown menu={{ items: [...] }} trigger={['click']}>
  <Button>Menu</Button>
</Dropdown>
```

**Files Using Custom Dropdown:**

- `Components/Navbar.jsx` - uses custom Dropdown component
- `Layouts/AuthenticatedLayout.jsx` - sidebar uses custom patterns

**Files to Update:**

- Line 5 in `Components/Navbar.jsx`: `import Dropdown from './Dropdown';`
- All `<Dropdown.Trigger>`, `<Dropdown.Content>`, `<Dropdown.Link>` usage

**Benefit:**

- Better mobile support
- Keyboard navigation
- Click-outside handling
- Consistent positioning

---

## 🎯 PRIORITY 5: Add Missing Ant Components

### Modals & Overlays

**Current:** Custom HTML divs with CSS  
**Opportunity:** Use `<Modal>`, `<Drawer>`, `<Popover>`

**Use Cases:**

- Confirmation dialogs before delete actions
- Edit panels for inline editing
- Help/info popovers on dashboard

**Files:**

- `Pages/Admin/Users/Index.jsx` - line 112: "Restore" user - should show confirmation Modal
- `Pages/Research/Show.jsx` - status changes should use Modal confirmation
- Dashboard pages - info icons could use Popover

### Loading States

**Current:** Custom spinner CSS in buttons  
**Opportunity:** Use `<Spin>`, `<Skeleton>`

**Files:**

- `Components/PrimaryButton.jsx` - already has custom spinner, could use `<Spin>`
- Research pages during file upload - could show Spin overlay
- Data loading states - could use Skeleton

### Navigation Enhancements

**Current:** Plain Navbar with custom `<button>` elements  
**Opportunity:** Use Ant `<Layout>`, `<Menu>`, `<Breadcrumb>`

**Files:**

- `Layouts/AuthenticatedLayout.jsx` - could use `<Layout>` with `<Layout.Sider>`, `<Layout.Content>`
- `Components/Navbar.jsx` - could use `<Menu>` for navigation items

### Data Display

**Current:** No use of Ant Timeline, Tree, Steps  
**Opportunity:** Add these for better data visualization

**Use Cases:**

- Approval workflow: Use `<Steps>` to show Faculty → HEI → CHED stages
- Research history: Use `<Timeline>` to show approval/rejection history
- Institution hierarchy: Use `<Tree>` for Ant Institution / HEI / Faculty / Student structure

---

## 🎯 PRIORITY 6: Form-Specific Improvements

### Date Pickers

**Current:** None found  
**Opportunity:** Add `<DatePicker>` for year inputs, date ranges

**Use Cases:**

- Research year selection: could use `<DatePicker>` year picker instead of text input
- Filter ranges in dashboard: could use `<RangePicker>`

**Files:**

- `Pages/Dashboard/Partials/DashboardFilters.jsx` - year select could use DatePicker
- `Pages/Research/Create.jsx` - year field could use DatePicker year mode

### Select/Cascader

**Current:** Basic `<Select>` from Ant (good!)  
**Opportunity:** Use `<Cascader>` for hierarchical selections

**Use Cases:**

- Discipline > Category > Subcategory selection
- Institution > HEI > Faculty selection

**Files:**

- `Pages/Research/Partials/ResearchProposalForm.jsx` - could use Cascader for discipline/category

### Tree Select

**Current:** None  
**Opportunity:** Use `<TreeSelect>` for institution hierarchy

**Files:**

- `Pages/Admin/Users/Create.jsx` - institution field could use TreeSelect

---

## 🎯 PRIORITY 7: Enhanced Alerts & Notifications

### Current:

- `Alert` component used in places ✅ (good!)
- `message` API used in places ✅ (good!)

### Opportunities:

- Use `<Tag>` for status labels (Approved, Pending, Rejected)
- Use `<Badge>` for notification counts
- Use `<Alert>` for all validation errors (not just custom InputError)
- Use `<Result>` for empty/error states

**Files to Update:**

- Status displays: Should use `<Tag color="green">Approved</Tag>` instead of plain text
- Notification badges: Already using notifications, could show count with `<Badge>`

**Files:**

- `Pages/Research/Index.jsx` - status columns could use Tag
- `Pages/Dashboard/SuperAdmin.jsx` - flash messages already use Alert ✅

---

## 🎯 PRIORITY 8: Navigation & Layout

### Current Structure:

```
AuthenticatedLayout
  ├── Sidebar (custom)
  ├── Topbar (custom)
  └── Main content
```

### Ant Design Improvement:

```jsx
<Layout>
    <Layout.Sider>
        <Menu>...</Menu>
    </Layout.Sider>
    <Layout>
        <Layout.Header>...</Layout.Header>
        <Layout.Content>...</Layout.Content>
    </Layout>
</Layout>
```

**Benefits:**

- Responsive collapsible sidebar built-in
- Menu active states
- Better mobile support
- Consistent spacing

**Files:**

- `Layouts/AuthenticatedLayout.jsx` - restructure to use Ant Layout
- `Components/Sidebar.jsx` - convert to Ant Menu
- `Components/Topbar.jsx` - convert to Ant Header

---

## 📊 Implementation Priority Matrix

### Phase 1 (High Impact, Easy):

1. Replace custom buttons with Ant Button (5 files)
2. Replace TextInput with Ant Input (8 files)
3. Replace custom dropdown with Ant Dropdown (2 files)
4. Use Tag for status labels (3 files)

### Phase 2 (Medium Impact, Medium Effort):

1. Convert forms to use Ant Form.Item consistently (6 files)
2. Add Modals for confirmations (4 files)
3. Use DatePicker for date inputs (3 files)
4. Add Timeline for approval workflows (2 files)

### Phase 3 (Nice-to-Have, Medium Effort):

1. Restructure layout using Ant Layout component (1 file)
2. Convert navigation to Ant Menu (2 files)
3. Add Steps for workflow visualization (1 file)
4. Add Cascader for hierarchical selections (1 file)

---

## 📝 Component Replacement Guide

### Button Replacement

```jsx
// OLD
import PrimaryButton from "@/Components/PrimaryButton";
<PrimaryButton onClick={handle}>Submit</PrimaryButton>;

// NEW
import { Button } from "antd";
<Button type="primary" onClick={handle}>
    Submit
</Button>;
```

### Input Replacement

```jsx
// OLD
import TextInput from "@/Components/TextInput";
<TextInput value={val} onChange={handle} />;

// NEW
import { Input } from "antd";
<Input value={val} onChange={handle} />;
```

### Form Replacement

```jsx
// OLD
<form>
  <InputLabel>Email</InputLabel>
  <TextInput />
  <InputError />
</form>

// NEW
<Form form={form}>
  <Form.Item label="Email" name="email" rules={[{required: true}]}>
    <Input />
  </Form.Item>
</Form>
```

### Dropdown Replacement

```jsx
// OLD
<Dropdown>
  <Dropdown.Trigger><button>Menu</button></Dropdown.Trigger>
  <Dropdown.Content><Dropdown.Link>Item</Dropdown.Link></Dropdown.Content>
</Dropdown>

// NEW
<Dropdown menu={{ items: [{label: 'Item', key: '1'}] }}>
  <Button>Menu</Button>
</Dropdown>
```

---

## ✅ Already Good (No Changes Needed)

- ✅ `Pages/Admin/Users/Partials/UserFormFields.jsx` - properly uses `<Form.Item>`
- ✅ `Pages/Dashboard/Partials/SuperAdminStats.jsx` - good Card and Statistic usage
- ✅ Alert usage in dashboards - proper flash message display
- ✅ Table components - using Ant Table correctly
- ✅ Icon usage - proper Ant icons imported

---

## 🎨 Consistency Checklist

After implementing these changes:

- [ ] All buttons use Ant Button (no custom buttons)
- [ ] All inputs use Ant Input/TextArea/Select/DatePicker
- [ ] All forms use Ant Form with validation
- [ ] All modals/confirmations use Ant Modal
- [ ] All status/tags use Ant Tag
- [ ] All notifications use Ant message/notification
- [ ] Navigation uses consistent styling
- [ ] Dark mode works consistently
- [ ] Mobile responsive on all components
- [ ] Accessibility (ARIA labels, keyboard nav) present

---

## 📞 Implementation Notes

- These changes are **non-breaking** - can be done incrementally
- Custom components can be deprecated gradually
- Focus on high-impact files first (Forms, Buttons, Inputs)
- Test dark mode after each phase
- Ensure mobile responsiveness is maintained
- Run `npm run build` after each phase to catch errors
