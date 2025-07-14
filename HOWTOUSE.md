# HOWTOUSE: Wonderland CLI

Welcome! Wonderland CLI is your open-source toolkit for building, running, and remixing multi-brain AI agents. Whether you’re new or experienced, this guide will help you get started and make the most of every feature—no magic required, just a bit of curiosity and a smile.

---

## Quick Start

Let’s get you up and running in just a few steps:

### 1. Install Wonderland CLI

```sh
npm install -g wonderland-cli
```
Or, if you use yarn:
```sh
yarn global add wonderland-cli
```

### 2. Launch the CLI

Type:
```sh
wonderland
```
You should see a welcome message. If you do, you’re all set!

### 3. Explore the Basics

For help at any time:
```sh
wonderland help
```
Or to see all available commands:
```sh
wonderland list
```

That’s it! You’re ready to start exploring what Wonderland CLI can do.

---

## Core Concepts: Brains, Agents, and Plugins

Before you dive into commands and customization, let’s cover the basics of how Wonderland CLI works. Here’s what you need to know:

### Brains
A "brain" is an AI agent that can think, analyze, and solve problems. Wonderland CLI supports multiple brains, each with its own specialty. You can assign tasks to different brains, let them collaborate, or even have them critique each other’s work.

- **Main Brain:** The default agent that coordinates everything.
- **Specialized Brains:** Agents focused on specific tasks (like coding, research, or math).

### Agents
An agent is a general term for any entity (brain or tool) that can perform actions in Wonderland CLI. Most of the time, you’ll interact with brains, but you can also add other types of agents as plugins.

### Plugins
Plugins are add-ons that extend Wonderland CLI’s capabilities. Want a new brain with a unique skill? Or maybe a tool that connects to an external API? Just add a plugin. Plugins are easy to install, update, and share.

- **Brain Plugins:** Add new AI agents with custom specialties.
- **Tool Plugins:** Integrate external services or utilities.

### How It All Fits Together
Think of Wonderland CLI as a team workspace:
- The main brain is your team lead.
- Specialized brains are your experts.
- Plugins are extra tools or new team members you can bring in as needed.

You can mix and match brains and plugins to create the workflow that fits your needs.

---

## Command Reference

Here’s a handy list of the most useful Wonderland CLI commands. You can run these from your terminal. For more details on any command, just add `--help` at the end.

### Setup & Configuration
- `wonderland -setup4u`  
  One-step automatic setup. Recommended for first-time users.
- `wonderland setup`  
  Walk through configuration options interactively.

### Asking Questions & Running Agents
- `wonderland ask "Your question here"`  
  Ask the main brain (or all brains) anything you like.
- `wonderland ask "Research topic" --multi-brain`  
  Assigns the question to multiple brains for parallel research.

### Listing & Managing
- `wonderland list`  
  See all available commands and features.
- `wonderland dashboard`  
  View a live status dashboard of all brains and agents.

### Session Management
- `wonderland replay`  
  Replay a previous session and see how the agents worked.
- `wonderland export --format <markdown|json|pdf>`  
  Export session logs in your preferred format.

### Resource & Analytics
- `wonderland resources`  
  Show system resource usage and agent scheduling.
- `wonderland analytics`  
  View usage stats and analytics dashboards.

### Advanced Controls
- `wonderland interrupt`  
  Interrupt any agent and reassign its task.
- `wonderland reassign`  
  Manually reassign interrupted tasks.
- `wonderland auto-reassign`  
  Automatically reassign all interrupted tasks.
- `wonderland auto-interrupt`  
  Set up automatic interruption based on conditions.

### Help & Info
- `wonderland help`  
  Show help for any command.
- `wonderland --version`  
  Display the current version of Wonderland CLI.

---

Tip: You can combine flags and commands for more advanced workflows. Don’t hesitate to experiment and see what works best for you!

Next: Learn how to develop and use plugins to extend Wonderland CLI.

---

## Plugin Development

One of the best things about Wonderland CLI is how easy it is to extend. Plugins let you add new brains, tools, or features—no need to wait for the next release. Here’s how you can make the most of plugins:

### Finding and Installing Plugins
- Browse the official plugin directory (or your team’s shared repo) for ready-made plugins.
- To install a plugin:
  ```sh
  wonderland plugin install <plugin-name>
  ```
- To list installed plugins:
  ```sh
  wonderland plugin list
  ```
- To update a plugin:
  ```sh
  wonderland plugin update <plugin-name>
  ```
- To remove a plugin:
  ```sh
  wonderland plugin remove <plugin-name>
  ```

### Creating Your Own Plugin
You can build your own plugin to add a new brain, connect to an API, or automate a workflow. Here’s a simple outline:

1. Run the plugin generator:
   ```sh
   wonderland plugin create
   ```
   Follow the prompts to set up your plugin’s name, type, and description.
2. Edit the generated files to add your logic. (Check the docs or examples for guidance.)
3. Test your plugin locally:
   ```sh
   wonderland plugin test <path-to-your-plugin>
   ```
4. Install your plugin:
   ```sh
   wonderland plugin install <path-to-your-plugin>
   ```

### Sharing Plugins
- Share your plugin by publishing it to the official directory or your team’s repo.
- Good documentation and clear examples make your plugin more useful to others.

### Tips
- Keep plugins focused—one brain or tool per plugin is a good rule of thumb.
- Use versioning so users know when updates are available.
- If you get stuck, check the community forums or ask for help.

---

## Advanced Usage

Once you’re comfortable with the basics, Wonderland CLI has plenty of advanced features to help you work smarter and faster. Here are some ways to level up your workflow:

### Chaining Commands
You can chain commands together to automate multi-step tasks. For example:
```sh
wonderland ask "Summarize the latest AI research" --multi-brain | wonderland export --format markdown
```
This runs a multi-brain research session and exports the results in one go.

### Automating Workflows
Use scripts or shell aliases to automate your favorite Wonderland CLI routines. For example, you might create a script to:
- Run a research session
- Export the results
- Email the summary to your team

Example (bash script):
```sh
wonderland ask "Weekly market trends" --multi-brain \
  | wonderland export --format pdf \
  && mail -s "Market Trends" team@example.com < latest-session.pdf
```

### Multi-Brain Setups
Wonderland CLI shines when you use multiple brains for complex tasks. You can:
- Assign different brains to different specialties (e.g., coding, research, math)
- Let brains critique and refine each other’s answers
- Replay sessions to see how each brain contributed

Example:
```sh
wonderland ask "Compare the pros and cons of renewable energy sources" --multi-brain
```

### Customizing Agents
You can edit agent settings, add new brains, or adjust specialties using the setup commands or by editing your config files directly.

### API Server Mode
Run Wonderland CLI as a local API server to integrate with other tools:
```sh
wonderland serve --port 3000
```
You can then send requests to the API from your own scripts or applications.

### Monitoring & Analytics
Track usage, performance, and resource consumption with:
```sh
wonderland analytics
wonderland resources
```

---

## Troubleshooting & FAQ

Even the best tools hit a snag now and then. Here are answers to common questions and quick fixes for typical issues:

### Wonderland CLI won’t start
- Make sure Node.js (version 16 or higher) is installed.
- Try reinstalling with `npm install -g wonderland-cli`.

### Ollama or other dependencies aren’t working
- Ensure Ollama (or any required service) is running locally.
- Check the documentation for any extra setup steps.

### No models found
- Use `wonderland models` to list and pull available models.
- Make sure your model paths are set correctly in your config.

### Permission errors
- Try running the CLI as an administrator (or with `sudo` on Mac/Linux).
- Check file and directory permissions for your workspace.

### How do I reset everything?
- Use `wonderland -danger -settings -reset` to factory reset your configuration. (This will wipe your settings—use with care!)

### How do I update Wonderland CLI?
- Run `npm update -g wonderland-cli` or `yarn global upgrade wonderland-cli`.

### Where can I find more help?
- Use `wonderland help` for command-specific guidance.
- Check the official documentation and community forums for tips and troubleshooting.

### Something else isn’t working
- If you’re stuck, try searching for your issue in the community or open a support request. Chances are, someone else has run into the same thing!

---

## Community & Contribution

Wonderland CLI is open source and thrives on community involvement. Whether you want to contribute code, share a plugin, or just connect with other users, there’s a place for you here.

### Ways to Get Involved
- **Contribute Code:** Found a bug or have an idea for a new feature? Fork the repo, make your changes, and open a pull request.
- **Share Plugins:** Created a plugin you’re proud of? Publish it to the official directory or share it with the community.
- **Report Issues:** If you spot a bug or something isn’t working as expected, open an issue on GitHub. Clear descriptions and steps to reproduce are always appreciated.
- **Join Discussions:** Participate in community forums, chat groups, or project meetings. Your feedback helps shape the future of Wonderland CLI.

### Guidelines
- Be respectful and constructive—everyone’s here to learn and help.
- Follow the project’s contribution guidelines (see CONTRIBUTING.md for details).
- Keep plugins and code well-documented so others can benefit from your work.

### Stay Connected
- **GitHub:** [Project Repository](https://github.com/your-org/wonderland_CLI)
- **Community Forum:** (link to forum or Discord/Slack)
- **Documentation:** Always up to date in the repo

We’re excited to see what you’ll build and share. Thanks for helping Wonderland CLI grow!

---

## Tips & Extras

Here are some handy tips and lesser-known features to help you get even more out of Wonderland CLI:

### Handy Shortcuts
- Use the up and down arrows in your terminal to quickly repeat previous commands.
- Add `--help` to any command for detailed usage info.
- Use tab completion (if your shell supports it) to speed up typing commands and plugin names.

### Config Tweaks
- Edit your config file directly for advanced customization (location: `~/.wonderlandrc` or similar).
- Set environment variables to override config settings for one-off runs.

### Session Management
- Use `wonderland replay` to review how agents worked through a problem—great for learning and debugging.
- Export sessions in different formats for sharing or archiving.

### Plugin Power
- Try out community plugins to add new brains or connect to external tools.
- Keep your plugins up to date for the latest features and fixes.

### Stay Secure
- Review permissions for any third-party plugins before installing.
- Keep your CLI and dependencies updated to the latest versions.

### Fun Fact
- Wonderland CLI is designed to be modular—almost every feature can be extended or replaced with a plugin.

---

Thanks for reading! We hope this guide helps you get the most out of Wonderland CLI. If you have feedback or ideas, don’t hesitate to reach out to the community.

---

## Table of Contents

1. [Introduction](#howtouse-wonderland-cli)
2. [Quick Start](#quick-start)
3. [Core Concepts: Brains, Agents, and Plugins](#core-concepts-brains-agents-and-plugins)
4. [Command Reference](#command-reference)
5. [Plugin Development](#plugin-development)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting & FAQ](#troubleshooting--faq)
8. [Community & Contribution](#community--contribution)
9. [Tips & Extras](#tips--extras)

---

Ready to dive deeper? Scroll down to learn about the core concepts and how to get the most out of Wonderland CLI. 

---

## Deep Dives & Tutorials

This section provides in-depth, step-by-step guides for real-world Wonderland CLI use cases. Whether you’re automating research, reviewing code, or analyzing data, these tutorials will help you master advanced workflows.

### Tutorial 1: Automating Research with Multi-Brain Agents

**Goal:** Use Wonderland CLI to automate a research task, gather information from multiple sources, and summarize findings.

#### Step 1: Set Up Your Brains
First, make sure you have at least two specialized brains configured (e.g., one for web research, one for summarization).

```sh
wonderland setup
```
Follow the prompts to add or configure brains. Assign specialties like "Web Research" and "Summarization."

#### Step 2: Start a Multi-Brain Research Session
```sh
wonderland ask "Research the latest trends in renewable energy" --multi-brain
```
This command assigns the task to all available brains. Each brain will approach the problem from its specialty.

#### Step 3: Review and Refine
Once the session is complete, use the dashboard to review each brain’s findings:
```sh
wonderland dashboard
```
You can ask a summarization brain to refine the results:
```sh
wonderland ask "Summarize the findings from the last session"
```

#### Step 4: Export the Results
Export your session for sharing or archiving:
```sh
wonderland export --format markdown
```

#### Tips
- Assign brains with complementary specialties for best results.
- Use session replay to review how each brain contributed.

---

### Tutorial 2: Code Review Automation

**Goal:** Use Wonderland CLI to automate code review, identify issues, and suggest improvements.

#### Step 1: Configure a Code Review Brain
Add a brain with a "Code Review" specialty:
```sh
wonderland setup
```
Assign the new brain to focus on code analysis and best practices.

#### Step 2: Run a Code Review Session
```sh
wonderland ask "Review the code in src/app.js for bugs and improvements" --multi-brain
```

#### Step 3: Analyze the Output
Check the dashboard or exported report for suggestions and flagged issues.

#### Step 4: Iterate
Ask follow-up questions or request more detail:
```sh
wonderland ask "Explain the most critical issue found in the last review"
```

---

### Tutorial 3: Data Analysis Workflow

**Goal:** Use Wonderland CLI to analyze a dataset and generate insights.

#### Step 1: Prepare Your Data Analysis Brain
Configure a brain with data analysis skills (e.g., Python, statistics):
```sh
wonderland setup
```
Assign the brain to "Data Analysis."

#### Step 2: Start the Analysis
```sh
wonderland ask "Analyze the dataset in data/sales.csv and summarize key trends" --multi-brain
```

#### Step 3: Visualize Results
If your plugin supports it, generate charts or graphs:
```sh
wonderland ask "Create a bar chart of monthly sales from data/sales.csv"
```

#### Step 4: Export and Share
Export the analysis for your team:
```sh
wonderland export --format pdf
```

#### Tips
- Use plugins to add support for new data formats or visualization tools.
- Chain commands for automated reporting.

---

### More Tutorials Coming!

- Automating daily standups
- Integrating with external APIs
- Building custom dashboards
- And much more...

(Stay tuned as this section grows with more detailed, real-world guides!)

--- 

---

## Plugin Cookbook

This section is packed with practical plugin recipes—ready-to-use examples and inspiration for your own creations. Whether you’re just starting out or looking to build something advanced, you’ll find step-by-step guides, code snippets, and best practices here.

### Recipe 1: Hello World Brain Plugin

**Goal:** Create a simple plugin that adds a new brain which always responds with "Hello, World!"

#### Step 1: Generate the Plugin
```sh
wonderland plugin create
```
Choose "Brain" as the type, and name it `hello-world-brain`.

#### Step 2: Implement the Logic
Edit the generated plugin file (e.g., `hello-world-brain.js`):
```js
module.exports = {
  name: 'hello-world-brain',
  specialty: 'Greeting',
  process: async (input) => {
    return 'Hello, World!';
  }
};
```

#### Step 3: Install and Test
```sh
wonderland plugin install ./hello-world-brain.js
wonderland ask "Say hi" --brain hello-world-brain
```

---

### Recipe 2: Web Search Tool Plugin

**Goal:** Add a tool plugin that performs a web search using an external API.

#### Step 1: Generate the Plugin
```sh
wonderland plugin create
```
Choose "Tool" as the type, and name it `web-search-tool`.

#### Step 2: Implement the Logic
Edit the plugin file (e.g., `web-search-tool.js`):
```js
const fetch = require('node-fetch');

module.exports = {
  name: 'web-search-tool',
  description: 'Performs a web search using DuckDuckGo',
  async run(query) {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await response.json();
    return data.AbstractText || 'No summary found.';
  }
};
```

#### Step 3: Install and Use
```sh
wonderland plugin install ./web-search-tool.js
wonderland ask "Search for the latest AI news" --tool web-search-tool
```

---

### Recipe 3: Data Formatter Plugin

**Goal:** Create a plugin that formats CSV data into a Markdown table.

#### Step 1: Generate the Plugin
```sh
wonderland plugin create
```
Choose "Tool" as the type, and name it `csv-to-markdown`.

#### Step 2: Implement the Logic
Edit the plugin file (e.g., `csv-to-markdown.js`):
```js
module.exports = {
  name: 'csv-to-markdown',
  description: 'Converts CSV to Markdown table',
  run(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => line.split(','));
    let md = '| ' + headers.join(' | ') + ' |\n';
    md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    rows.forEach(row => {
      md += '| ' + row.join(' | ') + ' |\n';
    });
    return md;
  }
};
```

#### Step 3: Install and Use
```sh
wonderland plugin install ./csv-to-markdown.js
wonderland ask "Format this CSV as a Markdown table" --tool csv-to-markdown
```

---

### Recipe 4: Advanced - Sentiment Analysis Brain

**Goal:** Build a brain plugin that analyzes the sentiment of input text.

#### Step 1: Generate the Plugin
```sh
wonderland plugin create
```
Choose "Brain" as the type, and name it `sentiment-brain`.

#### Step 2: Implement the Logic
Edit the plugin file (e.g., `sentiment-brain.js`):
```js
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

module.exports = {
  name: 'sentiment-brain',
  specialty: 'Sentiment Analysis',
  process: async (input) => {
    const result = sentiment.analyze(input);
    if (result.score > 0) return 'Positive';
    if (result.score < 0) return 'Negative';
    return 'Neutral';
  }
};
```

#### Step 3: Install Dependencies
```sh
npm install sentiment
```

#### Step 4: Install and Use
```sh
wonderland plugin install ./sentiment-brain.js
wonderland ask "Analyze the sentiment of: I love Wonderland CLI!" --brain sentiment-brain
```

---

### Troubleshooting Plugins
- **Plugin not loading?** Double-check the file path and syntax.
- **Dependency errors?** Make sure all required npm packages are installed.
- **Unexpected results?** Add `console.log` statements to debug your plugin’s logic.

### Best Practices
- Keep plugins focused and well-documented.
- Use semantic versioning for updates.
- Share your plugins with the community for feedback and improvement.

---

(More recipes and advanced plugin patterns coming soon!) 

---

## Configuration Reference

Wonderland CLI is highly configurable. This section covers every available option, how to set them, and best practices for advanced users.

### Where is the config file?
- Default location: `~/.wonderlandrc` (or sometimes `~/.config/wonderland/config.json`)
- You can specify a custom config file with:
  ```sh
  wonderland --config /path/to/your/config.json
  ```

### Basic Config Options

| Option                | Type     | Description                                      | Example                        |
|-----------------------|----------|--------------------------------------------------|--------------------------------|
| `brains`              | array    | List of brain agent configs                      | `[ { name: "main", ... } ]`   |
| `plugins`             | array    | List of installed plugins                        | `[ "csv-to-markdown" ]`       |
| `default_brain`       | string   | Name of the default brain                        | `"main"`                      |
| `log_level`           | string   | Logging verbosity (`info`, `debug`, `warn`)      | `"info"`                      |
| `session_dir`         | string   | Directory for session logs                       | `"~/wonderland_sessions"`     |
| `resource_limits`     | object   | CPU/memory limits for agents                     | `{ cpu: 2, memory: 4096 }`     |
| `api_server`          | object   | API server settings                              | `{ port: 3000, enabled: true}` |
| `theme`               | string   | UI theme (`light`, `dark`, `auto`)               | `"dark"`                      |

### Example Config File
```json
{
  "brains": [
    { "name": "main", "specialty": "General" },
    { "name": "coder", "specialty": "Code Review" }
  ],
  "plugins": ["csv-to-markdown", "sentiment-brain"],
  "default_brain": "main",
  "log_level": "info",
  "session_dir": "~/wonderland_sessions",
  "resource_limits": { "cpu": 2, "memory": 4096 },
  "api_server": { "port": 3000, "enabled": true },
  "theme": "dark"
}
```

### Environment Variables
Override config options for a single run or in CI/CD:
- `WONDERLAND_CONFIG` — Path to config file
- `WONDERLAND_LOG_LEVEL` — Set log level
- `WONDERLAND_SESSION_DIR` — Override session directory
- `WONDERLAND_API_PORT` — Set API server port

Example:
```sh
WONDERLAND_LOG_LEVEL=debug wonderland ask "Debug this issue"
```

### Advanced Customization
- You can add custom fields to brains or plugins for extra metadata.
- Use scripts to generate or modify config files for different environments.

### Secrets Management
- Never store API keys or secrets directly in your config file.
- Use environment variables or a secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager).
- Example:
  ```sh
  export OPENAI_API_KEY=sk-xxxx
  wonderland ask "Use OpenAI for this task"
  ```
- Wonderland CLI will read secrets from the environment if referenced in plugins or agent configs.

### Security Best Practices
- Restrict permissions on your config and session directories (`chmod 600 ~/.wonderlandrc`).
- Regularly update Wonderland CLI and all plugins.
- Review third-party plugins before installing.
- Use version control for config templates, but never commit secrets.

---

## Scripting & Automation

Wonderland CLI is designed to play well with scripts and automation tools. This section shows how to automate tasks, integrate with other systems, and streamline your workflows using Bash, Python, PowerShell, and more.

### Bash Scripting
Automate routine tasks with shell scripts. Here’s an example that runs a research session, exports the results, and emails them:

```bash
#!/bin/bash
wonderland ask "Summarize the latest AI research" --multi-brain \
  | wonderland export --format pdf
mail -s "AI Research Summary" team@example.com < latest-session.pdf
```

### Python Automation
Use Python’s `subprocess` module to run Wonderland CLI commands and process the output:

```python
import subprocess

result = subprocess.run([
    'wonderland', 'ask', 'What are the top 5 AI trends?'
], capture_output=True, text=True)
print("Wonderland CLI says:", result.stdout)
```

### PowerShell Example
For Windows users, here’s a PowerShell script to automate a session and save the output:

```powershell
wonderland ask "Generate a project status report" --multi-brain | Out-File -FilePath report.txt
```

### Integrating with CI/CD
Run Wonderland CLI as part of your continuous integration pipeline. Example (GitHub Actions):

```yaml
jobs:
  wonderland:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Wonderland CLI
        run: npm install -g wonderland-cli
      - name: Run automated research
        run: wonderland ask "Check for new vulnerabilities in dependencies" --multi-brain
```

### Scheduling with Cron
Automate recurring tasks with cron jobs:

```cron
0 8 * * 1 wonderland ask "Weekly market update" --multi-brain | wonderland export --format markdown > ~/reports/market-update.md
```

### Calling External APIs
Combine Wonderland CLI with `curl` or other tools to fetch data and process it:

```sh
curl https://api.example.com/data | wonderland ask "Analyze this data for trends" --multi-brain
```

### Tips
- Use environment variables to manage secrets and config for scripts.
- Log outputs for auditing and debugging.
- Chain commands for complex workflows.

---

## API Reference

Wonderland CLI can run as a local API server, making it easy to integrate with other applications, scripts, or web services. This section documents the available endpoints, request/response formats, authentication, and integration tips.

### Starting the API Server
To start Wonderland CLI in server mode:
```sh
wonderland serve --port 3000
```
By default, the server listens on `localhost:3000`. You can change the port with the `--port` flag.

### Authentication
- By default, the API server is open on localhost. For production, use a reverse proxy or VPN for access control.
- You can enable token-based authentication in your config:
  ```json
  "api_server": { "port": 3000, "enabled": true, "auth_token": "your-secret-token" }
  ```
- Then, include the token in your requests:
  ```http
  Authorization: Bearer your-secret-token
  ```

### Endpoints

#### `POST /ask`
Ask a question or assign a task to the agents.
- **Request:**
  ```json
  {
    "prompt": "What is the capital of France?",
    "multi_brain": true
  }
  ```
- **Response:**
  ```json
  {
    "result": "The capital of France is Paris.",
    "details": { "brain": "main" }
  }
  ```

#### `GET /status`
Get the current status of all agents and brains.
- **Response:**
  ```json
  {
    "agents": [
      { "name": "main", "status": "idle" },
      { "name": "coder", "status": "busy" }
    ]
  }
  ```

#### `POST /plugin`
Install or update a plugin.
- **Request:**
  ```json
  {
    "plugin_path": "./my-plugin.js"
  }
  ```
- **Response:**
  ```json
  {
    "status": "installed",
    "plugin": "my-plugin"
  }
  ```

#### `GET /logs`
Retrieve recent session logs.
- **Response:**
  ```json
  {
    "logs": [
      { "session": "2025-07-14-001", "summary": "Research session on AI" }
    ]
  }
  ```

### Example: Calling the API with curl
```sh
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Summarize the latest AI news", "multi_brain": true}'
```

### Integration Tips
- Use the API to connect Wonderland CLI to chatbots, dashboards, or automation tools.
- For security, restrict access to the API server and use authentication tokens.
- Monitor `/status` for real-time agent updates in your own UI.

---

## User Stories & Case Studies

This section presents practical, scenario-based walkthroughs to show how Wonderland CLI can be used in real workflows. These are not testimonials or marketing claims—just clear, instructive examples.

### Scenario 1: Automating Weekly Research Reports
**Situation:** A team needs a summary of the latest AI research every Monday.

**Workflow:**
1. Set up a cron job to run:
   ```sh
   wonderland ask "Summarize the latest AI research" --multi-brain | wonderland export --format markdown > ~/reports/ai-weekly.md
   ```
2. The exported report is automatically saved for the team to review.

### Scenario 2: Code Review for Pull Requests
**Situation:** A developer wants to automate code review for new pull requests.

**Workflow:**
1. Configure a "Code Review" brain in Wonderland CLI.
2. Use a CI/CD pipeline to run:
   ```sh
   wonderland ask "Review the code in src/feature.js for bugs and improvements" --multi-brain
   ```
3. The output is posted as a comment or included in the PR review process.

### Scenario 3: Data Analysis for Sales Trends
**Situation:** An analyst needs to quickly analyze sales data and share insights with the team.

**Workflow:**
1. Use Wonderland CLI to analyze the CSV file:
   ```sh
   wonderland ask "Analyze the dataset in data/sales.csv and summarize key trends" --multi-brain
   ```
2. Export the results as a PDF:
   ```sh
   wonderland export --format pdf
   ```
3. Share the PDF with stakeholders.

### Scenario 4: Integrating with a Chatbot
**Situation:** A developer wants to connect Wonderland CLI to a custom chatbot for answering user questions.

**Workflow:**
1. Run Wonderland CLI in API server mode:
   ```sh
   wonderland serve --port 3000
   ```
2. The chatbot sends user questions to the `/ask` endpoint and displays the responses.

---

## Accessibility & Internationalization

Wonderland CLI is designed to be usable by as many people as possible. This section covers accessibility features, language support, and tips for making the CLI work well for everyone.

### Screen Reader Support
- Wonderland CLI outputs plain, structured text, making it compatible with most screen readers.
- Use the `--no-color` flag to disable colored output for better screen reader compatibility:
  ```sh
  wonderland --no-color
  ```

### Keyboard Navigation
- All CLI interactions are keyboard-based—no mouse required.
- Use arrow keys, tab, and enter to navigate interactive prompts.

### High-Contrast & Colorblind Modes
- Use the `--theme high-contrast` or `--theme monochrome` options for improved visibility.
- You can set your preferred theme in the config file:
  ```json
  "theme": "high-contrast"
  ```

### Language Support
- Wonderland CLI supports UTF-8 input and output, so you can use it in any language.
- For localized prompts or output, set the `LANG` environment variable (if supported by your system):
  ```sh
  LANG=es_ES.UTF-8 wonderland ask "¿Cuál es la capital de Francia?"
  ```
- Community-contributed language packs may be available as plugins.

### Tips for Diverse Teams
- Share config files with preferred accessibility settings.
- Encourage team members to contribute language packs or accessibility improvements.
- Document any customizations for new users joining your team.

### Best Practices
- Test your workflows with screen readers and high-contrast modes.
- Use clear, simple language in prompts and plugin output.
- Report accessibility issues or suggest improvements to the Wonderland CLI community.

---

## Security & Privacy

Keeping your data and workflows safe is a top priority. This section covers how Wonderland CLI handles security and privacy, and what you can do to further protect your information.

### Local-First Design
- Wonderland CLI processes all data locally by default—no data is sent to external servers unless you explicitly configure a plugin or integration to do so.
- Session logs, configs, and outputs are stored on your machine.

### Protecting Sensitive Data
- Never store API keys, passwords, or secrets in plain text config files. Use environment variables or a secrets manager.
- Restrict permissions on config and session directories:
  ```sh
  chmod 600 ~/.wonderlandrc
  chmod 700 ~/wonderland_sessions
  ```
- Regularly review and clean up old session logs if they contain sensitive information.

### Plugin Security
- Only install plugins from trusted sources. Review plugin code before use, especially if it accesses external APIs or files.
- Keep plugins up to date to benefit from security patches.
- Use the `--audit-plugins` command (if available) to check for known vulnerabilities.

### Privacy Controls
- Use the `--no-logs` flag to disable session logging for sensitive tasks:
  ```sh
  wonderland ask "Handle confidential data" --no-logs
  ```
- You can configure log retention policies in your config file.

### Compliance
- Wonderland CLI is designed for local use, but if you process regulated data (e.g., GDPR, HIPAA), ensure your workflows and storage comply with relevant laws.
- Document your data flows and access controls for audits.

### Team Security
- Share only sanitized configs and session logs with your team.
- Use version control for config templates, but never commit secrets or sensitive data.
- Rotate API keys and secrets regularly.

### Best Practices
- Update Wonderland CLI and plugins frequently.
- Use strong, unique passwords for your system accounts.
- Report security issues to the Wonderland CLI maintainers.

---

## Performance Tuning

Wonderland CLI is designed to be efficient, but you can further optimize its performance for your workflows and hardware. This section covers advanced tips for getting the best speed and resource usage.

### Adjusting Resource Limits
- Set CPU and memory limits for agents in your config file:
  ```json
  "resource_limits": { "cpu": 2, "memory": 4096 }
  ```
- Tune these values based on your system’s capabilities and the number of agents you run.

### Managing Parallelism
- Use the `--multi-brain` flag to run tasks in parallel, but be mindful of your system’s limits.
- For heavy workloads, stagger tasks or limit the number of concurrent agents.

### Monitoring Resource Usage
- Use the `wonderland resources` command to view real-time CPU and memory usage.
- Monitor system resource usage with tools like `htop` (Linux/macOS) or Task Manager (Windows).

### Troubleshooting Slowdowns
- Check for high CPU or memory usage from other applications.
- Reduce the number of active agents or plugins if you notice lag.
- Use the `--log-level debug` flag to identify bottlenecks in workflows.

### Optimizing for Teams
- Run Wonderland CLI on dedicated machines for team-wide tasks.
- Use shared session directories on fast storage for collaborative workflows.
- Schedule resource-intensive jobs during off-peak hours.

### Best Practices
- Regularly update Wonderland CLI and plugins for performance improvements.
- Profile your workflows and adjust agent specialties for efficiency.
- Clean up old session logs and unused plugins to free up resources.

---

## Glossary & Index

This section provides definitions and explanations for key terms, acronyms, and features in Wonderland CLI. Use it as a quick reference or to clarify unfamiliar concepts. Terms are listed alphabetically.

---

**Agent**  
A general term for any entity (brain or tool) that can perform actions in Wonderland CLI. See [Core Concepts](#core-concepts-brains-agents-and-plugins).

**API Server**  
A mode where Wonderland CLI runs as a local server, exposing endpoints for integration. See [API Reference](#api-reference).

**Brain**  
An AI agent with a specific specialty (e.g., coding, research). Multiple brains can collaborate or critique each other. See [Core Concepts](#core-concepts-brains-agents-and-plugins).

**Config File**  
A file (usually `~/.wonderlandrc`) that stores settings for Wonderland CLI. See [Configuration Reference](#configuration-reference).

**Dashboard**  
A live status view of all agents and brains. See [Command Reference](#command-reference).

**Export**  
The process of saving session results in various formats (Markdown, PDF, JSON). See [Command Reference](#command-reference).

**Log Level**  
Controls the verbosity of CLI output (e.g., info, debug, warn). See [Configuration Reference](#configuration-reference).

**Multi-Brain**  
A mode where multiple brains work on a task in parallel. See [Advanced Usage](#advanced-usage).

**Plugin**  
An add-on that extends Wonderland CLI’s capabilities. Can be a new brain, tool, or integration. See [Plugin Development](#plugin-development).

**Prompt**  
A question or instruction given to Wonderland CLI or an agent.

**Replay**  
Reviewing a previous session to see how agents worked through a problem. See [Command Reference](#command-reference).

**Resource Limits**  
Settings that control how much CPU and memory agents can use. See [Performance Tuning](#performance-tuning).

**Session**  
A record of a single interaction or workflow in Wonderland CLI.

**Tool**  
A type of plugin that performs a specific function (e.g., web search, data formatting).

---

For more details on any term, refer to the relevant section linked above or use your text editor’s search feature.

---

Next: Fun & Easter Eggs

---

## Fun & Easter Eggs

Wonderland CLI has a few hidden surprises for curious users! Here’s how to discover and enjoy some of the playful features built into the CLI.

### The "You Are So Slay" Secret Command
There’s a special command that, when entered exactly, will reveal a hidden message:

```sh
wonderland -poop -slay -what -the -fuck -d -l -l -m -eg
```

If you run this command, Wonderland CLI will respond with:

```
you are so slay
```

Try it out when you need a little boost!

### The Color-Changing Pixel
In one of the CLI menus, you might spot a single pixel (character/block) that changes color every second. It’s just a fun visual Easter egg—no special meaning, just a bit of flair to brighten your day. Keep an eye out for it as you explore the menus!

### More Surprises
- Explore the CLI, try unusual flag combinations, and check the docs for hints—there may be more hidden features waiting to be found.
- If you discover something fun, share it with the community (but don’t spoil all the surprises for others!).

---

Thanks for exploring Wonderland CLI! If you have ideas for more Easter eggs or fun features, let the maintainers know. 