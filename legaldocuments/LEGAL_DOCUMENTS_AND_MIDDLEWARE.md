# Legal Documents and Middleware Reference - Wonderland CLI

**Last Updated: 2025-07-14 (v1.3.0)**

## 📄 Legal Documents Used in Wonderland CLI

### Core Legal Documents
1. **[Terms of Use](TERMS_OF_USE.md)** - Complete terms and conditions for using Wonderland CLI
2. **[User Agreement](USER_AGREEMENT.md)** - User agreement and responsibilities
3. **[Client Side Agreement](CLIENT_SIDE_AGREEMENT.md)** - Client-side operations and risks
4. **[Privacy Policy](PRIVACY.md)** - Data handling and third-party dependencies
5. **[Final Disclaimer](FINAL_DISCLAIMER.md)** - Critical legal notice and comprehensive disclaimers
6. **[AI Legal Protection](AI_LEGAL_PROTECTION.md)** - Comprehensive AI-specific legal protections and disclaimers
7. **[Legal Summary](LEGAL_SUMMARY.md)** - Comprehensive legal protection overview and summary
8. **[Final Legal Summary](FINAL-LEGAL-SUMMARY.md)** - Maximum legal protection against all possible lawsuits
9. **[LICENSE](LICENSE)** - MIT License for the software

### Legal Document References
- All legal documents are dated **2025-07-14**
- All documents contain strong liability disclaimers
- All documents reference third-party middleware
- All documents emphasize user responsibility

## 🔧 Middleware Used in Wonderland CLI Project

### Core Dependencies (package.json)
1. **axios** (^1.6.0) - HTTP client for API requests
2. **chalk** (^4.1.2) - Terminal styling and colors
3. **commander** (^11.1.0) - CLI command framework
4. **conf** (^12.0.0) - Configuration management
5. **inquirer** (^9.2.12) - Interactive command line prompts
6. **ora** (^7.0.1) - Terminal spinners and loading indicators
7. **pdfkit** (^0.17.1) - PDF generation for session exports

### Runtime Dependencies
8. **Node.js** - JavaScript runtime environment
9. **npm** - Package manager and registry

### External Services (APIs)
10. **Ollama API** - Local AI model runner for responses
11. **DuckDuckGo API** - Web search functionality
12. **NPM Registry** - Package updates and version checking

## 🔧 Middleware That Will Be Used When User Uses the Tool

### Local Middleware (User's Machine)
1. **Ollama** - AI model runner (user must install separately)
2. **Node.js** - Runtime environment (user must have installed)
3. **npm** - Package manager (comes with Node.js)
4. **System APIs** - File system, network, process management

### External Middleware (When Tool is Used)
1. **DuckDuckGo API** - For web searches (`/usetool=websearch?`)
2. **NPM Registry** - For update checks and version verification
3. **HTTP/HTTPS** - For API communications
4. **File System** - For logging and data storage

### Optional Middleware (Based on Usage)
1. **PDF Generation** - When exporting sessions to PDF
2. **JSON Processing** - When exporting sessions to JSON
3. **Markdown Processing** - When exporting sessions to markdown
4. **Terminal APIs** - For interactive features and styling

## ⚖️ Legal Implications of Middleware

### Third-Party Services
- **DuckDuckGo**: Web search results and API usage
- **NPM Registry**: Package information and update checking
- **Ollama**: AI model processing and responses

### Local Processing
- **File System**: Session logs and configuration storage
- **Terminal**: User interface and interaction
- **Network**: API communications and web requests

### Data Flow
1. **User Input** → Wonderland CLI → Local Processing
2. **AI Queries** → Ollama (local) → AI Responses
3. **Web Searches** → DuckDuckGo API → Search Results
4. **Update Checks** → NPM Registry → Version Information

## 🔒 Privacy and Legal Considerations

### Data Collection
- **Wonderland CLI**: No data collection (local only)
- **DuckDuckGo**: May collect search queries
- **NPM Registry**: May log package access
- **Ollama**: Local processing only

### User Responsibility
- Users are responsible for all middleware behavior
- Users are responsible for third-party service compliance
- Users are responsible for local data security
- Users are responsible for network communications

## 📋 Complete Middleware List

### Development Dependencies
- All npm packages listed in package.json
- Development tools and build processes
- Testing frameworks (if any)

### Runtime Dependencies
- Node.js ecosystem
- System-level APIs
- Network protocols
- File system operations

### External Services
- DuckDuckGo Instant Answer API
- NPM Registry API
- HTTP/HTTPS protocols
- JSON/XML data formats

## ⚠️ Important Disclaimers

### Middleware Disclaimers
- **WE ARE NOT RESPONSIBLE** for any middleware behavior
- **WE ARE NOT RESPONSIBLE** for third-party service issues
- **WE ARE NOT RESPONSIBLE** for data collection by middleware
- **ALL RESPONSIBILITY** lies with the user

### Legal Document References
- All legal documents contain comprehensive disclaimers
- All legal documents reference middleware usage
- All legal documents emphasize user responsibility
- All legal documents disclaim liability for third-party services

---

**REFER TO THE INDIVIDUAL LEGAL DOCUMENTS FOR DETAILED INFORMATION ABOUT LEGAL OBLIGATIONS AND MIDDLEWARE USAGE. THIS DOCUMENT SERVES AS A REFERENCE GUIDE ONLY.**

**BY USING WONDERLAND CLI, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND ALL LEGAL DOCUMENTS AND MIDDLEWARE USAGE. ALL RISKS AND RESPONSIBILITIES ARE YOURS ALONE.** 