# Wonderland CLI Command Reference (Full)

This document lists every Wonderland CLI command, subcommand, option, and flag. For each, you’ll find a description, usage, and example. Use this as your definitive reference for all CLI features.

---

## Global Options

- `-setup4u`  
  **Description:** Run the setup.sh script automatically for you (one-step setup).
  **Usage:**
  ```sh
  wonderland -setup4u
  ```

---

## Core Commands

### `wonderland setup`
- **Description:** Walk through configuration options interactively.
- **Usage:**
  ```sh
  wonderland setup
  ```

### `wonderland ask <prompt...>`
- **Description:** Ask your multi-brain agent a question or prompt.
- **Options:**
  - `-v, --verbose` — Show detailed workflow
  - `-n, --no-log` — Disable logging
  - `-i, --incommandprompt <prompt>` — Test with a specific prompt
  - `--multi-brain` — Enable multi-brain parallel research
  - `--manual-assign` — Manually assign sub-tasks to brain agents
- **Usage:**
  ```sh
  wonderland ask "What is the capital of France?"
  wonderland ask "Research AI trends" --multi-brain
  ```

### `wonderland dashboard`
- **Description:** View a live status dashboard of all brains and agents.
- **Usage:**
  ```sh
  wonderland dashboard
  ```

### `wonderland status`
- **Description:** Show current configuration and Ollama status.
- **Usage:**
  ```sh
  wonderland status
  ```

### `wonderland logs`
- **Description:** View recent session logs.
- **Options:**
  - `-n, --number <count>` — Number of recent logs to show (default: 5)
- **Usage:**
  ```sh
  wonderland logs -n 10
  ```

### `wonderland replay`
- **Description:** Replay a previous session.
- **Options:**
  - `-f, --file <filename>` — Specific session file to replay
  - `-l, --latest` — Replay the latest session
  - `-s, --speed <speed>` — Replay speed (slow, normal, fast; default: normal)
- **Usage:**
  ```sh
  wonderland replay -l
  wonderland replay -f session-1234567890.json -s fast
  ```

### `wonderland export`
- **Description:** Export session logs.
- **Options:**
  - `--format <format>` — Export format: markdown, json, or pdf (default: markdown)
  - `--output <file>` — Output file name
- **Usage:**
  ```sh
  wonderland export --format pdf --output report.pdf
  ```

### `wonderland resources`
- **Description:** Show system resource usage and agent scheduling.
- **Options:**
  - `-m, --monitor` — Continuous monitoring mode
  - `-i, --interval <seconds>` — Monitoring interval in seconds (default: 5)
- **Usage:**
  ```sh
  wonderland resources -m -i 10
  ```

### `wonderland analytics`
- **Description:** View usage stats and analytics dashboards.
- **Usage:**
  ```sh
  wonderland analytics
  ```

### `wonderland chat`
- **Description:** Start an interactive chat session with Wonderland CLI.
- **Usage:**
  ```sh
  wonderland chat
  ```

### `wonderland serve`
- **Description:** Run Wonderland CLI as a local API server.
- **Options:**
  - `--port <port>` — Port to run the server on (default: 3000)
- **Usage:**
  ```sh
  wonderland serve --port 4000
  ```

---

## Brain Agent Management

### `wonderland brain add`
- **Description:** Add a new brain agent dynamically.
- **Usage:**
  ```sh
  wonderland brain add
  ```

### `wonderland brain edit`
- **Description:** Edit a brain agent specialty.
- **Usage:**
  ```sh
  wonderland brain edit
  ```

### `wonderland brain remove`
- **Description:** Remove a brain agent dynamically.
- **Usage:**
  ```sh
  wonderland brain remove
  ```

---

## Interrupt & Reassign

### `wonderland interrupt`
- **Description:** Interrupt a brain agent and reassign their task.
- **Options:**
  - `-a, --auto` — Automatically reassign based on specialty matching
  - `-m, --manual` — Manually select new agent for reassignment
- **Usage:**
  ```sh
  wonderland interrupt -a
  wonderland interrupt -m
  ```

### `wonderland reassign`
- **Description:** Reassign an interrupted task to a new agent.
- **Usage:**
  ```sh
  wonderland reassign
  ```

### `wonderland auto-reassign`
- **Description:** Automatically reassign all interrupted tasks based on specialty matching.
- **Usage:**
  ```sh
  wonderland auto-reassign
  ```

### `wonderland auto-interrupt`
- **Description:** Automatically interrupt agents based on time limits or performance.
- **Options:**
  - `-t, --time <seconds>` — Maximum time limit in seconds (default: 300)
- **Usage:**
  ```sh
  wonderland auto-interrupt -t 180
  ```

---

## Plugin Management

### `wonderland plugin add <path>`
- **Description:** Add (install) a plugin from a local path.
- **Usage:**
  ```sh
  wonderland plugin add ./my-plugin.js
  ```

### `wonderland plugin list`
- **Description:** List all installed plugins.
- **Usage:**
  ```sh
  wonderland plugin list
  ```

### `wonderland plugin remove <name>`
- **Description:** Remove a specific plugin.
- **Usage:**
  ```sh
  wonderland plugin remove csv-to-markdown
  ```

---

## Model Management

### `wonderland models list`
- **Description:** List all available models.
- **Usage:**
  ```sh
  wonderland models list
  ```

### `wonderland models pull <model>`
- **Description:** Pull (download) a model.
- **Usage:**
  ```sh
  wonderland models pull llama2
  ```

### `wonderland models use <model>`
- **Description:** Set the active model for agents.
- **Usage:**
  ```sh
  wonderland models use codellama
  ```

---

## Template Management

### `wonderland template save <name> <prompt>`
- **Description:** Save a new prompt template.
- **Usage:**
  ```sh
  wonderland template save greeting "Hello, how can I help you?"
  ```

### `wonderland template use <name>`
- **Description:** Use a saved prompt template.
- **Usage:**
  ```sh
  wonderland template use greeting
  ```

### `wonderland template list`
- **Description:** List all saved prompt templates.
- **Usage:**
  ```sh
  wonderland template list
  ```

### `wonderland template remove <name>`
- **Description:** Remove a saved prompt template.
- **Usage:**
  ```sh
  wonderland template remove greeting
  ```

---

## Persona Management

### `wonderland persona list`
- **Description:** List available agent personalities.
- **Usage:**
  ```sh
  wonderland persona list
  ```

### `wonderland persona set <personality>`
- **Description:** Set the active agent personality.
- **Usage:**
  ```sh
  wonderland persona set creative
  ```

### `wonderland persona custom [prompt] [--reset]`
- **Description:** Manage a custom personality prompt.
- **Options:**
  - `--reset` — Reset custom personality to default
- **Usage:**
  ```sh
  wonderland persona custom "You are a helpful assistant."
  wonderland persona custom --reset
  ```

---

## Dangerous/Reset Command

### `wonderland -danger -settings -reset`
- **Description:** Danger: Factory reset all Wonderland CLI settings, logs, and plugins.
- **Usage:**
  ```sh
  wonderland -danger -settings -reset
  ```

---

## Help & Info

### `wonderland help`
- **Description:** Show help for any command.
- **Usage:**
  ```sh
  wonderland help
  ```

### `wonderland --version`
- **Description:** Display the current version of Wonderland CLI.
- **Usage:**
  ```sh
  wonderland --version
  ```

---

For more details and advanced usage, see the [HOWTOUSE.md](https://github.com/cheesecakeproject/wonderland-cli/blob/main/HOWTOUSE.md). 