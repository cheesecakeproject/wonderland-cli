#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import ora from 'ora';
import Conf from 'conf';
import fs from 'fs';
import path from 'path';

const config = new Conf({ projectName: 'wonderland-cli' });
const program = new Command();

// Ollama API base URL - can be configured via environment variable
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Set up the CLI
program
  .name('wonderland')
  .description('Wonderland CLI 1.0 Beta - An AI system to power up your Ollama bot with brains')
  .version('1.0.0-beta');

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
  
  try {
    console.log(chalk.blue(`\n🧠 ${agentName} is thinking...\n`));
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: model,
      prompt: prompt,
      system: systemPrompt,
      stream: true
    }, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            if (data.response) {
              process.stdout.write(chalk.cyan(data.response));
              fullResponse += data.response;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      });

      response.data.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(chalk.green(`\n✅ ${agentName} completed (${duration}ms)\n`));
        
        // Extract tool calls from response
        toolCalls = extractToolCalls(fullResponse);
        
        logAgentStep(agentName, prompt, fullResponse, duration, toolCalls);
        resolve({ response: fullResponse, toolCalls });
      });

      response.data.on('error', (error) => {
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
    console.log(chalk.yellow(`\n🔧 Executing tool: ${toolCall.tool} with query: ${toolCall.query}`));
    
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
    
    console.log(chalk.blue('🧠 Multi-Brain Agent Workflow'));
    console.log(chalk.gray('Prompt:'), finalPrompt);
    console.log(chalk.gray('Session Log:'), LOG_FILE);
    console.log('');
    
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
        console.log(chalk.yellow(`\n🔧 Main Agent requested ${mainResult.toolCalls.length} tool calls`));
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
          
          console.log(chalk.green('\n🎯 Final Answer:')); 
          console.log(finalAnswer.result);
          console.log(chalk.green('\n🎯 Session Complete!'));
          
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

// Parse command line arguments
program.parse(); 