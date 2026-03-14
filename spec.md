# Truffleur

## Current State
Version 32 introduced a full-page flower-field background across the entire app (body CSS), frosted glass cards, and typewriter date font. All other modules are stable (Orders, Clients, Products, Reports, Suppliers, Expenses, Calendar, VIP).

## Requested Changes (Diff)

### Add
- Daily Sales stat card in Dashboard "At a Glance" section (sum of delivered orders today)
- Reports: date range filter tabs (Today, This Week, This Month, Last 3 Months, All Time)
- Reports: Export CSV button
- Reports: Daily revenue line and profit breakdown section
- Orders: sort active orders by delivery date ascending, history orders by delivery date descending
- OrderForm: client dropdown (Select from existing clients list, or type new)
- OrderForm: product dropdown (Select from Products catalog; auto-fills price from product's basePrice)
- OrderForm: occasion dropdown (Birthday, Anniversary, Corporate, Wedding, Valentine's Day, Christmas, Other)

### Modify
- index.css: Remove `background-image` from body (revert to plain background color). Remove `.bg-card` and `.bg-background` glass overrides.
- Dashboard banner section: Restore banner image (banner-picnic-joy-v2.dim_1400x500.jpg) visible inside the dashboard section's rounded card only
- Dashboard At a Glance: Replace "Today's Deliveries" and "VIP Clients" stat cards with a single "Daily Sales" card styled same as "Weekly Sales"
- PasswordGate: After successful login, redirect to `/orders` using `window.location.replace('/orders')` (unless already on a specific path)
- Reports: Apply selected date filter to monthly revenue chart, top clients, and best products tables

### Remove
- Full-page flower background from body CSS
- Glass overrides from `.bg-card` and `.bg-background`

## Implementation Plan
1. Fix `src/frontend/index.css`: remove background-image from body, remove glass card overrides, keep everything else
2. Update `PasswordGate.tsx`: after successful login, if on root path redirect to `/orders`
3. Update `Dashboard.tsx`: restore banner image, remove todayDeliveries/vipClients stats, add dailySales stat
4. Update `Reports.tsx`: add period filter state + tabs, filter all computed data by period, add export button
5. Update `OrderForm.tsx`: replace client text input with Select dropdown (with option to type new), replace product text input with Select from Products catalog (auto-fills price), replace occasion text input with Select dropdown
6. Update `Orders.tsx`: sort filteredActive by deliveryDate ascending, sort historyOrders by deliveryDate descending
