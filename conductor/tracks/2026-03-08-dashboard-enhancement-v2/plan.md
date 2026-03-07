# Implementation Plan

## Phase 1: Dashboard Stats Component
- [x] Create `DashboardStats` component to display item counts
- [x] Add tests for `DashboardStats` component
- [x] Integrate stats into Home component
- [x] Style with high-contrast card layout

## Phase 2: COI Expiration Alerts
- [x] Create `ExpiringCOIs` component to show COIs expiring within 30 days
- [x] Add utility function to filter COIs by expiration date range
- [x] Add tests for expiration filtering logic
- [x] Add tests for `ExpiringCOIs` component
- [x] Integrate into Home component with warning styling

## Phase 3: Recent Activity Feed
- [x] Create `RecentTasks` component to show 5 most recent tasks
- [x] Create `RecentWaivers` component to show 3 most recent waivers
- [x] Add tests for both components
- [x] Integrate both into Home component
- [x] Style with consistent card layout

## Phase 4: Refactor and Polish
- [x] Extract shared card styles to CSS classes (address TD-001)
- [x] Ensure responsive design on mobile devices
- [x] Add loading states for async data
- [x] Verify all components follow rugged UX principles

## Phase 5: Testing and Verification
- [x] Run full test suite
- [x] Verify test coverage >80%
- [x] Run production build
- [x] Run lint check
- [x] Manual testing in browser

## Checkpoints
- [x] Phase 1 Complete: Stats display correctly
- [x] Phase 2 Complete: Expiring COIs show with warnings
- [x] Phase 3 Complete: Recent items display correctly
- [x] Phase 4 Complete: Polished UI with shared styles
- [x] Phase 5 Complete: All tests pass, build succeeds
