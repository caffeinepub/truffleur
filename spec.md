# Truffleur

## Current State
Calendar page shows orders as events. Orders page lists all orders. There is no way to navigate from a calendar event directly to the corresponding order.

## Requested Changes (Diff)

### Add
- Tap/click on a calendar event (both desktop event pills and mobile detail panel cards, and upcoming sidebar items) navigates to `/orders?highlight=<orderId>`
- Orders page reads `highlight` search param from URL and scrolls to + briefly highlights the matching order row

### Modify
- Calendar.tsx: event pills (desktop), mobile detail panel items, and upcoming sidebar items become clickable and navigate to Orders page with orderId search param
- Orders.tsx: read `highlight` from search params; scroll to and briefly highlight the matching order row
- App.tsx: add `validateSearch` to `ordersRoute` to support `highlight?: string` search param

### Remove
- Nothing removed

## Implementation Plan
1. Add `validateSearch` to `ordersRoute` in App.tsx for `highlight?: string`
2. In Calendar.tsx, use `useNavigate` on event pills, mobile panel items, and upcoming sidebar cards
3. In Orders.tsx, use `useSearch` to read highlight param; scroll to and flash-highlight matching order row
4. Add `data-order-id` attribute to each order row div for scroll targeting
