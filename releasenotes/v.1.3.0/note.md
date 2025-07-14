# Wonderland CLI v1.3.0 Release Notes

- More legal documents added for enhanced legal protection.

**Release Date:** 2025-07-14

## 🎉 **Complete Feature Set**

### 🧠 **Real-Time Brain-to-Brain Visibility**
- **Agent Status Bus**: Main and Brain Agents see each other's thinking live
- **Real-time Status Updates**: Live status display with visual indicators
- **Interactive Controls**: Press keys to interact with agents during operation
- **Status Indicators**: Visual icons for different agent states (thinking, done, error, etc.)

### 🔄 **Multi-Brain Parallel Research**
- **Parallel Execution**: Assign multiple brains to different research tasks simultaneously
- **Manual Assignment**: Specify which brain handles which sub-task
- **Automatic Assignment**: Round-robin assignment for multiple brain agents
- **Real-time Progress**: Watch all brains work in parallel with live updates

### 🎯 **Dynamic Brain Assignment**
- **CLI Commands**: Add, edit, and remove brain agents dynamically
- **Agent Management**: Create new brain agents on demand
- **Specialty Assignment**: Set specialties for each brain agent
- **Retirement System**: Retire brain agents when no longer needed

### 🎨 **Brain Specialization**
- **Predefined Specialties**: Web, Math, Code, General, and custom specialties
- **Smart Assignment**: Automatically assign tasks based on brain specialties
- **Specialty Matching**: Find best brain for each research task
- **Visual Indicators**: Show specialties in status display and dashboard

### 📊 **Live Brain Status Dashboard**
- **Dedicated Command**: `wonderland dashboard` for live monitoring
- **Real-time Updates**: Live status with animated spinners
- **Interactive Controls**: Press keys to interact with agents
- **Summary Statistics**: Show total, active, idle, done, and error counts

### 💬 **Collaborative Brain Discussion**
- **Multi-brain Discussion**: Brains discuss and critique each other's answers
- **Consensus Building**: Generate improved consensus answers
- **Discussion Rounds**: Multiple rounds of critique and refinement
- **Transcript Display**: Show full discussion transcript
- **User Control**: Auto-run, skip, or repeat discussion rounds

### ⏸️ **Interrupt & Reassign System**
- **User-Initiated Interruption**: Press `[i]` to interrupt active agents
- **Selective Interruption**: Choose which brain agent to interrupt
- **Task Preservation**: Interrupted tasks are saved for reassignment
- **Automatic Reassignment**: Smart reassignment based on specialties
- **Time-based Interruption**: Auto-interrupt agents exceeding time limits
- **CLI Commands**: `wonderland interrupt`, `wonderland reassign`, `wonderland auto-reassign`

### 🎬 **Session Replay**
- **Real-time Replay**: Replay any session with agent thinking simulation
- **Speed Control**: Slow, normal, or fast replay speeds
- **Interactive Selection**: Choose which session to replay
- **Typing Simulation**: Simulate real-time agent responses
- **Tool Call Display**: Show tool calls and their results

### 🔌 **Plugin Brains**
- **Custom Brain Agents**: Add custom Brain Agents as plugins
- **Plugin Management**: Add, list, and remove plugins
- **Dynamic Loading**: Load plugins at runtime
- **Error Handling**: Robust plugin error handling

### ⚡ **Resource-Aware Scheduling**
- **System Monitoring**: Monitor memory, CPU, and active agent usage
- **Resource Limits**: Configurable limits for concurrent agents
- **Automatic Throttling**: Throttle operations when resources are constrained
- **Resource-based Interruption**: Interrupt agents when system resources are low
- **CLI Command**: `wonderland resources` for resource monitoring
- **Continuous Monitoring**: Real-time resource monitoring with `wonderland resources -m`

### 🤔 **Content Awareness & User Query Tool**
- **Agent Clarification**: Agents can ask users for clarification using `/usetool=askuser`
- **Interactive Queries**: Real-time user input for agent questions
- **Context Gathering**: Agents can request additional context from users
- **Seamless Integration**: Integrated into the main agent workflow

---

## 📋 **New Commands**

| Command | Description |
|---------|-------------|
| `wonderland dashboard` | Show live brain status dashboard |
| `wonderland replay` | Replay a session with real-time agent thinking |
| `wonderland resources` | Show system resource usage and scheduling status |
| `wonderland interrupt` | Interrupt and reassign brain agent tasks |
| `wonderland reassign` | Reassign specific interrupted tasks |
| `wonderland auto-reassign` | Auto-reassign all interrupted tasks |
| `wonderland auto-interrupt` | Automatically interrupt agents based on conditions |

## 🎮 **Interactive Controls**

### Dashboard Controls
- Press `[i]` to interrupt agents
- Press `[r]` to reassign tasks
- Press `[q]` to quit dashboard
- Press `[h]` for help

### Resource Monitoring
- `wonderland resources` - Single status display
- `wonderland resources -m` - Continuous monitoring mode
- `wonderland resources -i 10` - Monitor with 10-second intervals

## 🚀 **Usage Examples**

### Multi-Brain Research
```bash
# Start multi-brain research
wonderland ask "Research AI trends and machine learning applications" --multi-brain

# Manual assignment
wonderland ask "Brain1: research AI trends | Brain2: research ML applications" --manual-assign
```

### Interrupt & Reassign
```bash
# Interrupt an agent during research
wonderland interrupt

# Auto-reassign interrupted tasks
wonderland auto-reassign

# Set up automatic interruption
wonderland auto-interrupt --time 180
```

### Session Replay
```bash
# Replay latest session
wonderland replay -l

# Replay specific session with custom speed
wonderland replay -f session-1234567890.json -s fast
```

### Resource Monitoring
```bash
# Check resource status
wonderland resources

# Continuous monitoring
wonderland resources -m -i 5
```

---

**Made with ❤️ by the Chezcake Team** 