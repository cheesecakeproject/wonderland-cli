# Changelog

All notable changes to Wonderland CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [1.3.0] - 2025-07-14

- More legal documents added for enhanced legal protection.

### 🎉 **Complete Multi-Brain System**

#### 🧠 **Real-Time Brain-to-Brain Visibility**
- **Agent Status Bus**: Main and Brain Agents see each other's thinking live
- **Real-time Status Updates**: Live status display with visual indicators
- **Interactive Controls**: Press keys to interact with agents during operation
- **Status Indicators**: Visual icons for different agent states (thinking, done, error, etc.)

#### 🔄 **Multi-Brain Parallel Research**
- **Parallel Execution**: Assign multiple brains to different research tasks simultaneously
- **Manual Assignment**: Specify which brain handles which sub-task
- **Automatic Assignment**: Round-robin assignment for multiple brain agents
- **Real-time Progress**: Watch all brains work in parallel with live updates

#### 🎯 **Dynamic Brain Assignment**
- **CLI Commands**: Add, edit, and remove brain agents dynamically
- **Agent Management**: Create new brain agents on demand
- **Specialty Assignment**: Set specialties for each brain agent
- **Retirement System**: Retire brain agents when no longer needed

#### 🎨 **Brain Specialization**
- **Predefined Specialties**: Web, Math, Code, General, and custom specialties
- **Smart Assignment**: Automatically assign tasks based on brain specialties
- **Specialty Matching**: Find best brain for each research task
- **Visual Indicators**: Show specialties in status display and dashboard

#### 📊 **Live Brain Status Dashboard**
- **Dedicated Command**: `wonderland dashboard` for live monitoring
- **Real-time Updates**: Live status with animated spinners
- **Interactive Controls**: Press keys to interact with agents
- **Summary Statistics**: Show total, active, idle, done, and error counts

#### 💬 **Collaborative Brain Discussion**
- **Multi-brain Discussion**: Brains discuss and critique each other's answers
- **Consensus Building**: Generate improved consensus answers
- **Discussion Rounds**: Multiple rounds of critique and refinement
- **Transcript Display**: Show full discussion transcript
- **User Control**: Auto-run, skip, or repeat discussion rounds

#### ⏸️ **Interrupt & Reassign System**
- **User-Initiated Interruption**: Press `[i]` to interrupt active agents
- **Selective Interruption**: Choose which brain agent to interrupt
- **Task Preservation**: Interrupted tasks are saved for reassignment
- **Automatic Reassignment**: Smart reassignment based on specialties
- **Time-based Interruption**: Auto-interrupt agents exceeding time limits
- **CLI Commands**: `wonderland interrupt`, `wonderland reassign`, `wonderland auto-reassign`

#### 🎬 **Session Replay**
- **Real-time Replay**: Replay any session with agent thinking simulation
- **Speed Control**: Slow, normal, or fast replay speeds
- **Interactive Selection**: Choose which session to replay
- **Typing Simulation**: Simulate real-time agent responses
- **Tool Call Display**: Show tool calls and their results

#### 🔌 **Plugin Brains**
- **Custom Brain Agents**: Add custom Brain Agents as plugins
- **Plugin Management**: Add, list, and remove plugins
- **Dynamic Loading**: Load plugins at runtime
- **Error Handling**: Robust plugin error handling

#### ⚡ **Resource-Aware Scheduling**
- **System Monitoring**: Monitor memory, CPU, and active agent usage
- **Resource Limits**: Configurable limits for concurrent agents
- **Automatic Throttling**: Throttle operations when resources are constrained
- **Resource-based Interruption**: Interrupt agents when system resources are low
- **CLI Command**: `wonderland resources` for resource monitoring
- **Continuous Monitoring**: Real-time resource monitoring with `wonderland resources -m`

#### 🤔 **Content Awareness & User Query Tool**
- **Agent Clarification**: Agents can ask users for clarification using `/usetool=askuser`
- **Interactive Queries**: Real-time user input for agent questions
- **Context Gathering**: Agents can request additional context from users
- **Seamless Integration**: Integrated into the main agent workflow

- **Plus:** Content Awareness & User Query Tool — agents can use `/usetool=askuser` to request clarification or context from the user in real time.

## [1.2.5] - 2025-07-13

- Version bump to 1.2.5
- Legal document links in README finalized to direct GitHub URLs
- All files and directories tracked and ready for publish

## [1.2.4] - 2025-07-13

- Version bump to 1.2.4
- Updated README image link to GitHub main branch
- Updated website link to https://wonderland-cli-v1.vercel.app/

## [1.2.3] - 2025-07-13

- Project fully synchronized and all directories (plugins, legaldocuments, images, releasenotes) are tracked by git
- .gitignore and .npmignore rules finalized for correct inclusion/exclusion
- Ready for npm and GitHub publish

## [1.2.1] - 2025-07-13

### 🔒 **Legal Compliance & Documentation**

#### 📋 **Comprehensive Legal Documents**
- **New Legal Documents Directory**: Added `legaldocuments/` folder with complete legal framework
- **Privacy Policy**: Comprehensive data handling and third-party dependency information
- **Terms of Use**: Complete terms and conditions for Wonderland CLI usage
- **User Agreement**: User responsibilities and agreement terms
- **Client Side Agreement**: Client-side operations and associated risks
- **Final Disclaimer**: Critical legal notice with comprehensive disclaimers
- **Legal Documents & Middleware Reference**: Complete documentation of all legal documents and middleware used

#### 📚 **Documentation Updates**
- **Enhanced README**: Updated with legal document references and links
- **Legal Section**: Added dedicated legal documents section in README
- **File Management**: Updated `.gitignore` and `.npmignore` for proper legal document handling
- **Version Consistency**: Updated all version references to 1.2.1 across all files

#### 🔧 **Technical Improvements**
- **File Organization**: Properly organized legal documents in dedicated directory
- **Version Management**: Consistent version numbering across package.json, index.js, README, and setup.sh
- **Documentation Links**: All legal documents properly referenced in README

---

## [1.2.0] - 2025-07-13

### 🎉 Official Release

#### 🎨 **Major UX/UI Improvements**
- **Enhanced Streaming Experience**: 
  - Animated thinking spinner with dots animation
  - Typing indicator showing "💬 Agent is typing..."
  - Progress tracking with character count and words per minute
  - Smoother output with natural typing delays
- **Beautiful Visual Hierarchy**:
  - Decorative box headers for different sections
  - Status bar showing current system status and agent information
  - Color-coded sections for better information organization
  - Visual separators and clean borders
- **Enhanced Chat Mode**:
  - Decorative welcome screen with box headers
  - Built-in help system with `help` and `clear` commands
  - Better visual indicators for user input
  - Enhanced exit messages with decorative boxes
- **Advanced Analytics Dashboard**:
  - Animated progress spinner while analyzing logs
  - Visual progress bars for tool usage statistics
  - Organized sections with clear headers and better formatting
  - Smart truncation for long responses in recent activity
- **Improved Tool Execution Display**:
  - Progress tracking showing current tool number and total tools
  - Clear visual separation between different tool executions
  - Enhanced final answer display with decorative boxes
- **Better Error Handling**:
  - More descriptive error indicators
  - Consistent error message styling

#### 🔧 **Technical Enhancements**
- **Performance Optimizations**: Faster startup and response times
- **Memory Management**: Optimized memory consumption for long sessions
- **Error Handling**: More robust error handling throughout the application
- **Code Quality**: Improved code structure and documentation
- **Dependencies**: Updated to latest stable versions

#### 📚 **Documentation Updates**
- **Enhanced README**: Updated with new UX/UI features and examples
- **Command Examples**: Updated examples showing new visual improvements
- **API Documentation**: Clear documentation for all features
- **Plugin Guide**: Better plugin development documentation

### 🐛 **Bug Fixes**
- **Fixed**: Session logging sometimes missing tool calls
- **Fixed**: Plugin errors not properly handled in some cases
- **Fixed**: Model switching issues with certain Ollama versions
- **Fixed**: Export formatting issues with special characters
- **Fixed**: Personality switching not persisting across sessions

---

## [1.1.0-beta] - 2025-07-13

### 🎉 Major Features Added

#### 🌐 **Web Search Integration**
- **New Web Search Tool**: Brain agent can now perform real web searches using DuckDuckGo API
- **Command**: `/usetool=websearch?"query"` for real-time web research
- **Enhanced Research**: Brain agent automatically uses web search for factual queries
- **Real-time Results**: Get current information from the web

#### 💬 **Interactive Chat Mode (REPL)**
- **New Command**: `wonderland chat` for interactive chat sessions
- **REPL-style Interface**: Type questions and get responses in a continuous session
- **Exit Command**: Type "exit" to quit chat mode
- **Session Continuity**: Maintains context throughout the chat session

#### 🌐 **API Server Mode**
- **New Command**: `wonderland serve [--port <port>]` to run as HTTP API server
- **RESTful Endpoint**: POST `/ask` endpoint for programmatic access
- **JSON API**: Send `{"prompt": "your question"}` and receive AI responses
- **Local Development**: Perfect for integrating with other applications

#### 📊 **Advanced Analytics & Logging**
- **New Command**: `wonderland analytics` to view usage statistics
- **Usage Metrics**: Track total sessions, questions, and tool calls
- **Tool Usage Stats**: See which tools are used most frequently
- **Recent Activity**: View recent questions and answers
- **Performance Insights**: Monitor agent performance and usage patterns

#### 🎭 **Agent Personality System**
- **Multiple Personalities**: friendly, strict, creative, and custom
- **Commands**: 
  - `wonderland persona list` - List available personalities
  - `wonderland persona set <personality>` - Set active personality
  - `wonderland persona custom [prompt] [--reset]` - Manage custom personality
- **Dynamic Behavior**: Change agent behavior based on personality
- **Custom Prompts**: Create your own agent personality

#### 🆕 **Auto-Update Checker**
- **Automatic Updates**: Checks for new versions on startup
- **Interactive Prompts**: Choose to update now or remind later
- **Version Notifications**: Stay informed about new releases
- **Seamless Updates**: Easy upgrade process

#### 🛑 **Dangerous Reset Command**
- **New Command**: `wonderland -danger -settings -reset` for factory reset
- **Complete Cleanup**: Removes all settings, logs, and plugins
- **Fresh Start**: Perfect for troubleshooting or starting over
- **Safety Confirmation**: Requires explicit dangerous flag

### 🔧 Enhanced Features

#### 📝 **Session Export Improvements**
- **Multiple Formats**: Export to markdown, JSON, or PDF
- **Black & White PDF**: Clean, professional PDF styling
- **Custom Output**: Specify output file with `--output` flag
- **Comprehensive Logs**: Include all session details in exports

#### 🔌 **Plugin System Enhancements**
- **Better Error Handling**: Improved plugin loading and execution
- **Plugin Validation**: Validate plugin structure and dependencies
- **Enhanced Documentation**: Better plugin development guidelines

#### 🧩 **Model Management Improvements**
- **Faster Model Operations**: Optimized model listing and switching
- **Better Error Messages**: Clear feedback for model operations
- **Model Validation**: Verify model availability before use

### 🐛 Bug Fixes

- **Fixed**: Session logging sometimes missing tool calls
- **Fixed**: Plugin errors not properly handled in some cases
- **Fixed**: Model switching issues with certain Ollama versions
- **Fixed**: Export formatting issues with special characters
- **Fixed**: Personality switching not persisting across sessions

### 🔧 Technical Improvements

- **Performance**: Faster startup and response times
- **Memory Usage**: Optimized memory consumption for long sessions
- **Error Handling**: More robust error handling throughout
- **Code Quality**: Improved code structure and documentation
- **Dependencies**: Updated to latest stable versions

### 📚 Documentation

- **Enhanced README**: Comprehensive feature documentation
- **Command Examples**: Detailed examples for all new features
- **API Documentation**: Clear documentation for API server mode
- **Plugin Guide**: Better plugin development documentation

### 🎨 UI/UX Improvements

- **Better Progress Indicators**: More informative loading states
- **Enhanced Colors**: Improved color scheme for better readability
- **Clearer Messages**: More descriptive status and error messages
- **Consistent Formatting**: Uniform output formatting across all commands

---

## [1.0.2-beta] - 2025-07-13

### 🔧 Bug Fixes
- Fixed session logging issues
- Improved error handling for plugin system
- Enhanced model management reliability

### 📚 Documentation
- Updated README with latest features
- Added comprehensive command documentation

---

## [1.0.1-beta] - 2025-07-12

### 🎉 Initial Beta Release
- Multi-brain AI agent architecture
- Real-time streaming responses
- Tool-based communication system
- Plugin system for custom tools
- Model management commands
- Prompt template system
- Session export functionality
- Basic logging and analytics

---

## [1.0.0-dev] - 2025-07-12

### 🚀 Initial Development Release
- Core CLI framework
- Basic Ollama integration
- Simple question-answer functionality
- Configuration system 