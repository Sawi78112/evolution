# Division Manager Constraint System

## 🎯 Business Rule

**One user can only be a division manager of ONE division at a time.**

This ensures clear organizational hierarchy and prevents confusion about management responsibilities.

## 🏗️ Implementation

### **API Level Filtering**

**Endpoint:** `GET /api/users/division-managers`

**Query Parameters:**
- `excludeManagers=true` - Excludes users who are already division managers
- `includeDivisionId=<division_id>` - Includes current manager of specified division (for editing)

**Examples:**
```typescript
// Add Division Modal - Exclude all existing managers
GET /api/users/division-managers?excludeManagers=true

// Edit Division Modal - Exclude existing managers but include current manager
GET /api/users/division-managers?excludeManagers=true&includeDivisionId=abc123
```

### **Enhanced Hooks**

**1. useAvailableDivisionManagers() ✅**
```typescript
// For Add Division Modal
const { divisionManagers } = useAvailableDivisionManagers();
// Returns only division managers who are NOT already managing divisions
```

**2. useEditableDivisionManagers(divisionId) ✅**
```typescript
// For Edit Division Modal  
const { divisionManagers } = useEditableDivisionManagers(divisionId);
// Returns division managers who are NOT managers + current division's manager
```

**3. useDivisionManagers(options) ✅**
```typescript
// Flexible hook with options
const { divisionManagers } = useDivisionManagers({
  excludeExistingManagers: true,
  includeDivisionId: 'abc123'
});
```

## 🎛️ Modal Behavior

### **Add Division Modal**
- ✅ Shows only users with **Division Manager** role who are **NOT** currently managing divisions
- ✅ Users already managing divisions are **hidden**
- ✅ "No Manager" option always available

### **Edit Division Modal**
- ✅ Shows available division managers + **current division's manager**
- ✅ Current manager can **remain** as manager
- ✅ Current manager can be **changed** to available division manager
- ✅ Current manager can be **removed** (set to "No Manager")

## 📊 Database Query Logic

**Step 1: Get Division Manager Users**
```sql
SELECT user_id FROM user_roles ur
JOIN roles r ON ur.role_id = r.role_id  
WHERE r.role_name = 'Division Manager'
```

**Step 2: Get Existing Division Managers** 
```sql
SELECT manager_user_id FROM divisions 
WHERE manager_user_id IS NOT NULL
```

**Step 3: Filter Available Users**
```sql
-- For Add Division
SELECT * FROM users 
WHERE user_id IN (division_manager_ids)
AND user_id NOT IN (existing_manager_ids)

-- For Edit Division  
SELECT * FROM users 
WHERE user_id IN (division_manager_ids)
AND (user_id NOT IN (existing_manager_ids) 
     OR user_id = current_division_manager_id)
```

## 🔄 Real-World Scenarios

### **Scenario 1: Adding New Division**
1. User opens Add Division modal
2. Manager dropdown shows: `useAvailableDivisionManagers()`
3. Only non-managing division managers appear
4. User selects available division manager ✅

### **Scenario 2: Editing Existing Division**
1. User opens Edit Division modal for "Marketing Division"
2. Manager dropdown shows: `useEditableDivisionManagers(division_id)`
3. Available division managers + current "Marketing" manager appear
4. User can keep, change, or remove manager ✅

### **Scenario 3: Manager Reassignment**
1. User changes "Marketing Division" manager from John to Sarah
2. John becomes available for other divisions
3. Sarah becomes unavailable for other divisions ✅

## 🎯 Benefits

### **For System Administrators**
- ✅ **Clear Hierarchy**: Only qualified division managers can manage divisions
- ✅ **Prevent Conflicts**: One person = one management responsibility
- ✅ **Easy Reassignment**: Simple manager changes between divisions
- ✅ **Role-Based Access**: Only users with Division Manager role are eligible

### **For End Users**
- ✅ **Intuitive UX**: Only valid options shown in dropdowns
- ✅ **No Errors**: Can't accidentally assign same manager twice
- ✅ **Role Clarity**: Clear distinction between administrators and division managers

### **For Developers**
- ✅ **Automatic Filtering**: No manual validation needed
- ✅ **Reusable Hooks**: Same logic for different scenarios
- ✅ **Database Consistency**: Enforced at query level
- ✅ **Role Separation**: Clear separation between admin and management roles

## 🚀 Usage Examples

### **Add Division Component**
```typescript
export function AddDivisionModal() {
  // Automatically excludes existing managers from Division Manager role users
  const { divisionManagers, loading } = useAvailableDivisionManagers();
  
  return (
    <select>
      <option value="">No Manager</option>
      {divisionManagers.map(manager => (
        <option key={manager.id} value={manager.id}>
          {manager.username} - {manager.abbreviation}
        </option>
      ))}
    </select>
  );
}
```

### **Edit Division Component** 
```typescript
export function EditDivisionModal({ divisionId }) {
  // Includes current manager + available division managers
  const { divisionManagers, loading } = useEditableDivisionManagers(divisionId);
  
  return (
    <select>
      <option value="">No Manager</option>
      {divisionManagers.map(manager => (
        <option key={manager.id} value={manager.id}>
          {manager.username} - {manager.abbreviation}
        </option>
      ))}
    </select>
  );
}
```

## 🔧 Migration Impact

**Before Implementation:**
- ❌ Used Administrator role users as potential division managers
- ❌ Same user could manage multiple divisions
- ❌ Dropdown showed all administrators

**After Implementation:**
- ✅ Uses Division Manager role users as potential division managers
- ✅ One user = one division maximum
- ✅ Dropdown shows only valid division manager options
- ✅ Clear role separation between administrators and division managers

**Breaking Changes:** None - existing divisions with managers remain unchanged.

## 🎉 Result

The system now enforces clean organizational structure where **users with Division Manager role can manage at most one division**, while providing intuitive UX that only shows valid manager options in dropdowns! 🏆 