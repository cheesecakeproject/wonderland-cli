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
import { execSync, spawn } from 'child_process';
import readline from 'readline';
import http from 'http';
import logUpdate from 'log-update';
import cliSpinners from 'cli-spinners';

const config = new Conf({ projectName: 'wonderland-cli' });
const program = new Command();

// Ollama API base URL - can be configured via environment variable
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Set up the CLI
program
  .name('wonderland')
  .description('Wonderland CLI 1.3.0 - An AI system to power up your Ollama bot with brains')
  .version('1.3.0')
  .option('-setup4u', 'Run the setup.sh script automatically for you');

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
      
    } else if (toolCall.tool === 'askuser') {
      // Content Awareness & User Query Tool
      const question = toolCall.query;
      
      console.log(chalk.yellow('\n🤔 Agent needs clarification:'));
      console.log(chalk.white(`   ${question}`));
      console.log('');
      
      // Get user input
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const userResponse = await new Promise((resolve) => {
        rl.question(chalk.cyan('💭 Your response: '), (answer) => {
          rl.close();
          resolve(answer);
        });
      });
      
      results.push({
        tool: 'askuser',
        query: question,
        result: userResponse || 'No response provided.'
      });
      
      console.log(chalk.gray(`📝 User provided: ${userResponse}`));
      
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

// === Multi-Brain Parallel Research ===
// Utility to launch multiple brain agents in parallel for different research tasks
async function executeParallelBrainResearch(toolCalls, brainAgents) {
  // toolCalls: [{ tool, query }...], brainAgents: [modelName1, modelName2, ...]
  const results = [];
  
  // Check resource availability before starting
  if (!resourceMonitor.canStartNewAgent()) {
    const status = resourceMonitor.getResourceStatus();
    console.log(chalk.yellow('⚠️  Resource constraints detected:'));
    status.recommendations.forEach(rec => {
      console.log(chalk.gray(`   • ${rec}`));
    });
    console.log(chalk.blue('🔄 Throttling agent operations...'));
  }
  
  // Start background monitoring for automatic interruption and resource management
  const monitorInterval = setInterval(() => {
    // Resource-based interruption
    if (resourceMonitor.shouldThrottle()) {
      const activeAgents = Object.keys(agentStatusBus.activeTasks);
      if (activeAgents.length > 0) {
        // Interrupt the oldest agent to free resources
        const oldestAgent = activeAgents[0];
        const interruptedTask = agentStatusBus.interruptAgent(oldestAgent);
        if (interruptedTask) {
          console.log(chalk.yellow(`\n⏸️ Resource-based interruption: ${oldestAgent} (memory/CPU constraints)`));
        }
      }
    }
    
    // Time-based interruption
    const interrupted = agentStatusBus.autoInterruptAgents({ maxTime: 300000 }); // 5 minutes
    if (interrupted.length > 0) {
      console.log(chalk.yellow(`\n⏸️ Auto-interrupted ${interrupted.length} agents due to time limit:`));
      interrupted.forEach(item => {
        console.log(chalk.gray(`  • ${item.agent}: "${item.task}" (${item.reason})`));
      });
      
      // Auto-reassign interrupted tasks
      const reassignments = agentStatusBus.autoReassignTasks();
      if (reassignments.length > 0) {
        console.log(chalk.green(`🔄 Auto-reassigned ${reassignments.length} tasks:`));
        reassignments.forEach(r => {
          console.log(chalk.gray(`  • "${r.task}" from ${r.from} to ${r.to}`));
        });
      }
    }
  }, 30000); // Check every 30 seconds
  
  const promises = toolCalls.map((toolCall, idx) => {
    const agentName = `Brain${idx + 1}`;
    const brainModel = brainAgents[idx % brainAgents.length]; // round-robin assignment
    
    // Track active task for interruption capability
    const taskWithTimestamp = { ...toolCall, timestamp: Date.now() };
    agentStatusBus.setActiveTask(agentName, taskWithTimestamp);
    agentStatusBus.setAgentStatus(agentName, `Researching: ${toolCall.query}`);
    
    const brainPrompt = `You are a specialist. Research: "${toolCall.query}". Provide detailed, accurate, and helpful information. Use \\n for line breaks.`;
    return generateStreamingResponse(brainModel, brainPrompt, '', agentName)
      .then(res => {
        agentStatusBus.setAgentStatus(agentName, 'Done');
        delete agentStatusBus.activeTasks[agentName]; // Clear active task
        return {
          tool: 'brain',
          query: toolCall.query,
          result: res.response,
          agent: agentName
        };
      })
      .catch(e => {
        agentStatusBus.setAgentStatus(agentName, 'Error');
        delete agentStatusBus.activeTasks[agentName]; // Clear active task
        return {
          tool: 'brain',
          query: toolCall.query,
          result: `Error: ${e.message}`,
          agent: agentName
        };
      });
  });
  
  try {
    const allResults = await Promise.all(promises);
    clearInterval(monitorInterval); // Stop monitoring
    return allResults;
  } catch (error) {
    clearInterval(monitorInterval); // Stop monitoring on error
    throw error;
  }
}

// === Manual Brain Assignment for Parallel Research ===
// Parse CLI arguments for manual assignment: 'Brain1: research X'
function parseManualAssignments(args) {
  // Returns [{ agent: 'Brain1', query: 'research X' }, ...]
  return args.map(arg => {
    const match = arg.match(/^(Brain\d+):\s*(.+)$/i);
    if (match) {
      return { agent: match[1], query: match[2] };
    }
    return null;
  }).filter(Boolean);
}

// === Dynamic Brain Assignment ===
// Store dynamic brain agents in config
function getDynamicBrains() {
  return config.get('dynamicBrains') || [];
}
function setDynamicBrains(brains) {
  config.set('dynamicBrains', brains);
}
// === Brain Specialization ===
const SPECIALTY_CHOICES = [
  'General',
  'Web Search',
  'Math',
  'Code',
  'Writing',
  'Data Analysis',
  'Custom...'
];
function promptForSpecialty(defaultSpecialty = 'General') {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'specialty',
      message: 'Select a specialty for this brain agent:',
      choices: SPECIALTY_CHOICES,
      default: defaultSpecialty
    },
    {
      type: 'input',
      name: 'customSpecialty',
      message: 'Enter custom specialty:',
      when: (answers) => answers.specialty === 'Custom...'
    }
  ]).then(answers => answers.specialty === 'Custom...' ? answers.customSpecialty : answers.specialty);
}
// CLI command to add a brain agent (with specialty)
program
  .command('brain add')
  .description('Add a new brain agent dynamically')
  .action(async () => {
    const models = await getAvailableModels();
    const modelChoices = models.map(model => ({ name: `${model.name} (${model.size})`, value: model.name }));
    const { agentName, modelName } = await inquirer.prompt([
      { type: 'input', name: 'agentName', message: 'Enter a name for the new brain agent:', default: `Brain${getDynamicBrains().length + 1}` },
      { type: 'list', name: 'modelName', message: 'Select a model for this brain agent:', choices: modelChoices }
    ]);
    const specialty = await promptForSpecialty();
    const brains = getDynamicBrains();
    brains.push({ agent: agentName, model: modelName, specialty });
    setDynamicBrains(brains);
    console.log(chalk.green(`✅ Added brain agent: ${agentName} (${modelName}) [${specialty}]`));
  });
// CLI command to edit a brain agent's specialty
program
  .command('brain edit')
  .description('Edit a brain agent specialty')
  .action(async () => {
    const brains = getDynamicBrains();
    if (brains.length === 0) {
      console.log(chalk.yellow('No dynamic brain agents to edit.'));
      return;
    }
    const { agentName } = await inquirer.prompt([
      { type: 'list', name: 'agentName', message: 'Select a brain agent to edit:', choices: brains.map(b => b.agent) }
    ]);
    const specialty = await promptForSpecialty(brains.find(b => b.agent === agentName).specialty);
    const updated = brains.map(b => b.agent === agentName ? { ...b, specialty } : b);
    setDynamicBrains(updated);
    console.log(chalk.green(`✏️ Updated specialty for ${agentName}: ${specialty}`));
  });
// CLI command to remove a brain agent
program
  .command('brain remove')
  .description('Remove a brain agent dynamically')
  .action(async () => {
    const brains = getDynamicBrains();
    if (brains.length === 0) {
      console.log(chalk.yellow('No dynamic brain agents to remove.'));
      return;
    }
    const { agentName } = await inquirer.prompt([
      { type: 'list', name: 'agentName', message: 'Select a brain agent to remove:', choices: brains.map(b => b.agent) }
    ]);
    const updated = brains.filter(b => b.agent !== agentName);
    setDynamicBrains(updated);
    console.log(chalk.green(`🗑️ Retired brain agent: ${agentName}`));
  });

// === Interrupt and Reassign Commands ===
program
  .command('interrupt')
  .description('Interrupt a brain agent and reassign their task')
  .option('-a, --auto', 'Automatically reassign based on specialty matching')
  .option('-m, --manual', 'Manually select new agent for reassignment')
  .action(async (options) => {
    const statuses = agentStatusBus.getAllAgentStatuses();
    const activeAgents = Object.entries(statuses)
      .filter(([agent, status]) => status.includes('Researching'))
      .map(([agent]) => agent);
    
    if (activeAgents.length === 0) {
      console.log(chalk.yellow('No active brain agents to interrupt.'));
      return;
    }
    
    const { agentToInterrupt } = await inquirer.prompt([
      {
        type: 'list',
        name: 'agentToInterrupt',
        message: 'Select a brain agent to interrupt:',
        choices: activeAgents.map(agent => ({
          name: `${agent} - ${statuses[agent]}`,
          value: agent
        }))
      }
    ]);
    
    const interruptedTask = agentStatusBus.interruptAgent(agentToInterrupt);
    if (!interruptedTask) {
      console.log(chalk.red('Failed to interrupt agent.'));
      return;
    }
    
    console.log(chalk.yellow(`⏸️ Interrupted ${agentToInterrupt} working on: "${interruptedTask.query}"`));
    
    if (options.auto) {
      // Auto-reassign
      const reassignments = agentStatusBus.autoReassignTasks();
      if (reassignments.length > 0) {
        reassignments.forEach(r => {
          console.log(chalk.green(`🔄 Auto-reassigned: "${r.task}" from ${r.from} to ${r.to}`));
        });
      } else {
        console.log(chalk.yellow('No suitable idle agents found for auto-reassignment.'));
      }
    } else if (options.manual) {
      // Manual reassignment
      const dynamicBrains = getDynamicBrains();
      const idleAgents = dynamicBrains
        .filter(brain => statuses[brain.agent] === 'Idle')
        .map(brain => brain.agent);
      
      if (idleAgents.length === 0) {
        console.log(chalk.yellow('No idle agents available for reassignment.'));
        return;
      }
      
      const { newAgent } = await inquirer.prompt([
        {
          type: 'list',
          name: 'newAgent',
          message: 'Select new agent for reassignment:',
          choices: idleAgents
        }
      ]);
      
      const reassignedTask = agentStatusBus.reassignTask(0, newAgent);
      if (reassignedTask) {
        console.log(chalk.green(`🔄 Manually reassigned: "${reassignedTask.task.query}" to ${newAgent}`));
      }
    } else {
      // Show interrupted tasks
      const interruptedTasks = agentStatusBus.getInterruptedTasks();
      console.log(chalk.cyan(`\n📋 Interrupted tasks (${interruptedTasks.length}):`));
      interruptedTasks.forEach((task, index) => {
        console.log(chalk.gray(`  ${index + 1}. "${task.task.query}" (was ${task.originalAgent})`));
      });
    }
  });

program
  .command('reassign')
  .description('Reassign an interrupted task to a new agent')
  .action(async () => {
    const interruptedTasks = agentStatusBus.getInterruptedTasks();
    if (interruptedTasks.length === 0) {
      console.log(chalk.yellow('No interrupted tasks to reassign.'));
      return;
    }
    
    const { taskIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'taskIndex',
        message: 'Select a task to reassign:',
        choices: interruptedTasks.map((task, index) => ({
          name: `"${task.task.query}" (was ${task.originalAgent})`,
          value: index
        }))
      }
    ]);
    
    const dynamicBrains = getDynamicBrains();
    const statuses = agentStatusBus.getAllAgentStatuses();
    const availableAgents = dynamicBrains
      .filter(brain => statuses[brain.agent] === 'Idle')
      .map(brain => brain.agent);
    
    if (availableAgents.length === 0) {
      console.log(chalk.yellow('No idle agents available for reassignment.'));
      return;
    }
    
    const { newAgent } = await inquirer.prompt([
      {
        type: 'list',
        name: 'newAgent',
        message: 'Select new agent for reassignment:',
        choices: availableAgents
      }
    ]);
    
    const reassignedTask = agentStatusBus.reassignTask(taskIndex, newAgent);
    if (reassignedTask) {
      console.log(chalk.green(`🔄 Reassigned: "${reassignedTask.task.query}" to ${newAgent}`));
    }
  });

program
  .command('auto-reassign')
  .description('Automatically reassign all interrupted tasks based on specialty matching')
  .action(async () => {
    const reassignments = agentStatusBus.autoReassignTasks();
    if (reassignments.length > 0) {
      console.log(chalk.green(`🔄 Auto-reassigned ${reassignments.length} tasks:`));
      reassignments.forEach(r => {
        console.log(chalk.gray(`  • "${r.task}" from ${r.from} to ${r.to}`));
      });
    } else {
      console.log(chalk.yellow('No tasks were auto-reassigned.'));
    }
  });

program
  .command('auto-interrupt')
  .description('Automatically interrupt agents based on time limits or performance')
  .option('-t, --time <seconds>', 'Maximum time limit in seconds', '300')
  .action(async (options) => {
    const maxTime = parseInt(options.time) * 1000; // Convert to milliseconds
    const interrupted = agentStatusBus.autoInterruptAgents({ maxTime });
    
    if (interrupted.length > 0) {
      console.log(chalk.yellow(`⏸️ Auto-interrupted ${interrupted.length} agents:`));
      interrupted.forEach(item => {
        console.log(chalk.gray(`  • ${item.agent}: "${item.task}" (${item.reason})`));
      });
      
      // Auto-reassign interrupted tasks
      const reassignments = agentStatusBus.autoReassignTasks();
      if (reassignments.length > 0) {
        console.log(chalk.green(`🔄 Auto-reassigned ${reassignments.length} tasks:`));
        reassignments.forEach(r => {
          console.log(chalk.gray(`  • "${r.task}" from ${r.from} to ${r.to}`));
        });
      }
    } else {
      console.log(chalk.blue('No agents met the interruption criteria.'));
    }
  });

// === Real-Time Brain-to-Brain Visibility (Agent Status Bus) ===
const agentStatusBus = {
  statuses: {},
  listeners: [],
  activeTasks: {}, // Track active tasks for interruption
  interruptionQueue: [], // Queue for interrupted tasks
  setAgentStatus(agent, status) {
    this.statuses[agent] = status;
    this.listeners.forEach(fn => fn(this.statuses));
  },
  getAllAgentStatuses() {
    return { ...this.statuses };
  },
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },
  // Track active task for an agent
  setActiveTask(agent, task) {
    this.activeTasks[agent] = task;
  },
  getActiveTask(agent) {
    return this.activeTasks[agent];
  },
  // Interrupt an agent's current task
  interruptAgent(agent) {
    const task = this.activeTasks[agent];
    if (task) {
      this.interruptionQueue.push({
        originalAgent: agent,
        task: task,
        timestamp: Date.now()
      });
      this.setAgentStatus(agent, 'Interrupted');
      delete this.activeTasks[agent];
      return task;
    }
    return null;
  },
  // Reassign interrupted task to new agent
  reassignTask(taskIndex, newAgent) {
    if (taskIndex >= 0 && taskIndex < this.interruptionQueue.length) {
      const task = this.interruptionQueue[taskIndex];
      this.setActiveTask(newAgent, task.task);
      this.setAgentStatus(newAgent, `Reassigned: ${task.task.query}`);
      this.interruptionQueue.splice(taskIndex, 1);
      return task;
    }
    return null;
  },
  // Get all interrupted tasks
  getInterruptedTasks() {
    return [...this.interruptionQueue];
  },
  // Auto-reassign based on specialty matching
  autoReassignTasks() {
    const dynamicBrains = getDynamicBrains();
    const reassignments = [];
    
    this.interruptionQueue.forEach((task, index) => {
      // Find best matching brain based on specialty
      const bestMatch = dynamicBrains.find(brain => 
        brain.specialty.toLowerCase().includes(task.task.query.toLowerCase()) ||
        task.task.query.toLowerCase().includes(brain.specialty.toLowerCase())
      ) || dynamicBrains.find(brain => 
        brain.specialty === 'General'
      );
      
      if (bestMatch && this.statuses[bestMatch.agent] === 'Idle') {
        this.reassignTask(index, bestMatch.agent);
        reassignments.push({
          task: task.task.query,
          from: task.originalAgent,
          to: bestMatch.agent
        });
      }
    });
    
    return reassignments;
  },
  
  // Automatic interruption based on conditions
  autoInterruptAgents(conditions = {}) {
    const { maxTime = 300000, performanceThreshold = 0.5 } = conditions; // 5 minutes default
    const interrupted = [];
    
    Object.entries(this.activeTasks).forEach(([agent, task]) => {
      const taskAge = Date.now() - (task.timestamp || Date.now());
      const shouldInterrupt = taskAge > maxTime;
      
      if (shouldInterrupt) {
        const interruptedTask = this.interruptAgent(agent);
        if (interruptedTask) {
          interrupted.push({
            agent,
            task: interruptedTask.query,
            reason: `Time limit exceeded (${Math.round(taskAge / 1000)}s)`
          });
        }
      }
    });
    
    return interrupted;
  }
};

// === Live Brain Status Dashboard ===
import logUpdate from 'log-update';
import cliSpinners from 'cli-spinners';

function getBrainStats(statuses, dynamicBrains) {
  let total = dynamicBrains.length;
  let active = 0, idle = 0, done = 0, error = 0, retired = 0;
  Object.entries(statuses).forEach(([agent, status]) => {
    if (status === 'Idle') idle++;
    else if (status === 'Done') done++;
    else if (status === 'Error') error++;
    else if (status === 'Retired') retired++;
    else active++;
  });
  return { total, active, idle, done, error, retired };
}

function renderDashboard(statuses, dynamicBrains, spinnerFrame) {
  let out = '';
  out += chalk.bold.bgBlue.white('=== Wonderland Brain Dashboard ===') + '\n';
  const stats = getBrainStats(statuses, dynamicBrains);
  out += chalk.gray(`Brains: ${stats.total} | Active: ${stats.active} | Idle: ${stats.idle} | Done: ${stats.done} | Error: ${stats.error} | Retired: ${stats.retired}`) + '\n';
  out += chalk.gray('───────────────────────────────────────────────────────────────') + '\n';
  dynamicBrains.forEach(b => {
    const status = statuses[b.agent] || 'Idle';
    let icon = '';
    if (status === 'Idle') icon = chalk.gray('●');
    else if (status === 'Done') icon = chalk.green('✔');
    else if (status === 'Error') icon = chalk.red('✖');
    else if (status === 'Retired') icon = chalk.gray.strikethrough('🗑️');
    else if (status === 'Interrupted') icon = chalk.yellow('⏸️');
    else if (status.includes('Reassigned')) icon = chalk.magenta('🔄');
    else icon = chalk.cyan(spinnerFrame);
    out += `${icon} ${chalk.bold(b.agent)} ${chalk.yellow('[' + b.specialty + ']')} : ${status}\n`;
  });
  
  // Show interrupted tasks if any
  const interruptedTasks = agentStatusBus.getInterruptedTasks();
  if (interruptedTasks.length > 0) {
    out += chalk.gray('───────────────────────────────────────────────────────────────') + '\n';
    out += chalk.yellow.bold('⏸️ Interrupted Tasks:') + '\n';
    interruptedTasks.forEach((task, index) => {
      out += chalk.gray(`  ${index + 1}. "${task.task.query}" (was ${task.originalAgent})`) + '\n';
    });
  }
  
  out += chalk.gray('───────────────────────────────────────────────────────────────') + '\n';
  out += chalk.blue('Press [a] to add, [e] to edit, [r] to retire, [i] to interrupt, [q] to quit dashboard.') + '\n';
  return out;
}

program
  .command('dashboard')
  .description('Show live brain status dashboard')
  .action(() => {
    const spinner = cliSpinners.dots;
    let frameIdx = 0;
    const dynamicBrains = getDynamicBrains();
    const statuses = agentStatusBus.getAllAgentStatuses();
    const interval = setInterval(() => {
      const currentStatuses = agentStatusBus.getAllAgentStatuses();
      logUpdate(renderDashboard(currentStatuses, getDynamicBrains(), spinner.frames[frameIdx % spinner.frames.length]));
      frameIdx++;
    }, spinner.interval);
    // Listen for keypresses for dashboard menu
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', async (key) => {
        if (key.toString() === 'a') {
          // Add brain interactively
          const models = await getAvailableModels();
          const modelChoices = models.map(model => ({ name: `${model.name} (${model.size})`, value: model.name }));
          const { agentName, modelName } = await inquirer.prompt([
            { type: 'input', name: 'agentName', message: 'Enter a name for the new brain agent:', default: `Brain${getDynamicBrains().length + 1}` },
            { type: 'list', name: 'modelName', message: 'Select a model for this brain agent:', choices: modelChoices }
          ]);
          const specialty = await promptForSpecialty();
          const brains = getDynamicBrains();
          brains.push({ agent: agentName, model: modelName, specialty });
          setDynamicBrains(brains);
          agentStatusBus.setAgentStatus(agentName, 'Idle');
        } else if (key.toString() === 'e') {
          // Edit specialty interactively
          const brains = getDynamicBrains();
          if (brains.length === 0) return;
          const { agentName } = await inquirer.prompt([
            { type: 'list', name: 'agentName', message: 'Select a brain agent to edit:', choices: brains.map(b => b.agent) }
          ]);
          const specialty = await promptForSpecialty(brains.find(b => b.agent === agentName).specialty);
          setDynamicBrains(brains.map(b => b.agent === agentName ? { ...b, specialty } : b));
        } else if (key.toString() === 'r') {
          // Retire brain interactively
          const brains = getDynamicBrains();
          if (brains.length === 0) return;
          const { agentName } = await inquirer.prompt([
            { type: 'list', name: 'agentName', message: 'Select a brain agent to retire:', choices: brains.map(b => b.agent) }
          ]);
          setDynamicBrains(brains.filter(b => b.agent !== agentName));
          agentStatusBus.setAgentStatus(agentName, 'Retired');
        } else if (key.toString() === 'i') {
          // Interrupt brain interactively
          const currentStatuses = agentStatusBus.getAllAgentStatuses();
          const activeAgents = Object.entries(currentStatuses)
            .filter(([agent, status]) => status.includes('Researching'))
            .map(([agent]) => agent);
          
          if (activeAgents.length === 0) {
            console.log(chalk.yellow('No active brain agents to interrupt.'));
            return;
          }
          
          const { agentToInterrupt } = await inquirer.prompt([
            {
              type: 'list',
              name: 'agentToInterrupt',
              message: 'Select a brain agent to interrupt:',
              choices: activeAgents.map(agent => ({
                name: `${agent} - ${currentStatuses[agent]}`,
                value: agent
              }))
            }
          ]);
          
          const interruptedTask = agentStatusBus.interruptAgent(agentToInterrupt);
          if (interruptedTask) {
            console.log(chalk.yellow(`⏸️ Interrupted ${agentToInterrupt} working on: "${interruptedTask.query}"`));
            
            // Offer auto-reassignment
            const { shouldAutoReassign } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'shouldAutoReassign',
                message: 'Auto-reassign based on specialty matching?',
                default: true
              }
            ]);
            
            if (shouldAutoReassign) {
              const reassignments = agentStatusBus.autoReassignTasks();
              if (reassignments.length > 0) {
                reassignments.forEach(r => {
                  console.log(chalk.green(`🔄 Auto-reassigned: "${r.task}" from ${r.from} to ${r.to}`));
                });
              } else {
                console.log(chalk.yellow('No suitable idle agents found for auto-reassignment.'));
              }
            }
          }
        } else if (key.toString() === 'q') {
          clearInterval(interval);
          logUpdate.clear();
          process.stdin.setRawMode(false);
          process.stdin.pause();
        }
      });
    }
  });
// Enhance startAgentStatusDisplay to show summary stats and icons
function startAgentStatusDisplay() {
  const spinner = cliSpinners.dots;
  let frameIdx = 0;
  const interval = setInterval(() => {
    process.stdout.write('\x1Bc'); // Clear screen
    const statuses = agentStatusBus.getAllAgentStatuses();
    const dynamicBrains = getDynamicBrains();
    const stats = getBrainStats(statuses, dynamicBrains);
    console.log(chalk.bold.bgBlue.white('=== Agent Real-Time Status ==='));
    console.log(chalk.gray(`Brains: ${stats.total} | Active: ${stats.active} | Idle: ${stats.idle} | Done: ${stats.done} | Error: ${stats.error} | Retired: ${stats.retired}`));
    console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
    Object.entries(statuses).forEach(([agent, status]) => {
      let label = agent;
      let specialty = '';
      const brain = dynamicBrains.find(b => b.agent === agent);
      if (brain) {
        label = chalk.bold.green(`🆕 ${agent}`);
        specialty = chalk.yellow(`[${brain.specialty}]`);
      } else if (status === 'Retired') {
        label = chalk.gray.strikethrough(`🗑️ ${agent}`);
      } else if (agent === 'Main Agent') {
        label = chalk.bold.cyan(agent);
      }
      let statusText = status;
      let icon = '';
      if (status === 'Idle') { statusText = chalk.gray(status); icon = chalk.gray('●'); }
      if (status === 'Done') { statusText = chalk.green(status); icon = chalk.green('✔'); }
      if (status === 'Error') { statusText = chalk.red(status); icon = chalk.red('✖'); }
      if (status === 'Retired') { statusText = chalk.gray.strikethrough(status); icon = chalk.gray.strikethrough('🗑️'); }
      if (status === 'Interrupted') { statusText = chalk.yellow(status); icon = chalk.yellow('⏸️'); }
      if (status.includes('Reassigned')) { statusText = chalk.magenta(status); icon = chalk.magenta('🔄'); }
      if (!icon) icon = chalk.cyan(spinner.frames[frameIdx % spinner.frames.length]);
      console.log(`${icon} ${label} ${specialty}: ${statusText}`);
    });
    // Show dynamic brains not yet assigned a status
    dynamicBrains.forEach(b => {
      if (!statuses[b.agent]) {
        console.log(chalk.bold.green(`🆕 ${b.agent} ${chalk.yellow('[' + b.specialty + ']')}: (Ready)`));
      }
    });
    
    // Show interrupted tasks if any
    const interruptedTasks = agentStatusBus.getInterruptedTasks();
    if (interruptedTasks.length > 0) {
      console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
      console.log(chalk.yellow.bold('⏸️ Interrupted Tasks:'));
      interruptedTasks.forEach((task, index) => {
        console.log(chalk.gray(`  ${index + 1}. "${task.task.query}" (was ${task.originalAgent})`));
      });
    }
    
    console.log(chalk.gray('───────────────────────────────────────────────────────────────'));
    console.log(chalk.blue('Press [a] to add, [e] to edit, [r] to retire, [i] to interrupt, [q] to quit status view.'));
    frameIdx++;
  }, spinner.interval);
  // Listen for keypresses for session menu
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
      if (key.toString() === 'a') {
        // Add brain interactively
        const models = await getAvailableModels();
        const modelChoices = models.map(model => ({ name: `${model.name} (${model.size})`, value: model.name }));
        const { agentName, modelName } = await inquirer.prompt([
          { type: 'input', name: 'agentName', message: 'Enter a name for the new brain agent:', default: `Brain${getDynamicBrains().length + 1}` },
          { type: 'list', name: 'modelName', message: 'Select a model for this brain agent:', choices: modelChoices }
        ]);
        const specialty = await promptForSpecialty();
        const brains = getDynamicBrains();
        brains.push({ agent: agentName, model: modelName, specialty });
        setDynamicBrains(brains);
        agentStatusBus.setAgentStatus(agentName, 'Idle');
      } else if (key.toString() === 'e') {
        // Edit specialty interactively
        const brains = getDynamicBrains();
        if (brains.length === 0) return;
        const { agentName } = await inquirer.prompt([
          { type: 'list', name: 'agentName', message: 'Select a brain agent to edit:', choices: brains.map(b => b.agent) }
        ]);
        const specialty = await promptForSpecialty(brains.find(b => b.agent === agentName).specialty);
        setDynamicBrains(brains.map(b => b.agent === agentName ? { ...b, specialty } : b));
      } else if (key.toString() === 'r') {
        // Retire brain interactively
        const brains = getDynamicBrains();
        if (brains.length === 0) return;
        const { agentName } = await inquirer.prompt([
          { type: 'list', name: 'agentName', message: 'Select a brain agent to retire:', choices: brains.map(b => b.agent) }
        ]);
        setDynamicBrains(brains.filter(b => b.agent !== agentName));
        agentStatusBus.setAgentStatus(agentName, 'Retired');
      } else if (key.toString() === 'i') {
        // Interrupt brain interactively
        const currentStatuses = agentStatusBus.getAllAgentStatuses();
        const activeAgents = Object.entries(currentStatuses)
          .filter(([agent, status]) => status.includes('Researching'))
          .map(([agent]) => agent);
        
        if (activeAgents.length === 0) {
          console.log(chalk.yellow('No active brain agents to interrupt.'));
          return;
        }
        
        const { agentToInterrupt } = await inquirer.prompt([
          {
            type: 'list',
            name: 'agentToInterrupt',
            message: 'Select a brain agent to interrupt:',
            choices: activeAgents.map(agent => ({
              name: `${agent} - ${currentStatuses[agent]}`,
              value: agent
            }))
          }
        ]);
        
        const interruptedTask = agentStatusBus.interruptAgent(agentToInterrupt);
        if (interruptedTask) {
          console.log(chalk.yellow(`⏸️ Interrupted ${agentToInterrupt} working on: "${interruptedTask.query}"`));
          
          // Offer auto-reassignment
          const { shouldAutoReassign } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'shouldAutoReassign',
              message: 'Auto-reassign based on specialty matching?',
              default: true
            }
          ]);
          
          if (shouldAutoReassign) {
            const reassignments = agentStatusBus.autoReassignTasks();
            if (reassignments.length > 0) {
              reassignments.forEach(r => {
                console.log(chalk.green(`🔄 Auto-reassigned: "${r.task}" from ${r.from} to ${r.to}`));
              });
            } else {
              console.log(chalk.yellow('No suitable idle agents found for auto-reassignment.'));
            }
          }
        }
      } else if (key.toString() === 'q') {
        clearInterval(interval);
        process.stdin.setRawMode(false);
        process.stdin.pause();
      }
    });
  }
  return () => {
    clearInterval(interval);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  };
}

// Example usage: (integrate into agent logic as needed)
// agentStatusBus.setAgentStatus('Main', 'Thinking about your question...');
// agentStatusBus.setAgentStatus('Brain1', 'Researching topic A...');
// agentStatusBus.setAgentStatus('Brain2', 'Researching topic B...');
// const stopDisplay = startAgentStatusDisplay();
// ... when done: stopDisplay();

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
  .argument('<prompt...>', 'your question(s) or prompt(s)')
  .option('-v, --verbose', 'show detailed workflow')
  .option('-n, --no-log', 'disable logging')
  .option('-i, --incommandprompt <prompt>', 'test with a specific prompt')
  .option('--multi-brain', 'Enable multi-brain parallel research')
  .option('--manual-assign', 'Manually assign sub-tasks to brain agents')
  .action(async (prompts, options) => {
    const mainAgent = config.get('mainAgent');
    const brainAgent = config.get('brainAgent');
    let brainAgents = [brainAgent];
    let manualAssignments = [];
    // If manual assignment via CLI args (e.g. Brain1: research X)
    if (options.manualAssign) {
      manualAssignments = parseManualAssignments(prompts);
    }
    // If multi-brain, prompt for number and models (unless manual assignments provided)
    if (options.multiBrain && manualAssignments.length === 0) {
      const models = await getAvailableModels();
      const modelChoices = models.map(model => ({ name: `${model.name} (${model.size})`, value: model.name }));
      const { numBrains, selectedBrains } = await inquirer.prompt([
        { type: 'number', name: 'numBrains', message: 'How many brain agents?', default: 2, validate: n => n > 0 && n <= 5 },
        { type: 'checkbox', name: 'selectedBrains', message: 'Select brain agent models:', choices: modelChoices, validate: arr => arr.length > 0 }
      ]);
      brainAgents = Array(numBrains).fill().map((_, i) => selectedBrains[i % selectedBrains.length]);
    }
    // If manual-assign flag and no CLI assignments, prompt user to assign each sub-task
    if (options.manualAssign && manualAssignments.length === 0) {
      // Prompt for sub-tasks (split prompt or ask user)
      let subTasks = [];
      if (prompts.length === 1) {
        // Try to split by sentences or ask user to input sub-tasks
        const { splitType } = await inquirer.prompt([
          { type: 'list', name: 'splitType', message: 'How do you want to split your prompt?', choices: ['By sentence', 'Manually enter sub-tasks'] }
        ]);
        if (splitType === 'By sentence') {
          subTasks = prompts[0].split(/(?<=[.!?])\s+/).filter(Boolean);
        } else {
          const { manualTasks } = await inquirer.prompt([
            { type: 'input', name: 'manualTasks', message: 'Enter sub-tasks separated by | (pipe):' }
          ]);
          subTasks = manualTasks.split('|').map(s => s.trim()).filter(Boolean);
        }
      } else {
        subTasks = prompts;
      }
      // Prompt for agent assignment for each sub-task
      const models = await getAvailableModels();
      const modelChoices = models.map(model => ({ name: `${model.name} (${model.size})`, value: model.name }));
      const assignments = [];
      for (let i = 0; i < subTasks.length; i++) {
        const { agentName, modelName } = await inquirer.prompt([
          { type: 'input', name: 'agentName', message: `Assign agent name for sub-task ${i + 1} (e.g. Brain1):`, default: `Brain${i + 1}` },
          { type: 'list', name: 'modelName', message: `Select model for ${subTasks[i]}`, choices: modelChoices }
        ]);
        assignments.push({ agent: agentName, query: subTasks[i], model: modelName });
      }
      manualAssignments = assignments;
      brainAgents = assignments.map(a => a.model);
    }
    
    if (!mainAgent || !brainAgent) {
      console.log(chalk.red('❌ Please run setup first: wonderland setup'));
      return;
    }
    
    // Start real-time agent status display
    const stopDisplay = startAgentStatusDisplay();
    agentStatusBus.setAgentStatus('Main Agent', 'Ready');
    // Set all agent statuses
    if (manualAssignments.length > 0) {
      manualAssignments.forEach(a => agentStatusBus.setAgentStatus(a.agent, 'Idle'));
    } else {
      brainAgents.forEach((model, idx) => agentStatusBus.setAgentStatus(`Brain${idx + 1}`, 'Idle'));
    }
    
    // Use incommandprompt if provided
    const finalPrompt = options.incommandprompt || prompts.join(' ');
    
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
    console.log(chalk.blue('║                    🧠 Wonderland CLI 1.3.0                   ║'));
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
- /usetool=askuser?"question" - Ask the user for clarification or context
- /usetool=finalans?"answer" - End with your answer

IMPORTANT:
- If the user's question is a simple greeting or can be answered directly, reply ONLY with /usetool=finalans?"your answer". Do NOT use any other tools, explanations, or extra text for simple greetings or direct questions. Do not output anything else.
- For complex questions, use the brain agent first, then end with /usetool=finalans?"your answer".
- Use /usetool=askuser?"question" when you need clarification, context, or additional information from the user.
- Use \\n for line breaks.`;

      const mainAgentPrompt = `User: "${finalPrompt}"

Answer this question directly. If simple, answer now and ONLY output /usetool=finalans?"your answer". If complex, use /usetool=brain?"specific question" first, then end with /usetool=finalans?"your answer".

Answer:`;
      
      // Main agent starts thinking
      agentStatusBus.setAgentStatus('Main Agent', 'Thinking about your question...');
      // If manual assignments, skip main agent LLM and go straight to parallel research
      let toolResults = [];
      let discussionTranscript = '';
      let consensusAnswer = '';
      if (manualAssignments.length > 0) {
        // Each assignment: { agent, query, model }
        const promises = manualAssignments.map(a => {
          agentStatusBus.setAgentStatus(a.agent, `Researching: ${a.query}`);
          const brainPrompt = `You are a specialist. Research: \"${a.query}\". Provide detailed, accurate, and helpful information. Use \\n for line breaks.`;
          return generateStreamingResponse(a.model, brainPrompt, '', a.agent)
            .then(res => {
              agentStatusBus.setAgentStatus(a.agent, 'Done');
              return {
                tool: 'brain',
                query: a.query,
                result: res.response,
                agent: a.agent,
                model: a.model
              };
            })
            .catch(e => {
              agentStatusBus.setAgentStatus(a.agent, 'Error');
              return {
                tool: 'brain',
                query: a.query,
                result: `Error: ${e.message}`,
                agent: a.agent,
                model: a.model
              };
            });
        });
        toolResults = await Promise.all(promises);
        // If more than one brain, offer collaborative discussion
        if (toolResults.length > 1) {
          const { discuss } = await inquirer.prompt([
            { type: 'list', name: 'discuss', message: 'Collaborative brain discussion?', choices: [
              { name: 'Yes (auto)', value: 'auto' },
              { name: 'No (skip)', value: 'skip' },
              { name: 'Repeat discussion', value: 'repeat' }
            ] }]);
          if (discuss === 'auto' || discuss === 'repeat') {
            const { transcript, consensus } = await collaborativeBrainDiscussion(toolResults, prompts.join(' '));
            discussionTranscript = transcript;
            consensusAnswer = consensus;
            if (discuss === 'repeat') {
              // Allow user to repeat as many times as desired
              let again = true;
              while (again) {
                const { repeat } = await inquirer.prompt([
                  { type: 'confirm', name: 'repeat', message: 'Repeat discussion round?' }
                ]);
                if (repeat) {
                  const { transcript: t, consensus: c } = await collaborativeBrainDiscussion(toolResults, prompts.join(' '));
                  discussionTranscript = t;
                  consensusAnswer = c;
                } else {
                  again = false;
                }
              }
            }
          }
        }
      } else if (options.multiBrain && mainAgent) {
        // ... existing multi-brain logic ...
        const mainAgentSystemPrompt = `You are a helpful AI assistant. Answer questions directly.\n\nTools:\n- /usetool=brain?\"question\" - Get detailed info from brain agent\n- /usetool=recallchatlog?\"timeframe\" - Check chat history\n- /usetool=finalans?\"answer\" - End with your answer\n\nIMPORTANT:\n- If the user's question is a simple greeting or can be answered directly, reply ONLY with /usetool=finalans?\"your answer\". Do NOT use any other tools, explanations, or extra text for simple greetings or direct questions. Do not output anything else.\n- For complex questions, use the brain agent first, then end with /usetool=finalans?\"your answer\".\n- Use \\n for line breaks.`;
        const mainAgentPrompt = `User: \"${options.incommandprompt || prompts.join(' ')}\"\n\nAnswer this question directly. If simple, answer now and ONLY output /usetool=finalans?\"your answer\". If complex, use /usetool=brain?\"specific question\" first, then end with /usetool=finalans?\"your answer\".\n\nAnswer:`;
        const mainResult = await generateStreamingResponse(mainAgent, mainAgentPrompt, mainAgentSystemPrompt, 'Main Agent');
        agentStatusBus.setAgentStatus('Main Agent', 'Waiting for brain/tool results...');
        if (mainResult.toolCalls.length > 0) {
          // Only brain tool calls are parallelized
          const brainToolCalls = mainResult.toolCalls.filter(tc => tc.tool === 'brain');
          const otherToolCalls = mainResult.toolCalls.filter(tc => tc.tool !== 'brain');
          // Parallel brain research
          const parallelResults = await executeParallelBrainResearch(brainToolCalls, brainAgents);
          // Collaborative discussion if >1 brain
          if (parallelResults.length > 1) {
            const { discuss } = await inquirer.prompt([
              { type: 'list', name: 'discuss', message: 'Collaborative brain discussion?', choices: [
                { name: 'Yes (auto)', value: 'auto' },
                { name: 'No (skip)', value: 'skip' },
                { name: 'Repeat discussion', value: 'repeat' }
              ] }]);
            if (discuss === 'auto' || discuss === 'repeat') {
              const { transcript, consensus } = await collaborativeBrainDiscussion(parallelResults, prompts.join(' '));
              discussionTranscript = transcript;
              consensusAnswer = consensus;
              if (discuss === 'repeat') {
                let again = true;
                while (again) {
                  const { repeat } = await inquirer.prompt([
                    { type: 'confirm', name: 'repeat', message: 'Repeat discussion round?' }
                  ]);
                  if (repeat) {
                    const { transcript: t, consensus: c } = await collaborativeBrainDiscussion(parallelResults, prompts.join(' '));
                    discussionTranscript = t;
                    consensusAnswer = c;
                  } else {
                    again = false;
                  }
                }
              }
            }
          }
          // Execute other tools sequentially if any
          let otherResults = [];
          for (const toolCall of otherToolCalls) {
            // Fallback to single brain agent for non-brain tools
            const res = await executeToolCalls([toolCall], brainAgent);
            otherResults = otherResults.concat(res);
          }
          toolResults = [...parallelResults, ...otherResults];
        }
      } else if (mainAgent) {
        // Fallback: single brain agent sequential
        const mainAgentSystemPrompt = `You are a helpful AI assistant. Answer questions directly.\n\nTools:\n- /usetool=brain?\"question\" - Get detailed info from brain agent\n- /usetool=recallchatlog?\"timeframe\" - Check chat history\n- /usetool=finalans?\"answer\" - End with your answer\n\nIMPORTANT:\n- If the user's question is a simple greeting or can be answered directly, reply ONLY with /usetool=finalans?\"your answer\". Do NOT use any other tools, explanations, or extra text for simple greetings or direct questions. Do not output anything else.\n- For complex questions, use the brain agent first, then end with /usetool=finalans?\"your answer\".\n- Use \\n for line breaks.`;
        const mainAgentPrompt = `User: \"${options.incommandprompt || prompts.join(' ')}\"\n\nAnswer this question directly. If simple, answer now and ONLY output /usetool=finalans?\"your answer\". If complex, use /usetool=brain?\"specific question\" first, then end with /usetool=finalans?\"your answer\".\n\nAnswer:`;
        const mainResult = await generateStreamingResponse(mainAgent, mainAgentPrompt, mainAgentSystemPrompt, 'Main Agent');
        agentStatusBus.setAgentStatus('Main Agent', 'Waiting for brain/tool results...');
        if (mainResult.toolCalls.length > 0) {
          toolResults = await executeToolCalls(mainResult.toolCalls, brainAgent);
        }
      }
      
      // Show discussion transcript if present
      if (discussionTranscript) {
        console.log(chalk.magenta('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.magenta('║                🤝 BRAIN DISCUSSION TRANSCRIPT                ║'));
        console.log(chalk.magenta('╚══════════════════════════════════════════════════════════════╝'));
        console.log(discussionTranscript);
      }
      // Aggregate and display all results
      const allFinalAnswers = toolResults.filter(result => result.tool === 'finalans');
      let finalAnswer = allFinalAnswers.length > 0 ? allFinalAnswers[allFinalAnswers.length - 1] : null;
      if (consensusAnswer) {
        finalAnswer = { result: consensusAnswer };
      }
      if (finalAnswer) {
        chatHistory.push({
          timestamp: new Date().toISOString(),
          prompt: prompts.join(' '),
          response: finalAnswer.result,
          toolCalls: [],
          toolResults: toolResults
        });
        console.log(chalk.green('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.green('║                        🎯 FINAL ANSWER                        ║'));
        console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
        console.log(chalk.white(`\n${finalAnswer.result}`));
        console.log(chalk.green('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.green('║                      ✅ SESSION COMPLETE                      ║'));
        console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
      } else {
        // Show all tool results (grouped by agent)
        console.log(chalk.blue('\n🤖 Main Agent processing tool results...\n'));
        toolResults.forEach(result => {
          console.log(chalk.cyan(`Agent: ${result.agent || 'Brain Agent'}`));
          console.log(chalk.gray(`Tool: ${result.tool}`));
          console.log(chalk.gray(`Query: ${result.query}`));
          console.log(chalk.white(`Result: ${result.result}\n`));
        });
      }
      stopDisplay();
    } catch (e) {
      stopDisplay();
      console.log(chalk.red('❌ Error:', e.message));
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
      const maxUsage = Math.max(...Object.values(toolUsage));
      Object.entries(toolUsage).forEach(([tool, count]) => {
        const barLength = Math.round((count / maxUsage) * 20);
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
        console.log(chalk.white(`   ${tool.padEnd(12)} ${bar} ${count}`));
      });
      console.log('');
    }
    
    // Agent usage
    if (Object.keys(agentUsage).length > 0) {
      console.log(chalk.blue('🤖 Agent Usage:'));
      Object.entries(agentUsage).forEach(([agent, count]) => {
        console.log(chalk.white(`   ${agent}: ${chalk.green(count)}`));
      });
      console.log('');
    }
    
    // Recent activity (last 5)
    if (recent.length > 0) {
      console.log(chalk.blue('🕒 Recent Activity:'));
      recent.slice(-5).reverse().forEach((entry, i) => {
        if (entry.prompt) {
          const time = new Date(entry.time).toLocaleString();
          const prompt = entry.prompt.length > 50 ? entry.prompt.substring(0, 50) + '...' : entry.prompt;
          console.log(chalk.gray(`   ${i + 1}. [${time}] ${prompt}`));
        }
      });
    }
  });

// === Session Replay ===
program
  .command('resources')
  .description('Show system resource usage and scheduling status')
  .option('-m, --monitor', 'Continuous monitoring mode')
  .option('-i, --interval <seconds>', 'Monitoring interval in seconds', '5')
  .action(async (options) => {
    if (options.monitor) {
      console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
      console.log(chalk.blue('║                    📊 RESOURCE MONITORING                   ║'));
      console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
      console.log(chalk.gray('Press Ctrl+C to stop monitoring'));
      console.log('');
      
      const interval = parseInt(options.interval) * 1000;
      
      const monitorInterval = setInterval(() => {
        const status = resourceMonitor.getResourceStatus();
        const metrics = status.metrics;
        
        // Clear screen and redraw
        process.stdout.write('\x1Bc');
        console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.blue('║                    📊 RESOURCE MONITORING                   ║'));
        console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
        console.log(chalk.gray(`Last updated: ${new Date().toLocaleTimeString()}`));
        console.log('');
        
        // Status indicator
        const statusColor = status.status === 'throttled' ? chalk.red : chalk.green;
        console.log(statusColor(`Status: ${status.status.toUpperCase()}`));
        console.log('');
        
        // Resource bars
        console.log(chalk.blue('Memory Usage:'));
        const memBar = createProgressBar(metrics.memory, metrics.maxMemory);
        console.log(chalk.white(`   ${memBar} ${metrics.memory}MB / ${metrics.maxMemory}MB`));
        console.log('');
        
        console.log(chalk.blue('CPU Usage:'));
        const cpuBar = createProgressBar(metrics.cpu, metrics.maxCpu);
        console.log(chalk.white(`   ${cpuBar} ${metrics.cpu}% / ${metrics.maxCpu}%`));
        console.log('');
        
        console.log(chalk.blue('Active Agents:'));
        const agentBar = createProgressBar(metrics.agents, metrics.maxAgents);
        console.log(chalk.white(`   ${agentBar} ${metrics.agents} / ${metrics.maxAgents}`));
        console.log('');
        
        // Recommendations
        if (status.recommendations.length > 0) {
          console.log(chalk.yellow('⚠️  Recommendations:'));
          status.recommendations.forEach(rec => {
            console.log(chalk.gray(`   • ${rec}`));
          });
          console.log('');
        }
        
        console.log(chalk.gray('Press Ctrl+C to stop monitoring'));
      }, interval);
      
      // Handle Ctrl+C
      process.on('SIGINT', () => {
        clearInterval(monitorInterval);
        console.log(chalk.green('\n✅ Resource monitoring stopped.'));
        process.exit(0);
      });
      
    } else {
      // Single status display
      const status = resourceMonitor.getResourceStatus();
      const metrics = status.metrics;
      
      console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
      console.log(chalk.blue('║                    📊 RESOURCE STATUS                       ║'));
      console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
      console.log('');
      
      // Status indicator
      const statusColor = status.status === 'throttled' ? chalk.red : chalk.green;
      console.log(statusColor(`Status: ${status.status.toUpperCase()}`));
      console.log('');
      
      // Resource bars
      console.log(chalk.blue('Memory Usage:'));
      const memBar = createProgressBar(metrics.memory, metrics.maxMemory);
      console.log(chalk.white(`   ${memBar} ${metrics.memory}MB / ${metrics.maxMemory}MB`));
      console.log('');
      
      console.log(chalk.blue('CPU Usage:'));
      const cpuBar = createProgressBar(metrics.cpu, metrics.maxCpu);
      console.log(chalk.white(`   ${cpuBar} ${metrics.cpu}% / ${metrics.maxCpu}%`));
      console.log('');
      
      console.log(chalk.blue('Active Agents:'));
      const agentBar = createProgressBar(metrics.agents, metrics.maxAgents);
      console.log(chalk.white(`   ${agentBar} ${metrics.agents} / ${metrics.maxAgents}`));
      console.log('');
      
      // Recommendations
      if (status.recommendations.length > 0) {
        console.log(chalk.yellow('⚠️  Recommendations:'));
        status.recommendations.forEach(rec => {
          console.log(chalk.gray(`   • ${rec}`));
        });
        console.log('');
      }
      
      // Scheduling info
      console.log(chalk.blue('Scheduling:'));
      console.log(chalk.white(`   Can start new agent: ${resourceMonitor.canStartNewAgent() ? chalk.green('Yes') : chalk.red('No')}`));
      console.log(chalk.white(`   Should throttle: ${resourceMonitor.shouldThrottle() ? chalk.red('Yes') : chalk.green('No')}`));
    }
  });

// Helper function to create progress bars
function createProgressBar(current, max, length = 20) {
  const percentage = Math.min(100, (current / max) * 100);
  const filledLength = Math.round((percentage / 100) * length);
  const bar = '█'.repeat(filledLength) + '░'.repeat(length - filledLength);
  
  if (percentage > 80) return chalk.red(bar);
  if (percentage > 60) return chalk.yellow(bar);
  return chalk.green(bar);
}

program
  .command('replay')
  .description('Replay a session with real-time agent thinking')
  .option('-f, --file <filename>', 'Specific session file to replay')
  .option('-l, --latest', 'Replay the latest session')
  .option('-s, --speed <speed>', 'Replay speed (slow, normal, fast)', 'normal')
  .action(async (options) => {
    if (!fs.existsSync(LOG_DIR)) {
      console.log(chalk.yellow('No logs found.'));
      return;
    }
    
    const logFiles = fs.readdirSync(LOG_DIR).filter(f => f.startsWith('session-') && f.endsWith('.json'));
    if (logFiles.length === 0) {
      console.log(chalk.yellow('No session logs found.'));
      return;
    }
    
    let targetFile;
    if (options.file) {
      targetFile = options.file;
      if (!logFiles.includes(targetFile)) {
        console.log(chalk.red(`Session file ${targetFile} not found.`));
        return;
      }
    } else if (options.latest) {
      targetFile = logFiles.sort().reverse()[0];
    } else {
      // Interactive selection
      const { selectedFile } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedFile',
          message: 'Select a session to replay:',
          choices: logFiles.map(file => ({
            name: `${file} (${new Date(file.replace('session-', '').replace('.json', '')).toLocaleString()})`,
            value: file
          }))
        }
      ]);
      targetFile = selectedFile;
    }
    
    const logPath = path.join(LOG_DIR, targetFile);
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const entries = logContent.split('\n---\n').filter(Boolean).map(e => JSON.parse(e));
    
    // Set replay speed
    const speeds = { slow: 2000, normal: 1000, fast: 500 };
    const delay = speeds[options.speed] || speeds.normal;
    
    console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║                    🎬 SESSION REPLAY                        ║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
    console.log(chalk.gray(`Replaying: ${targetFile}`));
    console.log(chalk.gray(`Speed: ${options.speed}`));
    console.log(chalk.gray('─'.repeat(80)));
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      if (entry.type === 'session_start') {
        console.log(chalk.yellow('🚀 Session Start:'));
        console.log(chalk.white(`   Prompt: ${entry.prompt}`));
        if (entry.agents) {
          console.log(chalk.cyan(`   Agents: ${Object.values(entry.agents).join(', ')}`));
        }
        console.log('');
      } else if (entry.type === 'agent_step') {
        console.log(chalk.cyan(`🧠 ${entry.agent} (${entry.duration}ms):`));
        console.log(chalk.gray(`   Prompt: ${entry.prompt}`));
        
        // Simulate real-time typing
        const words = entry.response.split(' ');
        for (let j = 0; j < words.length; j++) {
          process.stdout.write(chalk.white(words[j] + ' '));
          await new Promise(resolve => setTimeout(resolve, delay / 10));
        }
        console.log('\n');
        
        if (entry.toolCalls && entry.toolCalls.length > 0) {
          console.log(chalk.magenta('🔧 Tool Calls:'));
          entry.toolCalls.forEach(tc => {
            console.log(chalk.gray(`   /usetool=${tc.tool}?"${tc.query}"`));
          });
          console.log('');
        }
      }
      
      // Add delay between entries
      if (i < entries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
        console.log(chalk.green('✅ Session replay complete!'));
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

// Handle -setup4u option
if (process.argv.includes('-setup4u')) {
  const setup = spawn('sh', ['setup.sh'], { stdio: 'inherit' });
  setup.on('close', (code) => {
    process.exit(code);
  });
  return;
} 

// === Resource-Aware Scheduling ===
const resourceMonitor = {
  memoryUsage: 0,
  cpuUsage: 0,
  activeAgents: 0,
  maxAgents: 5, // Maximum concurrent agents
  maxMemoryMB: 2048, // Maximum memory usage in MB
  maxCpuPercent: 80, // Maximum CPU usage percentage
  
  updateMetrics() {
    // Get system memory usage
    const memUsage = process.memoryUsage();
    this.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    
    // Get active agents count
    this.activeAgents = Object.keys(agentStatusBus.activeTasks).length;
    
    // Simple CPU estimation based on active agents
    this.cpuUsage = Math.min(100, this.activeAgents * 20); // Rough estimate
    
    return {
      memory: this.memoryUsage,
      cpu: this.cpuUsage,
      agents: this.activeAgents,
      maxAgents: this.maxAgents,
      maxMemory: this.maxMemoryMB,
      maxCpu: this.maxCpuPercent
    };
  },
  
  canStartNewAgent() {
    const metrics = this.updateMetrics();
    return (
      metrics.agents < metrics.maxAgents &&
      metrics.memory < metrics.maxMemory &&
      metrics.cpu < metrics.maxCpu
    );
  },
  
  shouldThrottle() {
    const metrics = this.updateMetrics();
    return (
      metrics.memory > metrics.maxMemory * 0.8 ||
      metrics.cpu > metrics.maxCpu * 0.8 ||
      metrics.agents >= metrics.maxAgents
    );
  },
  
  getResourceStatus() {
    const metrics = this.updateMetrics();
    return {
      status: this.shouldThrottle() ? 'throttled' : 'normal',
      metrics,
      recommendations: this.getRecommendations(metrics)
    };
  },
  
  getRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.agents >= metrics.maxAgents) {
      recommendations.push('Consider interrupting some agents to free up capacity');
    }
    
    if (metrics.memory > metrics.maxMemory * 0.8) {
      recommendations.push('High memory usage - consider reducing concurrent agents');
    }
    
    if (metrics.cpu > metrics.maxCpu * 0.8) {
      recommendations.push('High CPU usage - consider throttling agent operations');
    }
    
    return recommendations;
  }
};

// === Collaborative Brain Discussion ===
async function collaborativeBrainDiscussion(results, userPrompt) {
  // results: [{agent, query, result, ...}]
  if (results.length < 2) return { transcript: '', consensus: results[0]?.result || '' };
  // Simulate a discussion: each brain critiques and refines the others' answers
  let transcript = '';
  // Step 1: Each brain shares its answer
  transcript += chalk.bold('🧠 Brain Discussion Round 1: Initial Answers\n');
  results.forEach(r => {
    transcript += chalk.cyan(`${r.agent} [${r.query}]:\n`) + chalk.white(r.result) + '\n\n';
  });
  // Step 2: Each brain critiques the others
  transcript += chalk.bold('🧠 Brain Discussion Round 2: Critique & Suggestions\n');
  const critiquePromises = results.map(async (r, idx) => {
    const others = results.filter((_, i) => i !== idx).map(o => `${o.agent}: ${o.result}`).join('\n');
    const critiquePrompt = `You are ${r.agent}, a specialist in ${r.query}. Here are the other brains' answers:\n${others}\n\nPlease critique and suggest improvements to their answers. Be constructive and concise.`;
    const critique = await generateStreamingResponse(r.model || r.agent, critiquePrompt, '', r.agent);
    return { agent: r.agent, critique: critique.response };
  });
  const critiques = await Promise.all(critiquePromises);
  critiques.forEach(c => {
    transcript += chalk.cyan(`${c.agent}:\n`) + chalk.white(c.critique) + '\n\n';
  });
  // Step 3: Consensus/refinement
  transcript += chalk.bold('🧠 Brain Discussion Round 3: Consensus/Refinement\n');
  const consensusPrompt = `You are a panel of AI brains. Here are the initial answers and critiques:\n\n${results.map(r => `${r.agent}: ${r.result}`).join('\n')}\n\nCritiques:\n${critiques.map(c => `${c.agent}: ${c.critique}`).join('\n')}\n\nBased on all the above, write a single, improved, consensus answer to the user's question: ${userPrompt}`;
  const consensus = await generateStreamingResponse(results[0].model || results[0].agent, consensusPrompt, '', 'Brain Panel');
  transcript += chalk.magenta('Consensus Answer:\n') + chalk.white(consensus.response) + '\n';
  return { transcript, consensus: consensus.response };
} 