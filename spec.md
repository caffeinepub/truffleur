# Truffleur

## Current State
Backend uses non-stable in-memory Maps and counters for clients, orders, and products. Data is wiped on every canister upgrade/redeployment.

## Requested Changes (Diff)

### Add
- Stable arrays for clients, orders, and products to persist across upgrades
- preupgrade and postupgrade system hooks
- Stable counters

### Modify
- Convert in-memory Maps to be rebuilt from stable arrays on startup

### Remove
- Nothing

## Implementation Plan
1. Add stable arrays for all three data types
2. Add stable counters
3. Add preupgrade/postupgrade hooks
