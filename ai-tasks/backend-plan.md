**Context:**
You are a Senior Full-Stack Architect auditing a React/TypeScript codebase for a fitness application. Currently, the application runs on "Mock Data" (hardcoded arrays, static objects, and fixed strings) for demonstration purposes.

**Objective:**
Analyze the entire codebase to identify all hardcoded elements that represent **User Data** or **Dynamic Content**. Do **NOT** modify any code. Your goal is to generate a comprehensive **Migration Report** and a **Database Schema Proposal**.

**Instructions:**

1. **Scan the Codebase:**
* Look for static arrays (e.g., `const exercises = [...]`, `const history = [...]`).
* Look for hardcoded user profile data (e.g., specific names, weights, goals).
* Look for hardcoded legal text or long descriptions (Terms of Service, Privacy Policy).
* Look for static logic that implies database relationships (e.g., "Premium" checks hardcoded as `true`).


2. **Generate a Report (Markdown Format):**
**Section A: Hardcoded Data Inventory**
Create a table with the following columns:
* **File/Component:** Where the hardcoded data lives.
* **Variable/Content:** Name of the variable or description of the content.
* **Data Category:** (e.g., Exercise Library, User Profile, Workout Log, App Config).
* **Proposed DB Table:** Where this should live in the database.


**Section B: Database Schema Proposal**
Based on the inventory, design a relational schema (SQL-friendly) or Document structure (NoSQL) that covers:
* **Users:** (Profile, Settings, Auth).
* **Content:** (Exercises, Templates - distinction between System default and User created).
* **Activity:** (Sessions, Logs, Sets).
* **Meta:** (Tags, Categories).
* *Include key fields and relationships (Foreign Keys).*


**Section C: External Assets & Text**
* List any hardcoded URLs (images, videos).
* List long text blocks that should be moved to a CMS or remote config (e.g., Legal documents, FAQs).


**Section D: Migration Action Plan**
Provide a step-by-step plan to transition from this static state to a dynamic app.
* Phase 1: DB Setup.
* Phase 2: API / Data Fetching Layer creation.
* Phase 3: Component Refactoring (replacing mocks with hooks).



**Constraints:**

* **READ-ONLY:** Do not refactor or delete any code.
* **Focus:** Distinguish between UI Labels (which belong in i18n files) and Content (which belongs in the DB). Focus on the Content.

