# Privacy Policy for Wonderland CLI

**Last Updated: 2025-07-14 (v1.3.0)**

## Overview
Wonderland CLI is a local AI assistant tool that operates entirely on your machine. We are committed to protecting your privacy and ensuring transparency about data handling.

## Data Collection

### Local Data Storage
- **Session Logs**: All conversation logs are stored locally in the `./logs/` directory
- **Chat History**: Conversation history is stored locally on your machine
- **Configuration**: Settings and preferences are stored locally
- **No External Collection**: We do not collect, store, or transmit any personal data to our servers

### External Services Used
- **DuckDuckGo API**: Used for web searches when you use the `/usetool=websearch?` feature
- **Ollama API**: Used for AI responses through your local Ollama installation
- **NPM Registry**: Used for checking available updates

## Third-Party Dependencies Disclaimer

**⚠️ Important**: While Wonderland CLI itself does not collect your data, we cannot guarantee that third-party dependencies and middleware will not collect data. This includes but is not limited to:

### Dependencies That May Collect Data:
- **NPM**: Package management and update checking
- **PDFKit**: PDF generation for session exports
- **Axios**: HTTP requests for web searches and API calls
- **Other Dependencies**: Various npm packages used for functionality

### What This Means:
- We have no control over how these third-party services handle data
- These services may have their own privacy policies and data collection practices
- We recommend reviewing the privacy policies of these services if you have concerns

## Data Retention
- All local data is stored on your machine and can be deleted at any time
- No data is retained on our servers
- You can use the `wonderland -danger -settings -reset` command to clear all local data

## Your Rights
- Complete control over local data
- Ability to delete all logs and configuration
- No tracking or analytics from our application
- Right to stop using the tool at any time

## Contact
If you have questions about this privacy policy, please contact us through our GitHub repository.

## Changes to This Policy
We may update this privacy policy from time to time. The latest version will always be available in our repository.

---

**Note**: This privacy policy covers Wonderland CLI's direct data handling. For information about third-party services, please refer to their respective privacy policies. 