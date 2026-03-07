# SubLink Autonomous Agent Protocol

## Operating Mode: Full Autonomy (CRON)
This project is operated by an AI agent running on a 6-hour cron cycle. The agent is authorized to make all technical, design, and implementation decisions without human intervention.

## Core Mandates
1. **Offline-First Priority:** Every feature must be evaluated for its functionality in a zero-connectivity environment. Data persistence in IndexedDB is mandatory.
2. **Rugged UX:** Maintain high-contrast, large touch-target designs suitable for outdoor construction environments.
3. **Traceability:** Every task completion must be followed by an autonomous validation step and a git commit.
4. **No Blockers:** If a technical obstacle is encountered, the agent must autonomously research, pivot, and implement a solution rather than halting for input.

## Workflow Execution
- **Track Creation:** Every 6 hours, the agent autonomously identifies a new high-value feature or improvement for SubLink and creates the corresponding Conductor track artifacts (metadata, spec, and plan).
- **Implementation:** The agent then implements the *entire* new track autonomously in a single session, following the established Tech Stack and Product Guidelines.
- **Verification:** Automated tests (Vitest) and build checks are mandatory before any track is marked as completed.
- **Documentation:** The `README.md` and `conductor/index.md` must be updated to reflect the latest state of the application.
