# TRUFFLEUR

## Current State
The app has a sidebar navigation on desktop (md+) and a top bar on mobile with 7 icons cramped horizontally. Pages use reasonable responsive classes but some grid layouts and dialogs are not optimized for small screens. No bottom navigation exists for mobile.

## Requested Changes (Diff)

### Add
- Bottom navigation bar for mobile (replacing the top icon bar) with the 5 primary items: Dashboard, Clients, Orders, VIP, and a "More" drawer/sheet for Calendar, Products, Reports
- Mobile-safe dialog/sheet behavior: forms should open in a full-height Sheet on mobile, Dialog on desktop

### Modify
- Layout.tsx: remove top bar icon nav on mobile; add a bottom nav bar with labels + icons for the 5 primary routes; keep the desktop sidebar unchanged
- Dashboard.tsx: ensure stats grid and quick actions grid are single-column on very small screens where needed
- Orders.tsx: make status filter tabs scrollable horizontally on mobile
- Clients.tsx: ensure client detail page back button and action buttons are touch-friendly
- ClientForm.tsx / OrderForm.tsx: ensure 2-column grids collapse to 1-column on mobile

### Remove
- Mobile top bar icon-only navigation (confusing on small screens)

## Implementation Plan
1. Update Layout.tsx: remove old mobile header icon nav, add bottom nav bar with labels, add a "More" sheet for secondary nav items
2. Update ClientForm.tsx and OrderForm.tsx: change 2-col grid to single column on mobile (grid-cols-1 sm:grid-cols-2)
3. Update Orders.tsx: add overflow-x-auto to tabs list for mobile
4. Adjust main content padding to account for bottom nav bar on mobile (add pb-20 or similar)
