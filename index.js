#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import ora from 'ora';
import Conf from 'conf';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import https from 'https';
import { execSync } from 'child_process';
import readline from 'readline';
import http from 'http';

const config = new Conf({ projectName: 'wonderland-cli' });
const program = new Command();

// Ollama API base URL - can be configured via environment variable
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Set up the CLI
program
  .name('wonderland')
  .description('Wonderland CLI 1.2.0 - An AI system to power up your Ollama bot with brains')
  .version('1.2.0');

// Logging system
const LOG_DIR = './logs';
const LOG_FILE = path.join(LOG_DIR, `session-${Date.now()}.json`);

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Chat history for recall functionality
let chatHistory = [];

// Logging functions
function logSession(data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...data
  };
  
  fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry, null, 2) + '\n---\n');
}

function logAgentStep(agent, prompt, response, duration, toolCalls = []) {
  logSession({
    type: 'agent_step',
    agent,
    prompt,
    response,
    duration,
    toolCalls
  });
}

// Check if Ollama is running
async function checkOllama() {
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return true;
  } catch (error) {
    return false;
  }
}

// Get available models from Ollama
async function getAvailableModels() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return response.data.models || [];
  } catch (error) {
    console.error(chalk.red('Error fetching models from Ollama'));
    return [];
  }
}

// Generate streaming response from Ollama model
async function generateStreamingResponse(model, prompt, systemPrompt = '', agentName = '') {
  const startTime = Date.now();
  let fullResponse = '';
  let toolCalls = [];
  let responseLength = 0;
  let lastProgressUpdate = Date.now();
  
  try {
    // Enhanced thinking indicator with animated dots
    const thinkingSpinner = ora({
      text: chalk.blue(`🧠 ${agentName} is thinking`),
      color: 'blue',
      spinner: 'dots'
    }).start();
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: model,
      prompt: prompt,
      system: systemPrompt,
      stream: true
    }, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      // Stop the thinking spinner and start response
      thinkingSpinner.stop();
      
      // Show typing indicator
      console.log(chalk.cyan(`💬 ${agentName} is typing...\n`));
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            if (data.response) {
              // Add typing delay for more natural feel
              const now = Date.now();
              if (now - lastProgressUpdate > 50) { // 50ms delay between characters
                process.stdout.write(chalk.cyan(data.response));
                fullResponse += data.response;
                responseLength += data.response.length;
                lastProgressUpdate = now;
                
                // Show progress indicator every 100 characters
                if (responseLength % 100 === 0) {
                  process.stdout.write(chalk.gray(` [${responseLength} chars]`));
                }
              } else {
                // Buffer the response for smoother output
                fullResponse += data.response;
                responseLength += data.response.length;
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      });

      response.data.on('end', () => {
        const duration = Date.now() - startTime;
        const wordsPerMinute = Math.round((responseLength / 5) / (duration / 60000));
        
        console.log(chalk.green(`\n✅ ${agentName} completed (${duration}ms, ${responseLength} chars, ~${wordsPerMinute} wpm)\n`));
        
        // Extract tool calls from response
        toolCalls = extractToolCalls(fullResponse);
        
        logAgentStep(agentName, prompt, fullResponse, duration, toolCalls);
        resolve({ response: fullResponse, toolCalls });
      });

      response.data.on('error', (error) => {
        thinkingSpinner.stop();
        reject(new Error(`Error generating response from ${model}: ${error.message}`));
      });
    });
    
  } catch (error) {
    throw new Error(`Error generating response from ${model}: ${error.message}`);
  }
}

// Extract tool calls from response
function extractToolCalls(response) {
  const toolCalls = [];
  const toolRegex = /\/usetool=(\w+)\?([^\/\n]+)/g;
  let match;
  
  while ((match = toolRegex.exec(response)) !== null) {
    toolCalls.push({
      tool: match[1],
      query: match[2].trim()
    });
  }
  
  return toolCalls;
}

// Execute tool calls
async function executeToolCalls(toolCalls, brainAgent) {
  const results = [];
  
  for (const toolCall of toolCalls) {
    console.log(chalk.cyan(`\n🔧 [${toolCalls.indexOf(toolCall) + 1}/${toolCalls.length}] Executing: ${toolCall.tool}`));
    console.log(chalk.gray(`   Query: ${toolCall.query}`));
    console.log(chalk.gray('   ─'.repeat(40)));
    
    if (toolCall.tool === 'brain') {
      // Call brain agent for information gathering
      const brainPrompt = `You are an information gathering specialist. The main agent needs information about: "${toolCall.query}". Provide detailed, accurate information that would help with this query. Use \\n for line breaks and provide comprehensive, helpful information.`;
      
      const brainResult = await generateStreamingResponse(brainAgent, brainPrompt, '', 'Brain Agent');
      results.push({
        tool: 'brain',
        query: toolCall.query,
        result: brainResult.response
      });
      
    } else if (toolCall.tool === 'recallchatlog') {
      // Recall chat history
      const timeframe = toolCall.query;
      let relevantHistory = [];
      
      if (timeframe === 'today') {
        const today = new Date().toDateString();
        relevantHistory = chatHistory.filter(log => 
          new Date(log.timestamp).toDateString() === today
        );
      } else if (timeframe === 'yesterday') {
        const yesterday = new Date(Date.now() - 24*60*60*1000).toDateString();
        relevantHistory = chatHistory.filter(log => 
          new Date(log.timestamp).toDateString() === yesterday
        );
      } else if (timeframe === 'this week') {
        const weekAgo = new Date(Date.now() - 7*24*60*60*1000);
        relevantHistory = chatHistory.filter(log => 
          new Date(log.timestamp) >= weekAgo
        );
      }
      
      const historyText = relevantHistory.map(log => 
        `${log.timestamp}: ${log.prompt} -> ${log.response}`
      ).join('\n');
      
      results.push({
        tool: 'recallchatlog',
        query: timeframe,
        result: historyText || 'No relevant chat history found.'
      });
      
      console.log(chalk.gray(`📚 Retrieved ${relevantHistory.length} chat entries for ${timeframe}`));
      
    } else if (toolCall.tool === 'finalans') {
      // Final answer tool - extract the answer
      results.push({
        tool: 'finalans',
        query: 'final_answer',
        result: toolCall.query
      });
      
      console.log(chalk.green(`\n🎯 Final Answer: ${toolCall.query}`));
    } else if (toolCall.tool === 'websearch') {
      // Perform a real web search using DuckDuckGo Instant Answer API
      const query = encodeURIComponent(toolCall.query);
      const url = `https://api.duckduckgo.com/?q=${query}&format=json&no_redirect=1&no_html=1`;
      const webResult = await new Promise((resolve) => {
        https.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              let answer = json.AbstractText || json.Answer || json.RelatedTopics?.[0]?.Text || 'No direct answer found.';
              resolve(answer);
            } catch {
              resolve('No answer found (error parsing web search result).');
            }
          });
        }).on('error', () => resolve('No answer found (web search error).'));
      });
      results.push({
        tool: 'websearch',
        query: toolCall.query,
        result: webResult
      });
      console.log(chalk.cyan(`🌐 Web Search Result: ${webResult}`));
    }
  }
  
  return results;
}

// Generate non-streaming response (for setup and status)
async function generateResponse(model, prompt, systemPrompt = '') {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: model,
      prompt: prompt,
      system: systemPrompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    throw new Error(`Error generating response from ${model}: ${error.message}`);
  }
}

// Setup command
program
  .command('setup')
  .description('Setup your multi-brain agent configuration')
  .action(async () => {
    console.log(chalk.blue('🧠 Multi-Brain Agent Setup'));
    console.log(chalk.gray('First, let\'s check if Ollama is running...'));
    
    const ollamaRunning = await checkOllama();
    if (!ollamaRunning) {
      console.log(chalk.red('❌ Ollama is not running!'));
      console.log(chalk.yellow('Please install and start Ollama first:'));
      console.log(chalk.gray('1. Install Ollama: https://ollama.ai'));
      console.log(chalk.gray('2. Start Ollama: ollama serve'));
      console.log(chalk.gray('3. Pull some models: ollama pull llama2'));
      return;
    }
    
    console.log(chalk.green('✅ Ollama is running!'));
    
    const models = await getAvailableModels();
    if (models.length === 0) {
      console.log(chalk.yellow('⚠️  No models found. Please pull some models first:'));
      console.log(chalk.gray('ollama pull llama2'));
      console.log(chalk.gray('ollama pull codellama'));
      console.log(chalk.gray('ollama pull mistral'));
      return;
    }
    
    const modelChoices = models.map(model => ({
      name: `${model.name} (${model.size})`,
      value: model.name
    }));
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'mainAgent',
        message: 'Choose your main agent (controls everything and can call other agents):',
        choices: modelChoices
      },
      {
        type: 'list',
        name: 'brainAgent',
        message: 'Choose your brain agent (specialized for information gathering):',
        choices: modelChoices
      }
    ]);
    
    config.set('mainAgent', answers.mainAgent);
    config.set('brainAgent', answers.brainAgent);
    
    console.log(chalk.green('✅ Configuration saved!'));
    console.log(chalk.blue('Main Agent:'), answers.mainAgent);
    console.log(chalk.blue('Brain Agent:'), answers.brainAgent);
  });

// Ask command - main workflow with tool-based system
program
  .command('ask')
  .description('Ask your multi-brain agent a question')
  .argument('<prompt>', 'your question or prompt')
  .option('-v, --verbose', 'show detailed workflow')
  .option('-n, --no-log', 'disable logging')
  .option('-i, --incommandprompt <prompt>', 'test with a specific prompt')
  .action(async (prompt, options) => {
    const mainAgent = config.get('mainAgent');
    const brainAgent = config.get('brainAgent');
    
    if (!mainAgent || !brainAgent) {
      console.log(chalk.red('❌ Please run setup first: wonderland setup'));
      return;
    }
    
    // Use incommandprompt if provided
    const finalPrompt = options.incommandprompt || prompt;
    
    // Log the session start
    if (options.log !== false) {
      logSession({
        type: 'session_start',
        prompt: finalPrompt,
        agents: { mainAgent, brainAgent }
      });
    }
    
    // Enhanced UI with status bar and better visual hierarchy
    console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║                    🧠 Wonderland CLI 1.2.0                   ║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');
    
    // Status bar
    const statusBar = [
      chalk.blue('📊 Status:'),
      chalk.green('✅ Ready'),
      chalk.blue('|'),
      chalk.cyan('🤖 Main Agent:'),
      chalk.white(mainAgent),
      chalk.blue('|'),
      chalk.cyan('🧠 Brain Agent:'),
      chalk.white(brainAgent)
    ].join(' ');
    
    console.log(statusBar);
    console.log(chalk.gray('─'.repeat(80)));
    
    // Enhanced prompt display
    console.log(chalk.yellow('💭 Question:'));
    console.log(chalk.white(`   ${finalPrompt}`));
    console.log('');
    
    // Session info in a subtle way
    if (options.verbose) {
      console.log(chalk.gray(`📝 Session Log: ${LOG_FILE}`));
      console.log('');
    }
    
    try {
      // Main agent system prompt with tool instructions
      const mainAgentSystemPrompt = `You are a helpful AI assistant. Answer questions directly.

Tools:
- /usetool=brain?"question" - Get detailed info from brain agent
- /usetool=recallchatlog?"timeframe" - Check chat history
- /usetool=finalans?"answer" - End with your answer

IMPORTANT:
- If the user's question is a simple greeting or can be answered directly, reply ONLY with /usetool=finalans?"your answer". Do NOT use any other tools, explanations, or extra text for simple greetings or direct questions. Do not output anything else.
- For complex questions, use the brain agent first, then end with /usetool=finalans?"your answer".
- Use \\n for line breaks.`;

      const mainAgentPrompt = `User: "${finalPrompt}"

Answer this question directly. If simple, answer now and ONLY output /usetool=finalans?"your answer". If complex, use /usetool=brain?"specific question" first, then end with /usetool=finalans?"your answer".

Answer:`;
      
      const mainResult = await generateStreamingResponse(mainAgent, mainAgentPrompt, mainAgentSystemPrompt, 'Main Agent');
      
      // Execute any tool calls found in the main agent's response
      if (mainResult.toolCalls.length > 0) {
        console.log(chalk.yellow('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.yellow(`║                    🔧 TOOL EXECUTION (${mainResult.toolCalls.length} tools)                    ║`));
        console.log(chalk.yellow('╚══════════════════════════════════════════════════════════════╝'));
        const toolResults = await executeToolCalls(mainResult.toolCalls, brainAgent);
        
        // Post-processing: Only show the last /usetool=finalans? result for simple prompts
        const allFinalAnswers = toolResults.filter(result => result.tool === 'finalans');
        const finalAnswer = allFinalAnswers.length > 0 ? allFinalAnswers[allFinalAnswers.length - 1] : null;
        
        if (finalAnswer) {
          // We have a final answer, store it
          chatHistory.push({
            timestamp: new Date().toISOString(),
            prompt: finalPrompt,
            response: finalAnswer.result,
            toolCalls: mainResult.toolCalls,
            toolResults: toolResults
          });
          
          // Enhanced final answer display
          console.log(chalk.green('\n╔══════════════════════════════════════════════════════════════╗'));
          console.log(chalk.green('║                        🎯 FINAL ANSWER                        ║'));
          console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
          console.log(chalk.white(`\n${finalAnswer.result}`));
          console.log(chalk.green('\n╔══════════════════════════════════════════════════════════════╗'));
          console.log(chalk.green('║                      ✅ SESSION COMPLETE                      ║'));
          console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
          
        } else {
          // No final answer yet, give main agent the tool results
          console.log(chalk.blue('\n🤖 Main Agent processing tool results...\n'));
          
          const toolResultsText = toolResults.map(result => 
            `Tool: ${result.tool}\nQuery: ${result.query}\nResult: ${result.result}`
          ).join('\n\n');
          
          const followupPrompt = `User asked: "${finalPrompt}"

Tool results:
${toolResultsText}

Provide your final answer. End with /usetool=finalans?"your answer"`;
          
          const finalResult = await generateStreamingResponse(mainAgent, followupPrompt, mainAgentSystemPrompt, 'Main Agent (Final)');
          
          // Execute final answer tool call
          const finalToolCalls = extractToolCalls(finalResult.response);
          const finalToolResults = await executeToolCalls(finalToolCalls, brainAgent);
          
          const allFinalAnswers = finalToolResults.filter(result => result.tool === 'finalans');
          const finalAnswer = allFinalAnswers.length > 0 ? allFinalAnswers[allFinalAnswers.length - 1] : null;
          
          if (finalAnswer) {
            chatHistory.push({
              timestamp: new Date().toISOString(),
              prompt: finalPrompt,
              response: finalAnswer.result,
              toolCalls: [...mainResult.toolCalls, ...finalToolCalls],
              toolResults: [...toolResults, ...finalToolResults]
            });
            
            console.log(chalk.green('\n🎯 Final Answer:'));
            console.log(finalAnswer.result);
            console.log(chalk.green('\n🎯 Session Complete!'));
          }
        }
      } else {
        // No tool calls - direct answer
        console.log(chalk.green('\n✅ Direct answer completed!'));
        
        // Store in chat history
        chatHistory.push({
          timestamp: new Date().toISOString(),
          prompt: finalPrompt,
          response: mainResult.response,
          toolCalls: []
        });
      }
      
      // Log the session completion
      if (options.log !== false) {
        logSession({
          type: 'session_complete',
          finalResponse: mainResult.response
        });
      }
      
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      
      if (options.log !== false) {
        logSession({
          type: 'session_error',
          error: error.message
        });
      }
    }
  });

// Status command
program
  .command('status')
  .description('Show current configuration and Ollama status')
  .action(async () => {
    console.log(chalk.blue('📊 Multi-Brain Agent Status'));
    console.log('');
    
    const ollamaRunning = await checkOllama();
    console.log(chalk.blue('Ollama Status:'), ollamaRunning ? chalk.green('✅ Running') : chalk.red('❌ Not Running'));
    
    if (ollamaRunning) {
      const models = await getAvailableModels();
      console.log(chalk.blue('Available Models:'), models.length);
      models.forEach(model => {
        console.log(chalk.gray(`  - ${model.name} (${model.size})`));
      });
    }
    
    console.log('');
    console.log(chalk.blue('Configuration:'));
    const mainAgent = config.get('mainAgent');
    const brainAgent = config.get('brainAgent');
    
    if (mainAgent) {
      console.log(chalk.green('  Main Agent:'), mainAgent);
      console.log(chalk.blue('  Brain Agent:'), brainAgent);
    } else {
      console.log(chalk.red('  Not configured. Run: wonderland setup'));
    }
    
    console.log('');
    console.log(chalk.blue('Chat History:'));
    console.log(chalk.gray('  Total entries:'), chatHistory.length);
    if (chatHistory.length > 0) {
      console.log(chalk.gray('  Last entry:'), new Date(chatHistory[chatHistory.length - 1].timestamp).toLocaleString());
    }
    
    console.log('');
    console.log(chalk.blue('Logging:'));
    console.log(chalk.gray('  Log Directory:'), LOG_DIR);
    console.log(chalk.gray('  Current Session:'), LOG_FILE);
  });

// Logs command
program
  .command('logs')
  .description('Show recent log files')
  .option('-n, --number <count>', 'number of recent logs to show', '5')
  .action((options) => {
    console.log(chalk.blue('📋 Recent Log Files'));
    console.log('');
    
    if (!fs.existsSync(LOG_DIR)) {
      console.log(chalk.yellow('No logs directory found.'));
      return;
    }
    
    const logFiles = fs.readdirSync(LOG_DIR)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, parseInt(options.number));
    
    if (logFiles.length === 0) {
      console.log(chalk.yellow('No log files found.'));
      return;
    }
    
    logFiles.forEach((file, index) => {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(chalk.cyan(`${index + 1}. ${file}`));
      console.log(chalk.gray(`   Size: ${(stats.size / 1024).toFixed(2)} KB`));
      console.log(chalk.gray(`   Modified: ${stats.mtime.toLocaleString()}`));
      console.log('');
    });
  });

// Reset command
program
  .command('reset')
  .description('Reset configuration and chat history')
  .action(() => {
    config.clear();
    chatHistory = [];
    console.log(chalk.green('✅ Configuration and chat history reset!'));
  });

// --- Session Export ---
program
  .command('export')
  .description('Export the latest session log to markdown, json, or pdf')
  .option('--format <format>', 'Export format: markdown, json, or pdf', 'markdown')
  .option('--output <file>', 'Output file name')
  .action((opts) => {
    // Find latest session log
    const logFiles = fs.readdirSync(LOG_DIR).filter(f => f.startsWith('session-') && f.endsWith('.json'));
    if (logFiles.length === 0) {
      console.log(chalk.red('No session logs found.'));
      return;
    }
    const latestLog = logFiles.sort().reverse()[0];
    const logPath = path.join(LOG_DIR, latestLog);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const entries = logContent.split('\n---\n').filter(Boolean).map(e => JSON.parse(e));

    let output = '';
    if (opts.format === 'json') {
      output = JSON.stringify(entries, null, 2);
      const outFile = opts.output || 'session-export.json';
      fs.writeFileSync(outFile, output);
      console.log(chalk.green(`Session exported to ${outFile}`));
    } else if (opts.format === 'markdown') {
      output = `# Wonderland CLI Session Log\n\n`;
      entries.forEach((e, i) => {
        output += `## Step ${i + 1}\n`;
        output += `- **Timestamp:** ${e.timestamp}\n`;
        if (e.prompt) output += `- **Prompt:** ${e.prompt}\n`;
        if (e.response) output += `- **Response:**\n\n    ${e.response.replace(/\n/g, '\n    ')}\n`;
        if (e.toolCalls && e.toolCalls.length) {
          output += `- **Tool Calls:**\n`;
          e.toolCalls.forEach(tc => {
            output += `    - ${tc.tool}: ${tc.query}\n`;
          });
        }
        output += '\n';
      });
      const outFile = opts.output || 'session-export.md';
      fs.writeFileSync(outFile, output);
      console.log(chalk.green(`Session exported to ${outFile}`));
    } else if (opts.format === 'pdf') {
      const outFile = opts.output || 'session-export.pdf';
      const doc = new PDFDocument({ margin: 40 });
      doc.pipe(fs.createWriteStream(outFile));
      doc.font('Times-Roman').fontSize(18).text('Wonderland CLI Session Log', { align: 'center' });
      doc.moveDown();
      entries.forEach((e, i) => {
        doc.fontSize(14).text(`Step ${i + 1}`, { underline: true });
        doc.fontSize(12).text(`Timestamp: ${e.timestamp}`);
        if (e.prompt) doc.text(`Prompt: ${e.prompt}`);
        if (e.response) doc.text('Response:').font('Times-Roman').fontSize(11).text(e.response, { indent: 20 });
        if (e.toolCalls && e.toolCalls.length) {
          doc.fontSize(12).text('Tool Calls:');
          e.toolCalls.forEach(tc => {
            doc.fontSize(11).text(`- ${tc.tool}: ${tc.query}`, { indent: 20 });
          });
        }
        doc.moveDown();
      });
      doc.end();
      console.log(chalk.green(`Session exported to ${outFile}`));
    } else {
      console.log(chalk.red('Unsupported format. Use markdown, json, or pdf.'));
      return;
    }
  });

// --- Plugin System ---
const PLUGIN_DIR = path.join(process.cwd(), 'plugins');

// Ensure plugins directory exists
if (!fs.existsSync(PLUGIN_DIR)) {
  fs.mkdirSync(PLUGIN_DIR, { recursive: true });
}

// Load all plugins
function loadPlugins() {
  const plugins = {};
  const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const pluginPath = path.join(PLUGIN_DIR, file);
      // eslint-disable-next-line
      const plugin = require(pluginPath);
      plugins[file.replace(/\.js$/, '')] = plugin;
    } catch (e) {
      console.error(chalk.red(`Failed to load plugin ${file}: ${e.message}`));
    }
  }
  return plugins;
}

// Plugin management commands
program
  .command('plugin add <path>')
  .description('Add a plugin (JS file) to the plugins directory')
  .action((pluginPath) => {
    const dest = path.join(PLUGIN_DIR, path.basename(pluginPath));
    fs.copyFileSync(pluginPath, dest);
    console.log(chalk.green(`Plugin added: ${dest}`));
  });

program
  .command('plugin list')
  .description('List all installed plugins')
  .action(() => {
    const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js'));
    if (files.length === 0) {
      console.log(chalk.yellow('No plugins installed.'));
    } else {
      console.log(chalk.green('Installed plugins:'));
      files.forEach(f => console.log(' -', f));
    }
  });

program
  .command('plugin remove <name>')
  .description('Remove a plugin by name (without .js)')
  .action((name) => {
    const file = path.join(PLUGIN_DIR, name.endsWith('.js') ? name : name + '.js');
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(chalk.green(`Plugin removed: ${file}`));
    } else {
      console.log(chalk.red('Plugin not found:', file));
    }
  });

// --- Model Management ---
program
  .command('models list')
  .description('List all available models from Ollama')
  .action(async () => {
    const models = await getAvailableModels();
    if (models.length === 0) {
      console.log(chalk.yellow('No models found.')); 
    } else {
      console.log(chalk.green('Available models:'));
      models.forEach(m => console.log(' -', m.name));
    }
  });

program
  .command('models pull <model>')
  .description('Pull a new model from Ollama')
  .action(async (model) => {
    try {
      const spinner = ora(`Pulling model: ${model}`).start();
      await axios.post(`${OLLAMA_BASE_URL}/api/pull`, { name: model });
      spinner.succeed(`Model pulled: ${model}`);
    } catch (e) {
      console.error(chalk.red('Failed to pull model:', e.message));
    }
  });

program
  .command('models use <model>')
  .description('Set the default model for main/brain agent')
  .action((model) => {
    config.set('defaultModel', model);
    console.log(chalk.green(`Default model set to: ${model}`));
  });

// --- Prompt Templates ---
program
  .command('template save <name> <prompt>')
  .description('Save a prompt template')
  .action((name, prompt) => {
    const templates = config.get('templates') || {};
    templates[name] = prompt;
    config.set('templates', templates);
    console.log(chalk.green(`Template saved: ${name}`));
  });

program
  .command('template use <name>')
  .description('Use a saved prompt template')
  .action((name) => {
    const templates = config.get('templates') || {};
    if (!templates[name]) {
      console.log(chalk.red(`Template not found: ${name}`));
      return;
    }
    console.log(chalk.green(`Prompt for '${name}':`));
    console.log(templates[name]);
  });

program
  .command('template list')
  .description('List all saved prompt templates')
  .action(() => {
    const templates = config.get('templates') || {};
    const names = Object.keys(templates);
    if (names.length === 0) {
      console.log(chalk.yellow('No templates saved.'));
    } else {
      console.log(chalk.green('Saved templates:'));
      names.forEach(n => console.log(' -', n));
    }
  });

program
  .command('template remove <name>')
  .description('Remove a saved prompt template')
  .action((name) => {
    const templates = config.get('templates') || {};
    if (!templates[name]) {
      console.log(chalk.red(`Template not found: ${name}`));
      return;
    }
    delete templates[name];
    config.set('templates', templates);
    console.log(chalk.green(`Template removed: ${name}`));
  });

// --- Agent Personalities ---
const PERSONALITIES = {
  friendly: 'You are a friendly, helpful AI assistant. Respond warmly and positively.',
  strict: 'You are a strict, concise AI assistant. Respond with precision and minimal fluff.',
  creative: 'You are a creative, imaginative AI assistant. Respond with flair and originality.'
};

program
  .command('persona list')
  .description('List available agent personalities')
  .action(() => {
    console.log(chalk.green('Available personalities:'));
    Object.keys(PERSONALITIES).forEach(p => console.log(' -', p));
    if (config.get('customPersonality')) {
      console.log(' - custom');
    }
  });

program
  .command('persona set <personality>')
  .description('Set the active agent personality (friendly, strict, creative, custom)')
  .action((personality) => {
    if (personality === 'custom' && !config.get('customPersonality')) {
      console.log(chalk.red('No custom personality set. Use persona custom <prompt> first.'));
      return;
    }
    if (personality !== 'custom' && !PERSONALITIES[personality]) {
      console.log(chalk.red('Unknown personality. Use persona list to see options.'));
      return;
    }
    config.set('activePersonality', personality);
    console.log(chalk.green(`Active personality set to: ${personality}`));
  });

program
  .command('persona custom [prompt]')
  .description('Set, view, or reset a custom system prompt for the agent')
  .option('--reset', 'Reset custom personality to default')
  .action((prompt, opts) => {
    if (opts.reset) {
      config.delete('customPersonality');
      if (config.get('activePersonality') === 'custom') {
        config.set('activePersonality', 'friendly');
      }
      console.log(chalk.green('Custom personality reset to default.'));
      return;
    }
    if (!prompt) {
      const current = config.get('customPersonality');
      if (current) {
        console.log(chalk.green('Current custom personality:'));
        console.log(current);
      } else {
        console.log(chalk.yellow('No custom personality set.'));
      }
      return;
    }
    config.set('customPersonality', prompt);
    config.set('activePersonality', 'custom');
    console.log(chalk.green('Custom personality set and activated.'));
  });

// Use selected personality in agent logic
function getActivePersonalityPrompt() {
  const active = config.get('activePersonality') || 'friendly';
  if (active === 'custom') {
    return config.get('customPersonality') || PERSONALITIES.friendly;
  }
  return PERSONALITIES[active] || PERSONALITIES.friendly;
}

// Load plugins at startup
const loadedPlugins = loadPlugins();

// Use selected model as default in agent logic
const DEFAULT_MODEL = config.get('defaultModel') || 'llama2';

async function checkForUpdate() {
  const pkg = require('./package.json');
  const currentVersion = pkg.version;
  const lastCheck = config.get('updateRemindAfter');
  if (lastCheck && Date.now() < lastCheck) return;
  try {
    const res = await axios.get('https://registry.npmjs.org/wonderland-cli/latest');
    const latest = res.data.version;
    if (latest !== currentVersion) {
      const inquirer = await import('inquirer');
      const { action } = await inquirer.default.prompt([
        {
          type: 'list',
          name: 'action',
          message: `A new version of Wonderland CLI is available!\nYou can update from ${currentVersion} to ${latest}\nChoose:`,
          choices: [
            { name: 'Update now (will automatically run: npm install -g wonderland-cli)', value: 'now' },
            { name: 'Update later', value: 'later' }
          ]
        }
      ]);
      if (action === 'now') {
        try {
          execSync('npm install -g wonderland-cli', { stdio: 'inherit' });
          console.log(chalk.green('✅ Wonderland CLI updated! Please restart your terminal session.'));
          process.exit(0);
        } catch (e) {
          console.log(chalk.red('Update failed. Please run: npm install -g wonderland-cli'));
        }
      } else {
        const { remind } = await inquirer.default.prompt([
          {
            type: 'list',
            name: 'remind',
            message: 'Remind me in:',
            choices: [
              { name: '5 min', value: 5 * 60 * 1000 },
              { name: '10 min', value: 10 * 60 * 1000 },
              { name: '30 min', value: 30 * 60 * 1000 },
              { name: '1 hour', value: 60 * 60 * 1000 },
              { name: '1 day', value: 24 * 60 * 60 * 1000 },
              { name: '1 week', value: 7 * 24 * 60 * 60 * 1000 },
              { name: '1 month', value: 30 * 24 * 60 * 60 * 1000 },
              { name: '3 months', value: 90 * 24 * 60 * 60 * 1000 }
            ]
          }
        ]);
        config.set('updateRemindAfter', Date.now() + remind);
        console.log(chalk.yellow('⏰ You will be reminded to update after your chosen interval.'));
      }
    }
  } catch {}
}
// Call checkForUpdate before program.parse()
(async () => { await checkForUpdate(); program.parse(); })(); 

program
  .command('chat')
  .description('Start an interactive chat session with Wonderland CLI')
  .action(async () => {
    const mainAgent = config.get('mainAgent');
    const brainAgent = config.get('brainAgent');
    if (!mainAgent || !brainAgent) {
      console.log(chalk.red('❌ Please run setup first: wonderland setup'));
      return;
    }
    
    // Enhanced chat mode UI
    console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║                    💬 CHAT MODE ACTIVE                       ║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
    console.log(chalk.gray('Type "exit" to quit, "help" for commands, "clear" to clear history'));
    console.log('');
    
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let chatLog = [];
    
    async function askPrompt() {
      rl.question(chalk.cyan('💭 You: '), async (userInput) => {
        if (userInput.trim().toLowerCase() === 'exit') {
          rl.close();
          // Log the chat session
          logSession({ type: 'chat_session', chatLog });
          console.log(chalk.green('╔══════════════════════════════════════════════════════════════╗'));
          console.log(chalk.green('║                      👋 CHAT ENDED                          ║'));
          console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
          return;
        }
        
        if (userInput.trim().toLowerCase() === 'help') {
          console.log(chalk.yellow('Available commands:'));
          console.log(chalk.gray('  exit - Quit chat mode'));
          console.log(chalk.gray('  help - Show this help'));
          console.log(chalk.gray('  clear - Clear chat history'));
          console.log('');
          askPrompt();
          return;
        }
        
        if (userInput.trim().toLowerCase() === 'clear') {
          console.log(chalk.yellow('Chat history cleared.'));
          console.log('');
          askPrompt();
          return;
        }
        
        if (userInput.trim() === '') {
          askPrompt();
          return;
        }
        
        // Use the same main agent prompt logic as ask command
        const mainAgentSystemPrompt = `You are a helpful AI assistant. Answer questions directly.\n\nTools:\n- /usetool=brain?\"question\" - Get detailed info from brain agent\n- /usetool=recallchatlog?\"timeframe\" - Check chat history\n- /usetool=finalans?\"answer\" - End with your answer\n\nIMPORTANT:\n- If the user's question is a simple greeting or can be answered directly, reply ONLY with /usetool=finalans?\"your answer\". Do NOT use any other tools, explanations, or extra text for simple greetings or direct questions. Do not output anything else.\n- For complex questions, use the brain agent first, then end with /usetool=finalans?\"your answer\".\n- Use \\n for line breaks.`;
        const mainAgentPrompt = `User: "${userInput}"\n\nAnswer this question directly. If simple, answer now and ONLY output /usetool=finalans?\"your answer\". If complex, use /usetool=brain?\"specific question\" first, then end with /usetool=finalans?\"your answer\".\n\nAnswer:`;
        try {
          const mainResult = await generateStreamingResponse(mainAgent, mainAgentPrompt, mainAgentSystemPrompt, 'Main Agent');
          let finalAnswer = mainResult.response;
          if (mainResult.toolCalls.length > 0) {
            const toolResults = await executeToolCalls(mainResult.toolCalls, brainAgent);
            const allFinalAnswers = toolResults.filter(result => result.tool === 'finalans');
            finalAnswer = allFinalAnswers.length > 0 ? allFinalAnswers[allFinalAnswers.length - 1].result : finalAnswer;
          }
          console.log(chalk.magenta(`🧠 Wonderland: ${finalAnswer}`));
          console.log(''); // Add spacing between messages
          chatLog.push({ prompt: userInput, response: finalAnswer });
        } catch (e) {
          console.log(chalk.red('❌ Error:', e.message));
          console.log('');
        }
        askPrompt();
      });
    }
    askPrompt();
  });

program
  .command('serve')
  .description('Run Wonderland CLI as a local API server')
  .option('--port <port>', 'Port to run the server on', '3000')
  .action((opts) => {
    const port = parseInt(opts.port, 10) || 3000;
    const mainAgent = config.get('mainAgent');
    const brainAgent = config.get('brainAgent');
    if (!mainAgent || !brainAgent) {
      console.log(chalk.red('❌ Please run setup first: wonderland setup'));
      return;
    }
    const server = http.createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/ask') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { prompt } = JSON.parse(body);
            const mainAgentSystemPrompt = `You are a helpful AI assistant. Answer questions directly.\n\nTools:\n- /usetool=brain?\"question\" - Get detailed info from brain agent\n- /usetool=recallchatlog?\"timeframe\" - Check chat history\n- /usetool=finalans?\"answer\" - End with your answer\n\nIMPORTANT:\n- If the user's question is a simple greeting or can be answered directly, reply ONLY with /usetool=finalans?\"your answer\". Do NOT use any other tools, explanations, or extra text for simple greetings or direct questions. Do not output anything else.\n- For complex questions, use the brain agent first, then end with /usetool=finalans?\"your answer\".\n- Use \\n for line breaks.`;
            const mainAgentPrompt = `User: "${prompt}"\n\nAnswer this question directly. If simple, answer now and ONLY output /usetool=finalans?\"your answer\". If complex, use /usetool=brain?\"specific question\" first, then end with /usetool=finalans?\"your answer\".\n\nAnswer:`;
            const mainResult = await generateStreamingResponse(mainAgent, mainAgentPrompt, mainAgentSystemPrompt, 'Main Agent');
            let finalAnswer = mainResult.response;
            if (mainResult.toolCalls.length > 0) {
              const toolResults = await executeToolCalls(mainResult.toolCalls, brainAgent);
              const allFinalAnswers = toolResults.filter(result => result.tool === 'finalans');
              finalAnswer = allFinalAnswers.length > 0 ? allFinalAnswers[allFinalAnswers.length - 1].result : finalAnswer;
            }
            logSession({ type: 'api_session', prompt, response: finalAnswer });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ response: finalAnswer }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });
    server.listen(port, () => {
      console.log(chalk.green(`🌐 Wonderland CLI API server running on http://localhost:${port}`));
      console.log(chalk.blue('POST /ask { "prompt": "your question" }'));
    });
  });

program
  .command('analytics')
  .description('Show usage analytics and stats from logs')
  .action(() => {
    if (!fs.existsSync(LOG_DIR)) {
      console.log(chalk.yellow('No logs found.')); return;
    }
    const logFiles = fs.readdirSync(LOG_DIR).filter(f => f.startsWith('session-') && f.endsWith('.json'));
    if (logFiles.length === 0) {
      console.log(chalk.yellow('No session logs found.')); return;
    }
    
    // Enhanced analytics UI with progress indicator
    console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║                    📊 ANALYTICS DASHBOARD                    ║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');
    
    const analyticsSpinner = ora({
      text: chalk.cyan('Analyzing log files...'),
      color: 'cyan',
      spinner: 'dots'
    }).start();
    
    let sessions = 0, questions = 0, toolCalls = 0, toolUsage = {}, agentUsage = {}, recent = [];
    
    logFiles.forEach((file, index) => {
      const logPath = path.join(LOG_DIR, file);
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const entries = logContent.split('\n---\n').filter(Boolean).map(e => { try { return JSON.parse(e); } catch { return null; } }).filter(Boolean);
      
      entries.forEach(entry => {
        if (entry.type === 'session_start' || entry.type === 'chat_session' || entry.type === 'api_session') sessions++;
        if (entry.prompt) questions++;
        if (entry.toolCalls && entry.toolCalls.length) {
          toolCalls += entry.toolCalls.length;
          entry.toolCalls.forEach(tc => {
            toolUsage[tc.tool] = (toolUsage[tc.tool] || 0) + 1;
          });
        }
        if (entry.agents) {
          Object.values(entry.agents).forEach(agent => {
            agentUsage[agent] = (agentUsage[agent] || 0) + 1;
          });
        }
        recent.push({
          time: entry.timestamp,
          prompt: entry.prompt,
          response: entry.response
        });
      });
      
      // Update progress
      analyticsSpinner.text = chalk.cyan(`Analyzing log files... (${index + 1}/${logFiles.length})`);
    });
    
    analyticsSpinner.stop();
    
    // Enhanced analytics display
    console.log(chalk.green('📊 Wonderland CLI Analytics'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Key metrics with better formatting
    console.log(chalk.blue('📈 Key Metrics:'));
    console.log(chalk.white(`   Sessions: ${chalk.green(sessions)}`));
    console.log(chalk.white(`   Questions: ${chalk.green(questions)}`));
    console.log(chalk.white(`   Tool Calls: ${chalk.green(toolCalls)}`));
    console.log('');
    
    // Tool usage with progress bars
    if (Object.keys(toolUsage).length > 0) {
      console.log(chalk.blue('🔧 Tool Usage:'));
      const maxToolUsage = Math.max(...Object.values(toolUsage));
      Object.entries(toolUsage).sort((a,b) => b[1]-a[1]).forEach(([tool, count]) => {
        const percentage = Math.round((count / maxToolUsage) * 20);
        const bar = '█'.repeat(percentage) + '░'.repeat(20 - percentage);
        console.log(chalk.white(`   ${tool.padEnd(15)} ${chalk.cyan(bar)} ${chalk.green(count)}`));
      });
      console.log('');
    }
    
    // Agent usage
    if (Object.keys(agentUsage).length > 0) {
      console.log(chalk.blue('🤖 Agent Usage:'));
      Object.entries(agentUsage).sort((a,b) => b[1]-a[1]).forEach(([agent, count]) => {
        console.log(chalk.white(`   ${agent}: ${chalk.green(count)}`));
      });
      console.log('');
    }
    
    // Recent activity with better formatting
    console.log(chalk.blue('🕒 Recent Activity:'));
    recent.slice(-5).forEach((r, index) => {
      const time = new Date(r.time).toLocaleString();
      console.log(chalk.gray(`   ${index + 1}. [${time}]`));
      if (r.prompt) console.log(chalk.white(`      Q: ${r.prompt}`));
      if (r.response) console.log(chalk.cyan(`      A: ${r.response.substring(0, 100)}${r.response.length > 100 ? '...' : ''}`));
      console.log('');
    });
  });

program
  .command('-danger -settings -reset')
  .description('Danger: Factory reset all Wonderland CLI settings, logs, and plugins')
  .action(() => {
    config.clear();
    chatHistory = [];
    // Remove logs
    if (fs.existsSync(LOG_DIR)) {
      fs.rmSync(LOG_DIR, { recursive: true, force: true });
    }
    // Remove plugins
    if (fs.existsSync(PLUGIN_DIR)) {
      fs.rmSync(PLUGIN_DIR, { recursive: true, force: true });
    }
    console.log(chalk.red('⚠️  All Wonderland CLI settings, logs, and plugins have been reset!'));
    console.log(chalk.red('You must run wonderland setup again.'));
  }); 