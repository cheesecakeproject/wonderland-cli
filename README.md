# Wonderland CLI 1.3.0 🧠

[Official Website](https://wonderland-cli-v1.vercel.app/)
[Release Notes for v1.3.0](releasenotes/v.1.3.0/note.md)

![Wonderland CLI Thumbnail](https://github.com/cheesecakeproject/wonderland-cli/blob/main/images/thumbnail.png)

[![npm version](https://img.shields.io/npm/v/wonderland-cli)](https://www.npmjs.com/package/wonderland-cli)
[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/cheesecakeproject/wonderland-cli/tree/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos/)
[![Ollama](https://img.shields.io/badge/ollama-required-orange.svg)](https://ollama.ai/)

---

## 🚀 Quick Start

```bash
npm install -g wonderland-cli
wonderland setup
wonderland ask "What is the capital of France?"
```

---

## 🌟 Features

### Multi-Brain & Real-Time AI
- **Multi-Brain Architecture**: Main Agent and multiple Brain Agents
- **Real-Time Brain-to-Brain Visibility**: See all agents' thinking live
- **Parallel Research**: Assign multiple brains to different tasks at once
- **Dynamic Brain Assignment**: Add, edit, retire, and specialize brain agents on demand
- **Brain Specialization**: Assign specialties (web, math, code, etc.) to each brain
- **Live Brain Status Dashboard**: Real-time dashboard with visual indicators
- **Collaborative Brain Discussion**: Brains critique and refine answers together
- **Plugin Brains**: Add custom Brain Agents as plugins

### Advanced Control & Scheduling
- **Interrupt & Reassign**: Interrupt any agent and reassign tasks (manual or automatic)
- **Session Replay**: Replay any session with real-time agent thinking
- **Resource-Aware Scheduling**: Monitors memory, CPU, and agent usage; throttles as needed
- **Content Awareness & User Query Tool**: Agents can ask you for clarification in real time

### CLI & Usability
- **Beautiful CLI**: Minimal, clean UI with progress bars and spinners
- **Comprehensive Logging**: Every session is logged for analytics and replay
- **Session Export**: Export logs to markdown, JSON, or PDF
- **Interactive Chat Mode**: REPL-style chat with enhanced UI
- **API Server Mode**: Run as a local HTTP API server
- **Advanced Analytics**: View usage stats and dashboards
- **Plugin System**: Add, list, and remove custom tools/brains
- **Model Management**: List, pull, and set Ollama models
- **Prompt Templates**: Save, use, and manage prompt templates
- **Agent Personalities**: Switch between friendly, strict, creative, or custom personalities
- **Auto-Update Checker**: Notifies you of new versions
- **Dangerous Reset**: Factory reset all settings, logs, and plugins

---

## 📋 Commands (Essentials)

| Command | Description |
|---------|-------------|
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

## 🧠 How It Works

Agents communicate using special tool commands:
- `/usetool=brain?"query"` — Call brain agent for research
- `/usetool=websearch?"query"` — Brain agent performs a real web search
- `/usetool=recallchatlog?"timeframe"` — Check chat history
- `/usetool=askuser?"question"` — Ask the user for clarification/context
- `/usetool=finalans?"answer"` — End with final answer

---

## 💡 Examples

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

---

## 🌐 API Server Mode
```bash
wonderland serve --port 3000
# POST /ask { "prompt": "your question" }
```

---

## 📊 Analytics Dashboard
```bash
wonderland analytics
```

---

## 📦 NPM Package

- [wonderland-cli on npm](https://www.npmjs.com/package/wonderland-cli)

---

## 🔒 Legal Documents

- [Privacy Policy](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/PRIVACY.md)
- [Terms of Use](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/TERMS_OF_USE.md)
- [User Agreement](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/USER_AGREEMENT.md)
- [Client Side Agreement](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/CLIENT_SIDE_AGREEMENT.md)
- [Final Disclaimer](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/FINAL_DISCLAIMER.md)
- [AI Legal Protection](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/AI_LEGAL_PROTECTION.md)
- [Legal Summary](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/LEGAL_SUMMARY.md)
- [Final Legal Summary](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/FINAL-LEGAL-SUMMARY.md)
- [Legal Documents & Middleware Reference](https://github.com/cheesecakeproject/wonderland-cli/blob/main/legaldocuments/LEGAL_DOCUMENTS_AND_MIDDLEWARE.md)

---

## 👥 Team

**Made with ❤️ by the Chezcake Team**

---

**Enter the Wonderland of AI Agents! ✨** 