# Specification: Notification System

## Overview
Implement a notification system that alerts users about important business events such as Certificate of Insurance (COI) expirations, overdue invoices, and project deadlines. Notifications should work offline-first and persist in IndexedDB.

## Functional Requirements

### FR-1: Notification Types
The system must generate notifications for:
- **COI Expiration Alerts**: Warn when certificates of insurance are approaching expiration (7 days before)
- **Overdue Invoice Alerts**: Notify when invoices are past their due date
- **Project Deadline Alerts**: Warn when project end dates are approaching (3 days before)

### FR-2: Notification Storage
- All notifications must be stored in IndexedDB for offline access
- Each notification has: id, type, title, message, entityType, entityId, priority, read, createdAt
- Notifications persist across sessions

### FR-3: Notification Display
- Notification badge in header showing unread count
- Dedicated Notifications page with list view
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications

### FR-4: Notification Generation
- Generate notifications on app load based on current data
- Regenerate when relevant data changes (COI saved, invoice updated, etc.)
- Avoid duplicate notifications for same entity

### FR-5: Priority Levels
- **High**: Overdue invoices, expired COIs
- **Medium**: Upcoming deadlines within threshold
- **Low**: Informational notices

## Non-Functional Requirements

### NFR-1: Performance
- Notification generation should complete in under 500ms
- Badge count should update in real-time

### NFR-2: Offline-First
- All notification operations must work without network connectivity
- Notifications are stored locally in IndexedDB

### NFR-3: Accessibility
- Touch targets minimum 44x44px for outdoor use
- High contrast for visibility in bright sunlight
- Clear visual distinction between read/unread

## Acceptance Criteria

1. User sees notification badge with count of unread notifications
2. User can view all notifications in a list
3. User can mark notifications as read individually or all at once
4. User receives COI expiration warnings 7 days before expiration
5. User receives overdue invoice alerts for invoices past due date
6. User receives project deadline warnings 3 days before end date
7. All notification data persists in IndexedDB
8. Notifications work completely offline

## Out of Scope

- Push notifications (browser or mobile)
- Email notifications
- Notification scheduling/configuration by user
- Notification sound alerts
