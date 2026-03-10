# TRUFFLEUR

## Current State
The app has Orders and Clients pages. Both have Add forms but no way to edit existing records after creation. The Motoko backend only has addClient, addOrder, and addProduct — no update functions exist.

## Requested Changes (Diff)

### Add
- updateClient and updateOrder functions in Motoko backend
- New entries in backend.d.ts for those functions
- useUpdateClient and useUpdateOrder mutation hooks in useQueries.ts
- Edit mode in ClientForm and OrderForm (pre-fill + call update)
- Edit button per order row in Orders page
- Edit button in ClientDetail view in Clients page

### Modify
- ClientForm: accept optional editClient prop
- OrderForm: accept optional editOrder prop
- Orders.tsx: add edit icon per row
- Clients.tsx: add Edit Client button in ClientDetail

### Remove
- Nothing

## Implementation Plan
1. Add updateClient and updateOrder to main.mo
2. Update backend.d.ts with new method signatures
3. Add useUpdateClient and useUpdateOrder to useQueries.ts
4. Update ClientForm to support edit mode
5. Update OrderForm to support edit mode
6. Update Orders.tsx with edit dialog per row
7. Update Clients.tsx ClientDetail with Edit Client dialog
