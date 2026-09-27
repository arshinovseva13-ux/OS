# Paragon OS

An interactive, local-first operating space for planning work, keeping context, and running repeatable routines in a desktop browser.

## Run

Requires Node.js 20 or newer. No packages need to be installed.

```sh
node server.mjs
```

Open <http://127.0.0.1:4173>. Set `PORT` to use a different port. `npm start` runs the same server.

## What is inside

- **Spaces** separate projects and their tasks, notes, routines, and activity.
- **Workboard** tracks tasks across planned, in motion, and complete stages. Cards can be edited or dragged between stages.
- **Field notes** auto-save as you type and support search and pinning.
- **Routines** are reusable sequences that create tasks or notes and log updates in the current space.
- **Agent desk** prepares a structured brief for an external AI agent, using the current space's open tasks and pinned notes. The brief can be copied or added to the workboard. No data is sent automatically.
- **Focus** runs a persistent timer and logs completed sessions.
- **Activity** records meaningful workspace changes.
- **System settings** include light/dark appearance and JSON snapshot export, import, and reset.

Use **Ctrl/Cmd+K** for the command center, **Alt+1** through **Alt+7** to switch views, and **Escape** to close overlays. All workspace state is stored in browser `localStorage`.
