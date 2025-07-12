# Wonderland CLI 1.0 Beta 🧠

<div align="center">
  <img src="/images/thumbnail.png"lt="Wonderland CLI" width="400"/>
  
  [![Version](https://img.shields.io/badge/version-1.0.0--beta-blue.svg)](https://github.com/chezcaketeam/wonderland-cli)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
  [![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos/)
  [![Ollama](https://img.shields.io/badge/ollama-required-orange.svg)](https://ollama.ai/)
  
  **An AI system to power up your Ollama bot with brains**
</div>

---

## 🌟 Features

- **🧠 Multi-Brain Architecture**: Two AI agents working together - Main Agent (controller) and Brain Agent (researcher)
- **⚡ Real-time Streaming**: Watch AI responses generate in real-time like ChatGPT
- **🔧 Tool-Based System**: Agents communicate using `/usetool=` commands for seamless collaboration
- **📝 Comprehensive Logging**: Every session is logged with detailed agent interactions
- **🎯 Smart Decision Making**: Simple questions get direct answers, complex ones use brain agent research
- **💾 Chat History**: Recall previous conversations with `/usetool=recallchatlog?`
- **🎨 Beautiful CLI**: Colored output and progress indicators for great UX

## 🚀 Quick Start

### Prerequisites

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Pull AI Models**: Install some models for your agents

```bash
# Install Ollama (macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull some models (in separate terminal)
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

### Installation

```bash
# Install globally
npm install -g wonderland-cli

# Or install locally for development
git clone <your-repo>
cd wonderland-cli
npm install
npm link
```

### Setup

```bash
# Configure your agents
wonderland setup
```

This will:
- Check if Ollama is running
- Show available models
- Let you choose your agents:
  - **Main Agent**: Controls everything and can call other agents
  - **Brain Agent**: Specialized for information gathering

### Usage

```bash
# Ask questions
wonderland ask "hello"
wonderland ask "How do I build a React app?"

# Non-interactive testing
wonderland ask "placeholder" -i "your question"

# Check status
wonderland status

# View logs
wonderland logs
```

## 🧠 How It Works

### Two-Agent System

1. **Main Agent** (Controller)
   - Receives your prompt
   - Decides if it's simple or complex
   - Can call Brain Agent for research
   - Provides final comprehensive answer

2. **Brain Agent** (Researcher)
   - Specialized for information gathering
   - Called by Main Agent when needed
   - Provides detailed research and insights

### Tool-Based Communication

Agents communicate using special commands:
- `/usetool=brain?"query"` - Call brain agent for research
- `/usetool=recallchatlog?"timeframe"` - Check chat history
- `/usetool=finalans?"answer"` - End with final answer

### Smart Decision Making

- **Simple Questions** (like "hello") → Direct answer
- **Complex Questions** → Create todo list + use brain agent for research

## 📋 Commands

| Command | Description |
|---------|-------------|
| `wonderland setup` | Configure your agents |
| `wonderland ask <prompt>` | Ask a question |
| `wonderland ask <placeholder> -i <prompt>` | Non-interactive testing |
| `wonderland status` | Check Ollama and configuration |
| `wonderland logs` | View recent sessions |
| `wonderland reset` | Reset configuration |
| `wonderland --help` | Show help |

## 🎯 Example Workflows

### Simple Question
```bash
$ wonderland ask "hello"
🧠 Multi-Brain Agent Workflow
Prompt: hello

🧠 Main Agent is thinking...
/usetool=finalans?"Hello! How can I help you today?"

🎯 Final Answer:
"Hello! How can I help you today?"
```

### Complex Question
```bash
$ wonderland ask "How do I build a React app with authentication?"
🧠 Multi-Brain Agent Workflow
Prompt: How do I build a React app with authentication?

🧠 Main Agent is thinking...
/usetool=brain?"React authentication best practices"
🧠 Brain Agent is thinking...
[Detailed research about React auth...]

🎯 Final Answer:
[Comprehensive step-by-step guide]
```

## 🔧 Configuration

### Model Recommendations

| Agent | Recommended Models | Purpose |
|-------|-------------------|---------|
| **Main Agent** | llama2, codellama, mistral | Task processing and control |
| **Brain Agent** | codellama, mistral | Information gathering and research |

### Environment Variables

```bash
# Custom Ollama URL (default: http://localhost:11434)
export OLLAMA_URL=http://localhost:11435
wonderland ask "hello"
```

## 📊 Logging

Every session is automatically logged to `./logs/` with:
- Timestamp and session ID
- Original prompt
- Agent responses and tool calls
- Final answer
- Performance metrics

## 🛠️ Development

### Project Structure
```
wonderland-cli/
├── index.js          # Main CLI entry point
├── package.json      # Project configuration
├── README.md        # This file
├── LICENSE          # MIT License
├── .gitignore       # Git ignore rules
└── logs/            # Session logs (auto-created)
```

### Adding Features

1. **New Commands**: Add to `index.js` using Commander.js
2. **New Tools**: Extend the `executeToolCalls` function
3. **New Agents**: Add to the workflow in the `ask` command

### Publishing

```bash
# Update version in package.json
npm version patch  # or minor/major

# Publish to npm
npm publish
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Made with ❤️ by the Chezcake Team**

- **Version**: 1.0.0-beta
- **Status**: Development (not ready for production)
- **Platform**: macOS with Ollama

---

<div align="center">
  <strong>Enter the Wonderland of AI Agents! ��✨</strong>
</div> 