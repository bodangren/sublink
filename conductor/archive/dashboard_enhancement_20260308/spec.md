# Specification: Dashboard Enhancement

## Problem Statement
The current home/dashboard screen is minimal and underutilized. Users must navigate to individual sections to see important information like:
1. **Expiring COIs** - No visibility into which certificates are expiring soon
2. **Recent Activity** - No quick view of recent tasks or waivers
3. **Quick Stats** - No overview of total items in each category
4. **Actionable Alerts** - No proactive notifications for critical items

This requires multiple clicks and navigation to get a simple status overview, which is inefficient for field workers who need quick access to information.

## Goals
- Transform the dashboard into an information-rich command center
- Surface critical information immediately upon opening the app
- Reduce clicks needed to access common actions
- Provide visual indicators for items requiring attention (expiring COIs, active tasks)
- Maintain the "rugged UX" principle with high-contrast, large touch targets

## Non-Goals
- Real-time push notifications (would require backend infrastructure)
- Complex analytics or charts
- User authentication or multi-user features
- Data synchronization status (future feature)

## Success Criteria
- [x] Dashboard displays count of items in each category (tasks, waivers, COIs)
- [x] Dashboard shows COIs expiring within 30 days with visual warning
- [x] Dashboard shows 5 most recent tasks with quick navigation
- [x] Dashboard shows 3 most recent waivers with quick navigation
- [x] All dashboard elements use consistent card-based layout
- [x] All components are tested with >80% coverage
- [x] Production build succeeds
- [x] Lint passes with zero errors
- [x] Mobile-first responsive design maintained
