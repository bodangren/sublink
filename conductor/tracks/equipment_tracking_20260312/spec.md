# Specification: Equipment Tracking

## Overview
Implement an equipment tracking system that allows subcontractors to manage their tools and equipment, track which job site each piece of equipment is assigned to, schedule maintenance reminders, and track equipment value for insurance purposes. All data stored offline-first in IndexedDB.

## Functional Requirements

### FR-1: Equipment Records
The system must store equipment with:
- **Basic Info:** Name, description, category (power tool, hand tool, heavy equipment, safety gear, vehicle, other)
- **Identification:** Serial number, model number, purchase date, purchase price
- **Assignment:** Current project/location, assigned date
- **Maintenance:** Last maintenance date, next maintenance date, maintenance notes
- **Status:** Active, in repair, retired/lost

### FR-2: Equipment Categories
Predefined categories with icons:
- Power Tools
- Hand Tools
- Heavy Equipment
- Safety Gear
- Vehicles
- Other

### FR-3: Equipment Assignment
- Assign equipment to a project
- Track assignment history
- Unassign equipment (return to inventory)
- View all equipment at a project

### FR-4: Maintenance Tracking
- Set maintenance intervals (e.g., every 30 days, 90 days, annually)
- Automatic notifications when maintenance is due
- Log maintenance activities with date and notes
- View maintenance history per equipment

### FR-5: Equipment List Views
- All equipment list with filtering by category, status, project
- Equipment at specific project (from project detail page)
- Equipment needing maintenance
- Equipment value summary (total for insurance purposes)

### FR-6: Integration Points
- Link equipment to projects (show in project detail)
- Maintenance notifications integrate with notification system
- Dashboard widget showing equipment needing attention

## Non-Functional Requirements

### NFR-1: Performance
- Equipment list should load in under 200ms
- Search/filter should be instant

### NFR-2: Offline-First
- All equipment operations work without network
- Data persists in IndexedDB

### NFR-3: Accessibility
- Touch targets minimum 44x44px
- High contrast for outdoor visibility
- Clear status indicators

## Acceptance Criteria

1. User can add new equipment with all required fields
2. User can edit equipment details
3. User can assign equipment to a project
4. User can view all equipment in a list with filtering
5. User can view equipment assigned to a specific project
6. User receives notifications when equipment maintenance is due
7. User can log maintenance activities
8. User can view total equipment value for insurance
9. All data persists in IndexedDB
10. Feature works completely offline

## Out of Scope

- Equipment photos (can be added later)
- Equipment checkout/check-in for crew members
- Equipment depreciation calculations
- Integration with accounting software
