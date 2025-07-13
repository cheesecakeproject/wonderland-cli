# Changelog

All notable changes to Wonderland CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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