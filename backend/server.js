import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths - Using absolute paths
const CONTRACTS_FILE = path.join(__dirname, 'contracts.json');
const CHAT_HISTORY_FILE = path.join(__dirname, 'chat_history.json');

console.log('Contracts file path:', CONTRACTS_FILE);
console.log('Chat history file path:', CHAT_HISTORY_FILE);

// Initialize files if they don't exist
async function initializeFiles() {
    try {
        // Check and create contracts.json
        try {
            await fs.access(CONTRACTS_FILE);
            console.log('✅ contracts.json exists');
        } catch {
            console.log('📝 Creating contracts.json...');
            await fs.writeFile(CONTRACTS_FILE, '[]', 'utf8');
            console.log('✅ contracts.json created');
        }

        // Check and create chat_history.json
        try {
            await fs.access(CHAT_HISTORY_FILE);
            console.log('✅ chat_history.json exists');
        } catch {
            console.log('📝 Creating chat_history.json...');
            await fs.writeFile(CHAT_HISTORY_FILE, '{}', 'utf8');
            console.log('✅ chat_history.json created');
        }
    } catch (error) {
        console.error('❌ Error initializing files:', error);
    }
}

// Helper functions
async function readJSON(filename) {
    try {
        const data = await fs.readFile(filename, 'utf8');
        console.log(`📖 Read from ${path.basename(filename)}: ${data.substring(0, 100)}...`);
        
        if (!data || data.trim() === '') {
            console.log(`⚠️  Empty file, returning default value`);
            return filename === CONTRACTS_FILE ? [] : {};
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Error reading ${path.basename(filename)}:`, error.message);
        return filename === CONTRACTS_FILE ? [] : {};
    }
}

async function writeJSON(filename, data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(filename, jsonString, 'utf8');
        console.log(`✅ Successfully wrote to ${path.basename(filename)}`);
        console.log(`📝 Data written: ${jsonString.substring(0, 200)}...`);
        return true;
    } catch (error) {
        console.error(`❌ Error writing to ${path.basename(filename)}:`, error);
        return false;
    }
}

function checkContractStatus(contract) {
    const endDate = new Date(contract.end_date);
    const today = new Date();
    const daysRemaining = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
        contract.status = 'expired';
    } else if (daysRemaining <= 30) {
        contract.status = 'expiring';
    } else {
        contract.status = 'active';
    }
    return contract;
}

// Helper function to format INR
function formatINR(amount) {
    if (!amount || amount === 0) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Contract Management Chatbot API with Ollama', status: 'running' });
});

// Get all contracts
app.get('/api/contracts', async (req, res) => {
    try {
        console.log('\n📥 GET /api/contracts called');
        const contracts = await readJSON(CONTRACTS_FILE);
        const updatedContracts = contracts.map(checkContractStatus);
        console.log(`📊 Returning ${contracts.length} contracts`);
        res.json({ contracts: updatedContracts });
    } catch (error) {
        console.error('❌ Error in GET /api/contracts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create contract
app.post('/api/contracts', async (req, res) => {
    try {
        console.log('\n📥 POST /api/contracts called');
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        
        // Validate required fields
        const { title, company, client_name, start_date, end_date } = req.body;
        if (!title || !company || !client_name || !start_date || !end_date) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const contracts = await readJSON(CONTRACTS_FILE);
        console.log(`📊 Current contracts count: ${contracts.length}`);
        
        const newContract = {
            id: contracts.length > 0 ? Math.max(...contracts.map(c => c.id)) + 1 : 1,
            title: req.body.title,
            company: req.body.company,
            client_name: req.body.client_name,
            contract_type: req.body.contract_type || 'individual',
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            salary: req.body.salary || null,
            notes: req.body.notes || '',
            created_at: new Date().toISOString(),
            status: 'active'
        };
        
        console.log('📝 New contract to add:', JSON.stringify(newContract, null, 2));
        
        const contractWithStatus = checkContractStatus(newContract);
        contracts.push(contractWithStatus);
        
        console.log(`📊 New contracts count: ${contracts.length}`);
        
        const success = await writeJSON(CONTRACTS_FILE, contracts);
        
        if (success) {
            console.log('✅ Contract saved successfully!');
            res.json({ 
                message: 'Contract created successfully', 
                contract: contractWithStatus,
                success: true 
            });
        } else {
            console.log('❌ Failed to save contract');
            res.status(500).json({ error: 'Failed to save contract' });
        }
    } catch (error) {
        console.error('❌ Error in POST /api/contracts:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Get single contract
app.get('/api/contracts/:id', async (req, res) => {
    try {
        const contracts = await readJSON(CONTRACTS_FILE);
        const contract = contracts.find(c => c.id === parseInt(req.params.id));
        
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        res.json({ contract: checkContractStatus(contract) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update contract
app.put('/api/contracts/:id', async (req, res) => {
    try {
        const contracts = await readJSON(CONTRACTS_FILE);
        const index = contracts.findIndex(c => c.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        contracts[index] = { ...contracts[index], ...req.body };
        const updatedContract = checkContractStatus(contracts[index]);
        contracts[index] = updatedContract;
        
        await writeJSON(CONTRACTS_FILE, contracts);
        res.json({ message: 'Contract updated', contract: updatedContract });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete contract
app.delete('/api/contracts/:id', async (req, res) => {
    try {
        const contracts = await readJSON(CONTRACTS_FILE);
        const filtered = contracts.filter(c => c.id !== parseInt(req.params.id));
        await writeJSON(CONTRACTS_FILE, filtered);
        res.json({ message: 'Contract deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search contracts
app.post('/api/search', async (req, res) => {
    try {
        const contracts = await readJSON(CONTRACTS_FILE);
        const searchTerm = req.body.query.toLowerCase();
        
        const results = contracts.filter(c =>
            c.title.toLowerCase().includes(searchTerm) ||
            c.company.toLowerCase().includes(searchTerm) ||
            c.client_name.toLowerCase().includes(searchTerm) ||
            c.status.toLowerCase().includes(searchTerm)
        );
        
        res.json({ results, count: results.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const contracts = await readJSON(CONTRACTS_FILE);
        const alerts = [];
        
        contracts.forEach(contract => {
            const updatedContract = checkContractStatus(contract);
            if (updatedContract.status === 'expiring' || updatedContract.status === 'expired') {
                const endDate = new Date(contract.end_date);
                const today = new Date();
                const daysRemaining = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
                
                alerts.push({
                    contract_id: contract.id,
                    title: contract.title,
                    company: contract.company,
                    end_date: contract.end_date,
                    days_remaining: daysRemaining,
                    status: updatedContract.status,
                    message: `Contract '${contract.title}' is ${updatedContract.status}`
                });
            }
        });
        
        res.json({ alerts, count: alerts.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chat with Ollama - IMPROVED WITH SALARY INFO
app.post('/api/chat', async (req, res) => {
    try {
        console.log('\n📥 POST /api/chat called');
        const { message, chat_id } = req.body;
        
        const contracts = await readJSON(CONTRACTS_FILE);
        
        // Create detailed context summary with salary information
        let contractSummary = `You are a helpful contract management assistant. You have access to detailed contract information including salaries.\n\n`;
        contractSummary += `Current contracts in system (Total: ${contracts.length}):\n\n`;
        
        contracts.forEach(c => {
            contractSummary += `Contract ID: ${c.id}\n`;
            contractSummary += `  - Title/Position: ${c.title}\n`;
            contractSummary += `  - Company: ${c.company}\n`;
            contractSummary += `  - Client Name: ${c.client_name}\n`;
            contractSummary += `  - Contract Type: ${c.contract_type}\n`;
            contractSummary += `  - Status: ${c.status}\n`;
            contractSummary += `  - Start Date: ${c.start_date}\n`;
            contractSummary += `  - End Date: ${c.end_date}\n`;
            contractSummary += `  - Salary: ${formatINR(c.salary)}\n`;
            if (c.notes) {
                contractSummary += `  - Notes: ${c.notes}\n`;
            }
            contractSummary += `\n`;
        });
        
        contractSummary += `\nInstructions:\n`;
        contractSummary += `- When users ask about their salary, provide the exact amount from the contract data\n`;
        contractSummary += `- Match users by their name (client_name) or position (title)\n`;
        contractSummary += `- Be specific and include all relevant details like salary, dates, and status\n`;
        contractSummary += `- If asked about status, mention days remaining for expiring contracts\n`;
        contractSummary += `- Be conversational, friendly, and helpful\n`;
        contractSummary += `- Always include salary amounts when discussing contracts\n`;
        contractSummary += `- Format responses clearly with contract details\n\n`;
        
        console.log('🤖 Calling Ollama API...');
        const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama2:7b',
                messages: [
                    { role: 'system', content: contractSummary },
                    { role: 'user', content: message }
                ],
                stream: false
            })
        });
        
        if (!ollamaResponse.ok) {
            throw new Error('Ollama API error. Make sure Ollama is running with: ollama serve');
        }
        
        const ollamaData = await ollamaResponse.json();
        const botResponse = ollamaData.message.content;
        console.log('✅ Ollama response received');
        
        const chatHistory = await readJSON(CHAT_HISTORY_FILE);
        const currentChatId = chat_id || Date.now().toString();
        
        if (!chatHistory[currentChatId]) {
            chatHistory[currentChatId] = [];
        }
        
        chatHistory[currentChatId].push({
            timestamp: new Date().toISOString(),
            user: message,
            bot: botResponse
        });
        
        await writeJSON(CHAT_HISTORY_FILE, chatHistory);
        
        res.json({
            response: botResponse,
            chat_id: currentChatId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Ollama Error:', error);
        res.status(500).json({ 
            error: 'Error communicating with Ollama. Make sure Ollama is running with: ollama serve',
            details: error.message 
        });
    }
});

// Get chat history
app.get('/api/chat/history/:chat_id', async (req, res) => {
    try {
        const chatHistory = await readJSON(CHAT_HISTORY_FILE);
        const history = chatHistory[req.params.chat_id];
        
        if (!history) {
            return res.status(404).json({ error: 'Chat history not found' });
        }
        
        res.json({ chat_id: req.params.chat_id, messages: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
async function startServer() {
    await initializeFiles();
    
    app.listen(PORT, () => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📁 Contracts file: ${CONTRACTS_FILE}`);
        console.log(`📁 Chat history file: ${CHAT_HISTORY_FILE}`);
        console.log(`📝 Make sure Ollama is running: ollama serve`);
        console.log(`🤖 Using model: llama2:7b`);
        console.log(`✅ Backend is ready!`);
        console.log(`${'='.repeat(60)}\n`);
    });
}

startServer();
