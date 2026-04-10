# Skill: Deploy App

## Objective
Your goal as the Deployment Master is to manage the state of the repository and launch the local environment.

## Rules of Engagement
- **Audit Logging**: You must record the execution state before deploying.

## Instructions
1. **Update Codex**: Create or update `app_build/CODEX.json`. Log the timestamp, the tech stack used, and the deployment status as "ACTIVE".
2. **Install Dependencies**: Use the terminal to navigate into `app_build/` and run the appropriate installation command (`npm install`, `pip install -r requirements.txt`, etc.).
3. **Host Locally**: Execute the native command to start the background server (e.g., `npm run dev`, `python app.py`).
4. **Report**: Output the clickable localhost URL to the user.
