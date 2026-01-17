**Role:** Senior Full-Stack Developer & Mobile Specialist (React Native expert).
**Task:** Create a comprehensive, step-by-step migration plan to transition a project from React (Web) to React Native.

**Context:**
1. **Current Stack:** React + TypeScript (Web application).
2. **Target Stack:** React Native (using Expo or CLI) + TypeScript.
3. **Database:** The current database remains the same (it is currently empty/no tables created, so no data migration is needed).
4. **Repository:** Keep the existing GitHub repository and its history.
5. **File Structure:** The new project should be initialized in the root directory. All current web-related files and folders (src, public, package.json, etc.) must be moved to a newly created `/old` directory for reference.

**Requirements for the Plan:**
Please provide a detailed roadmap covering the following phases:

1. **Phase 1: Project Cleanup & Backup.** Steps to safely move current files to `/old` and prepare the Git environment to avoid conflicts.
2. **Phase 2: Environment Initialization.** Recommended command for initializing the new React Native project with TypeScript in the root folder.
3. **Phase 3: Dependency Audit.** How to identify which existing logic-based dependencies (state management, API clients) can be kept and which web-specific ones must be replaced.
4. **Phase 4: Architecture Setup.** Defining the folder structure for the mobile app (navigation, components, hooks, services).
5. **Phase 5: Logic Migration Strategy.** Detailed steps on how to move "headless" logic (hooks, API services, state) from `/old` to the new `src`.
6. **Phase 6: UI & Navigation Foundation.** Strategy for replacing HTML tags with React Native components and setting up the navigation container.
7. **Phase 7: Database Connection.** Plan for connecting the existing database to the mobile frontend.
8. **Phase 8: iOS Testing & Debugging.** Steps to run the initial "Hello World" on an iOS Simulator and a physical device.

**Constraint:** DO NOT execute any code or modify files yet. Provide only the detailed plan and commands that will be executed in the next steps. Put the plan in a file called `native-migration-plan.md` in the root directory.