#!/bin/bash

# Wonderland CLI 1.3.0 Setup Script
# Made with ❤️ by the Chezcake Team

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Wonderland CLI 1.3.0                      ║"
echo "║              An AI system to power up your Ollama            ║"
echo "║                        bot with brains                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo "Made with ❤️ by the Chezcake Team"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This setup script is designed for macOS. Please install manually on other platforms."
    exit 1
fi

print_status "Starting Wonderland CLI setup..."

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    echo "   Or use Homebrew: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"

# Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm found: $NPM_VERSION"

# Check if Ollama is installed
print_status "Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    print_warning "Ollama is not installed. Installing Ollama..."
    echo "   Installing Ollama from https://ollama.ai..."
    
    # Install Ollama
    curl -fsSL https://ollama.ai/install.sh | sh
    
    if command -v ollama &> /dev/null; then
        print_success "Ollama installed successfully!"
    else
        print_error "Failed to install Ollama. Please install manually from https://ollama.ai"
        exit 1
    fi
else
    OLLAMA_VERSION=$(ollama --version)
    print_success "Ollama found: $OLLAMA_VERSION"
fi

# Install dependencies
print_status "Installing Wonderland CLI dependencies..."
if npm install; then
    print_success "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies."
    exit 1
fi

# Link the CLI globally
print_status "Linking Wonderland CLI globally..."
if npm link; then
    print_success "Wonderland CLI linked successfully!"
else
    print_error "Failed to link Wonderland CLI. You may need to run with sudo."
    print_warning "Try: sudo npm link"
    exit 1
fi

# Test the CLI
print_status "Testing Wonderland CLI installation..."
if command -v wonderland &> /dev/null; then
    CLI_VERSION=$(wonderland --version)
    print_success "Wonderland CLI installed successfully! Version: $CLI_VERSION"
else
    print_error "Wonderland CLI installation failed."
    exit 1
fi

# Create logs directory if it doesn't exist
print_status "Setting up logs directory..."
mkdir -p logs
print_success "Logs directory created!"

# Check if Ollama is running
print_status "Checking if Ollama is running..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_success "Ollama is running!"
else
    print_warning "Ollama is not running. Starting Ollama..."
    print_status "Starting Ollama in background..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama started successfully!"
    else
        print_warning "Ollama may not be running. You can start it manually with: ollama serve"
    fi
fi

# Final setup instructions
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Wonderland CLI setup completed successfully!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""

print_status "Next steps:"
echo "1. Start Ollama (if not running): ollama serve"
echo "2. Pull some AI models:"
echo "   ollama pull llama2"
echo "   ollama pull codellama"
echo "   ollama pull mistral"
echo "3. Setup your agents: wonderland setup"
echo "4. Start using Wonderland CLI:"
echo "   wonderland ask \"hello\""
echo ""

print_status "Useful commands:"
echo "  wonderland --help          # Show all commands"
echo "  wonderland status          # Check Ollama and configuration"
echo "  wonderland logs            # View recent sessions"
echo ""

print_status "For more information, visit:"
echo "  GitHub: https://github.com/chezcaketeam/wonderland-cli"
echo "  Website: https://chezcake.vercel.app/"
echo ""

print_success "Welcome to Wonderland! 🧠✨" 