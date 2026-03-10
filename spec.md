# TRUFFLEUR

## Current State
Version 15 is live. Orders page displays all orders with status filters, add/edit functionality. No export/backup capability exists.

## Requested Changes (Diff)

### Add
- Export button on the Orders page that downloads all current orders as a CSV file
- The CSV includes: order number, client name, product, quantity, occasion, delivery date, address, price, deposit, status, notes

### Modify
- Orders page header: add an Export CSV button next to the Add Order button

### Remove
- Nothing

## Implementation Plan
1. Add `exportOrdersToCSV` utility function in Orders.tsx that converts the orders array to CSV and triggers a download
2. Add Export button in the Orders page header (next to Add Order button)
3. Button is disabled when there are no orders or while loading
4. Frontend-only change -- no backend modifications
