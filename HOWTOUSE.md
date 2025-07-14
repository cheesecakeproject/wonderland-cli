# HOW TO USE WONDERLAND CLI

## Table of Contents
1. [Introduction](#introduction)
2. [Concept & Architecture](#concept--architecture)
3. [Installation & Setup](#installation--setup)
4. [Quick Start](#quick-start)
5. [Core Features](#core-features)
6. [Command Reference](#command-reference)
7. [Advanced Usage](#advanced-usage)
8. [Open Source & Extensibility](#open-source--extensibility)
9. [Legal & Safety](#legal--safety)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

**Wonderland CLI** is an extensible, open-source AI agent framework for orchestrating multi-brain, production-ready conversational workflows. By decoupling agent logic from infrastructure, Wonderland CLI empowers teams to collaborate seamlessly as they build, manage, and deploy advanced AI-powered research and automation pipelines.

---

## Concept & Architecture

- **Multi-Brain System:** Wonderland CLI uses a main agent and multiple specialized "brain" agents that can work in parallel, collaborate, and critique each other.
- **Agent Bus:** All agents communicate via a shared in-memory status bus, enabling real-time visibility and coordination.
- **Plugin Architecture:** Add new brain agents or tools as plugins without changing the core codebase.
- **Task Assignment:** Tasks can be assigned manually or automatically to the best-suited brain agent based on specialty.
- **Session Logging:** Every session is logged for replay, analytics, and auditability.
- **Resource Awareness:** The system monitors CPU/memory and throttles or interrupts agents as needed.

---

## Installation & Setup

### Prerequisites
- Node.js >= 16
- Ollama (for local AI model serving)

### Install
```bash
npm install -g wonderland-cli
```

### One-Step Setup (Recommended)
```bash
wonderland -setup4u
```
This will run all setup steps automatically, including configuration, model checks, and plugin initialization.

### Manual Setup
```bash
wonderland setup
```
Follow the interactive prompts to configure agents, models, and preferences.

---

## Quick Start

Ask a question:
```bash
wonderland ask "What is the capital of France?"
```

Start a multi-brain research session:
```bash
wonderland ask "Research AI trends and machine learning applications" --multi-brain
```

Replay a session:
```bash
wonderland replay -l
```

---

## Core Features

- **Multi-Brain Architecture:** Main Agent + multiple Brain Agents
- **Real-Time Brain-to-Brain Visibility:** See all agents' thinking live
- **Parallel Research:** Assign multiple brains to different tasks at once
- **Dynamic Brain Assignment:** Add, edit, retire, and specialize brain agents on demand
- **Brain Specialization:** Assign specialties (web, math, code, etc.) to each brain
- **Live Brain Status Dashboard:** Real-time dashboard with visual indicators
- **Collaborative Brain Discussion:** Brains critique and refine answers together
- **Plugin Brains:** Add custom Brain Agents as plugins
- **Interrupt & Reassign:** Interrupt any agent and reassign tasks (manual or automatic)
- **Session Replay:** Replay any session with real-time agent thinking
- **Resource-Aware Scheduling:** Monitors memory, CPU, and agent usage; throttles as needed
- **Content Awareness & User Query Tool:** Agents can ask you for clarification in real time
- **Advanced Analytics Dashboard:** View usage stats and dashboards
- **Auto-Update Checker:** Notifies you of new versions
- **Comprehensive Legal Protection:** Expanded legal documents for maximum safety

---

## Command Reference

| Command | Description |
|---------|-------------|
| `wonderland -setup4u` | One-step automatic setup |
| `wonderland setup` | Configure your agents |
| `wonderland ask <prompt>` | Ask a question |
| `wonderland dashboard` | Live brain status dashboard |
| `wonderland replay` | Replay a session with real-time agent thinking |
| `wonderland resources` | Show system resource usage and scheduling status |
| `wonderland interrupt` | Interrupt and reassign brain agent tasks |
| `wonderland reassign` | Reassign specific interrupted tasks |
| `wonderland auto-reassign` | Auto-reassign all interrupted tasks |
| `wonderland auto-interrupt` | Automatically interrupt agents based on conditions |
| `wonderland chat` | Start interactive chat mode |
| `wonderland serve [--port <port>]` | Run as local API server |
| `wonderland analytics` | Show usage analytics |
| `wonderland export --format <markdown|json|pdf>` | Export session log |
| `wonderland --help` | Show help |

---

## Advanced Usage

### Multi-Brain Research
```bash
wonderland ask "Research AI trends and machine learning applications" --multi-brain
```

### Interrupt & Reassign
```bash
wonderland interrupt
wonderland auto-reassign
wonderland auto-interrupt --time 180
```

### Session Replay
```bash
wonderland replay -l
wonderland replay -f session-1234567890.json -s fast
```

### Resource Monitoring
```bash
wonderland resources
wonderland resources -m -i 5
```

### Content Awareness
```bash
# Agent asks you for clarification during a session
/usetool=askuser?"Can you clarify your request?"
```

### API Server Mode
```bash
wonderland serve --port 3000
# POST /ask { "prompt": "your question" }
```

### Analytics Dashboard
```bash
wonderland analytics
```

---

## Open Source & Extensibility

- **Plugin System:** Easily add new brain agents or tools as plugins.
- **Custom Brains:** Develop and integrate your own specialized agents.
- **Community Contributions:** Fork, contribute, and collaborate on GitHub.
- **Decoupled Logic:** Agent logic is separated from infrastructure for maximum flexibility.
- **MIT Licensed:** Free for personal and commercial use.

---

## Legal & Safety

- **Comprehensive Legal Documents:** See the `legaldocuments/` directory for all terms, disclaimers, and privacy policies.
- **User Responsibility:** All risks and responsibilities are yours alone. See the Final Legal Summary for details.
- **No Data Collection:** All data is processed locally; no tracking or analytics.

---

## Troubleshooting

- **Ollama Not Running:** Ensure Ollama is installed and running locally.
- **No Models Found:** Use `wonderland models` to list and pull models.
- **Permission Issues:** Run CLI as an administrator if you encounter file access errors.
- **Reset Everything:** Use `wonderland -danger -settings -reset` to factory reset.
- **More Help:** Use `wonderland --help` or see the README for more info.

---

**Made with ❤️ by the Chezcake Team** 