# Wonderland CLI 1.1.0-beta 🧠

![Wonderland CLI Thumbnail](https://github.com/cheesecakeproject/wonderland-cli/blob/beta/images/thumbnail.png)

[![npm version](https://img.shields.io/npm/v/wonderland-cli)](https://www.npmjs.com/package/wonderland-cli)
[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/cheesecakeproject/wonderland-cli/tree/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos/)
[![Ollama](https://img.shields.io/badge/ollama-required-orange.svg)](https://ollama.ai/)

---

## 🌟 Features

- **🧠 Multi-Brain Architecture**: Main Agent (controller) and Brain Agent (researcher)
- **⚡ Real-time Streaming**: Watch AI responses generate in real-time
- **🔧 Tool-Based System**: Agents use `/usetool=` commands for collaboration
- **📝 Comprehensive Logging**: Every session is logged
- **🎯 Smart Decision Making**: Simple questions get direct answers, complex ones use brain agent research
- **💾 Chat History**: Recall previous conversations with `/usetool=recallchatlog?`
- **🎨 Beautiful CLI**: Colored output and progress indicators
- **🔌 Plugin System**: Add, list, and remove custom tools/brains
- **🧩 Model Management**: List, pull, and set Ollama models
- **📝 Prompt Templates**: Save, use, list, and remove prompt templates
- **📤 Session Export**: Export logs to markdown, JSON, or PDF (black & white)
- **🎭 Agent Personalities**: Switch between friendly, strict, creative, or custom personalities
- **🌐 Web Search Tool**: Brain agent can use `/usetool=websearch?` for real web results
- **🆕 Auto-Update Checker**: Notifies you of new versions and lets you choose when to update
- **💬 Interactive Chat Mode**: REPL-style chat with the agent
- **🌐 API Server Mode**: Run as a local HTTP API server
- **📊 Analytics**: View usage stats and recent activity
- **🛑 Dangerous Reset**: Factory reset all settings, logs, and plugins

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `wonderland setup` | Configure your agents |
| `wonderland ask <prompt>` | Ask a question |
| `wonderland ask <placeholder> -i <prompt>` | Non-interactive testing |
| `wonderland status` | Check Ollama and configuration |
| `wonderland logs` | View recent sessions |
| `wonderland plugin add <path>` | Add a plugin (JS file) |
| `wonderland plugin list` | List installed plugins |
| `wonderland plugin remove <name>` | Remove a plugin |
| `wonderland models list` | List available Ollama models |
| `wonderland models pull <model>` | Pull a new model |
| `wonderland models use <model>` | Set default model |
| `wonderland template save <name> <prompt>` | Save a prompt template |
| `wonderland template use <name>` | Use/view a template |
| `wonderland template list` | List templates |
| `wonderland template remove <name>` | Remove a template |
| `wonderland export --format <markdown|json|pdf> [--output <file>]` | Export session log |
| `wonderland persona list` | List agent personalities |
| `wonderland persona set <personality>` | Set active personality |
| `wonderland persona custom [prompt] [--reset]` | Set/view/reset custom personality |
| `wonderland chat` | Start interactive chat mode |
| `wonderland serve [--port <port>]` | Run as local API server |
| `wonderland analytics` | Show usage analytics |
| `wonderland -danger -settings -reset` | Factory reset all settings, logs, plugins |
| `wonderland --help` | Show help |

---

## 🧠 How It Works

### Tool-Based Communication

Agents use special commands:
- `/usetool=brain?"query"` — Call brain agent for research
- `/usetool=websearch?"query"` — Brain agent performs a real web search
- `/usetool=recallchatlog?"timeframe"` — Check chat history
- `/usetool=finalans?"answer"` — End with final answer

### Example: Web Search Tool
```bash
$ wonderland ask "What is the capital of France?"
🧠 Main Agent is thinking...
/usetool=websearch?"capital of France"
🌐 Web Search Result: Paris is the capital of France.
/usetool=finalans?"Paris is the capital of France."
🎯 Final Answer:
Paris is the capital of France.
```

### Example: Dangerous Reset
```bash
$ wonderland -danger -settings -reset
⚠️  All Wonderland CLI settings, logs, and plugins have been reset!
You must run wonderland setup again.
```

---

## 💬 Interactive Chat Mode
```bash
$ wonderland chat
🧠 Wonderland CLI Chat Mode (type "exit" to quit)
You: Hello!
Wonderland: Hello! How can I help you today?
You: Tell me a joke.
Wonderland: Why did the AI cross the road? To optimize the chicken's path!
You: exit
👋 Chat session ended.
```

---

## 🌐 API Server Mode
```bash
$ wonderland serve --port 3000
🌐 Wonderland CLI API server running on http://localhost:3000
POST /ask { "prompt": "your question" }
```

---

## 📊 Analytics
```bash
$ wonderland analytics
📊 Wonderland CLI Analytics
Total sessions: 12
Total questions: 25
Total tool calls: 8
Most used tools:
  - brain: 5
  - websearch: 3
Recent activity:
- [2024-07-12T12:34:56Z] Q: What is Ollama?
    A: Ollama is an open-source AI model runner for macOS.
...
```

---

## 🛠️ Development

See the code for how to add new commands, tools, and agents. Extend the CLI by adding plugins to the `plugins/` directory.

---

## 📦 NPM Package

- [wonderland-cli on npm](https://www.npmjs.com/package/wonderland-cli/v/1.0.2-beta)

---

## 👥 Team

**Made with ❤️ by the Chezcake Team**

---

**Enter the Wonderland of AI Agents! ✨** 