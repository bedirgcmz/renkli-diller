# Home UX Polish Tasks

## Goal

Make the main app flow feel immediately understandable.

The home screen should answer:

- What should I do first?
- What can I do next with my learning list?

The app should avoid the "empty product" feeling when a new user opens practice
screens before building a learning list.

## UX Direction

### 1. Home Has Two Modes

- `Learning list empty`
- `Learning list ready`

### 2. Empty Users See Setup Guidance

Primary intent:

- build a learning list first

Main entry points:

- explore categories
- generate sentences with AI
- add a sentence manually

### 3. Ready Users See Practice Guidance

Primary intent:

- practice with their own learning list

Main practice group:

- Learn
- Listening
- Quiz
- Build
- Auto

Secondary exploration group:

- Reading
- Dialog
- Games
- Explore

### 4. Screen-Level Empty States Must Guide

Practice screens should not feel broken when the learning list is empty.

Each should explain its purpose and offer clear actions:

- go to Sentences
- explore categories
- open AI Translator

## Implementation Tasks

### Task 1

Create and commit this task plan file.

### Task 2

Redesign `HomeScreen` so it:

- detects whether the user has a learning list
- shows a setup-first layout for empty users
- shows a practice-first layout for ready users
- groups practice modes together
- moves exploration features below the main action area
- updates copy to emphasize "your learning list" rather than a generic ready-made list

### Task 3

Improve empty states for:

- `LearnScreen`
- `QuizScreen`
- `BuildSentenceScreen`

Requirements:

- custom message per screen
- CTA buttons that help the user recover
- no dead-end blank feeling

## Guardrails

- Keep changes incremental and easy to review.
- Preserve existing navigation behavior.
- Do not introduce regressions in auth, offline flow, or store hydration.
- Commit after each task is completed.
