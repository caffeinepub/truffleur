# TRUFFLEUR — Phase 2

## Current State
Phase 1 is complete. The app has:
- Dashboard with stats and quick actions (Products/Calendar/Reports shown as disabled "Phase 2" buttons)
- Clients page with full CRM functionality
- Orders page with status management
- Layout with sidebar nav (Dashboard, Clients, Orders)

## Requested Changes (Diff)

### Add
- `/vip` route: VIP Clients page — filtered view of clients with isVip=true, showing VIP badge, total spend, order history, and special notes. Auto-assigns VIP based on total spend threshold (e.g. 50,000 MKD). Allow manually toggling VIP status.
- `/calendar` route: Calendar/Reminders page — monthly calendar view showing birthdays, anniversaries, scheduled deliveries, and custom reminders. Each day shows colored event dots. Sidebar lists upcoming events within 30 days.
- `/products` route: Products page — product catalog with name, category (Truffles, Flowers, Gift Boxes, Seasonal), price, cost, and profit calculation. Add/Edit/Delete products. Show profit margin per item.
- `/reports` route: Reports page — business insights: total revenue, top 5 clients by spend, best-selling products, order status breakdown chart, monthly revenue trend.

### Modify
- Layout: Add VIP, Calendar, Products, Reports to sidebar nav and mobile nav
- Dashboard: Enable the 4 quick action buttons (Products, Calendar, Reports) and add a VIP shortcut, removing the "Phase 2" disabled state
- App.tsx: Register the 4 new routes

### Remove
- "Phase 2" disabled badges from Dashboard quick action buttons

## Implementation Plan
1. Create `/src/frontend/src/pages/VipClients.tsx` — pulls clients, filters VIP, shows profiles with spend and actions
2. Create `/src/frontend/src/pages/CalendarPage.tsx` — monthly grid, event dots, upcoming sidebar, sample reminders seeded from existing client birthdays/anniversaries
3. Create `/src/frontend/src/pages/Products.tsx` — product list with add/edit/delete, profit calc
4. Create `/src/frontend/src/pages/Reports.tsx` — charts (BarChart for revenue, PieChart for order status), top clients table, best sellers list
5. Update `App.tsx` — add 4 routes
6. Update `Layout.tsx` — add nav links for all 4 pages
7. Update `Dashboard.tsx` — wire quick action buttons to new routes
