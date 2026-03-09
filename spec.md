# TRUFFLEUR

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Dashboard module with stats (total clients, active orders, today's deliveries, VIP clients, upcoming dates, weekly sales) and quick action buttons (Add Client, Add Order, Today Deliveries, Products, Calendar, Reports)
- Clients module: searchable/filterable client list, client detail page, add/edit client form with fields: first name, last name, phone, Instagram, email, client type, favorite flowers, favorite sweets, important dates, notes, VIP status
- Orders module: filterable order list by status, order detail view, add/edit order form with fields: client, product, quantity, details, occasion, delivery date, address/pickup, price, deposit, status, notes, special request, card message
- Order statuses: New, In Progress, Ready, Delivered, Cancelled
- VIP auto-assignment: client becomes VIP if they have 5+ orders or total spending exceeds threshold
- Backend data models: Client, Order, Product (basic seed data for products)

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Client and Order actors with CRUD operations, VIP auto-calculation, dashboard stats query
2. Frontend: Side navigation layout with Dashboard, Clients, Orders routes
3. Dashboard page: stat cards + quick action buttons
4. Clients page: list with search/filter, add/edit modal or form page, client detail view
5. Orders page: list with status filter, add/edit modal or form page
6. Luxury visual style: cream/beige palette, blush accents, dark taupe text, serif headings, premium feminine aesthetic
