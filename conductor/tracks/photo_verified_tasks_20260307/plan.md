# Implementation Plan: Photo-Verified Tasks

## Phase 1: Database Layer
**Goal:** Extend IndexedDB schema for tasks and photos

- [x] Write tests for task CRUD operations in db.ts
- [x] Write tests for photo CRUD operations in db.ts
- [x] Add Task and TaskPhoto types to SubLinkDB schema
- [x] Increment DB version and add object stores
- [x] Implement saveTask, getTasks, updateTask, deleteTask functions
- [x] Implement savePhoto, getPhotosByTask, deletePhotosByTask functions
- [x] Run tests and verify coverage >90%

## Phase 2: Task Management UI
**Goal:** Create task list and form components

- [x] Write tests for TaskForm component
- [x] Write tests for TaskList component
- [x] Create TaskForm component with title, description, contract reference fields
- [x] Create TaskList component displaying all tasks with photo counts
- [x] Add routing for /tasking/new and /tasking/:id
- [x] Implement task creation flow
- [x] Implement task editing flow
- [x] Implement task deletion with confirmation
- [x] Run tests and verify coverage >90%

## Phase 3: Photo Capture & Watermarking
**Goal:** Implement camera capture with GPS watermarking

- [x] Write tests for watermark utility function
- [x] Write tests for GPS utility functions
- [x] Create watermark utility that burns GPS/timestamp into image
- [x] Create GPS utility for fetching coordinates with fallback
- [x] Write tests for PhotoCapture component
- [x] Create PhotoCapture component with camera access
- [x] Implement photo capture with automatic watermarking
- [x] Handle GPS permission and camera permission gracefully
- [x] Run tests and verify coverage >90%

## Phase 4: Task Detail & Photo Gallery
**Goal:** Display tasks with associated photos

- [x] Write tests for TaskDetail component
- [x] Write tests for PhotoGallery component
- [x] Create TaskDetail component showing task info and photos
- [x] Create PhotoGallery component for photo display
- [x] Implement full-screen photo view
- [x] Add photo count indicator on task cards
- [x] Run tests and verify coverage >90%

## Phase 5: Integration & Polish
**Goal:** Finalize UI/UX and verify offline functionality

- [x] Update App.tsx navigation and routes
- [x] Add "Take Photo" quick action on home screen
- [x] Test full offline workflow
- [x] Verify high-contrast styling for outdoor use
- [x] Run full test suite
- [x] Run production build
- [x] Update README.md with new feature
