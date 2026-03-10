# TRUFFLEUR

## Current State
The Calendar page already reads orders and displays delivery dates. Each order has: clientName, productName, deliveryDate, deliveryAddress, isPickup, status, notes, etc. There is no time field on orders. The calendar sidebar shows "clientName — productName" without address or time.

## Requested Changes (Diff)

### Add
- `deliveryTime` field (string, e.g. "14:30") to the Order data model in backend and frontend
- Time input in OrderForm next to the delivery date
- Calendar upcoming sidebar cards now show: date, time, client+product, and address (or "Pickup" if isPickup)
- Calendar day cells show time alongside the event label (when available)

### Modify
- `Order` interface in backend.d.ts: add `deliveryTime: string`
- Motoko backend: add `deliveryTime` parameter to addOrder/updateOrder, store and return it
- OrderForm: add a time input field next to Delivery Date
- Calendar page: update event label/card to include time and address
- useQueries hooks: pass `deliveryTime` through addOrder/updateOrder mutations

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend to include `deliveryTime` on Order
2. Update `backend.d.ts` to add `deliveryTime: string` to Order interface and update addOrder/updateOrder signatures
3. Update `useQueries` hooks to include `deliveryTime` in mutations
4. Update `OrderForm` to include a time field
5. Update `Calendar` page to show time and address in events and upcoming sidebar
