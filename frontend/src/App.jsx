import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3000/api';

// Helper function to format currency in INR
const formatINR = (amount) => {
  if (!amount || amount === 0) return 'Not specified';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

function App() {
  const [contracts, setContracts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `Hello! I'm your contract management assistant powered by Llama 2. I can help you:

• Search for contracts
• Check contract status  
• View expiring contracts
• Answer questions about your contracts

How can I help you today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    client_name: '',
    contract_type: 'individual',
    start_date: '',
    end_date: '',
    salary: '',
    notes: ''
  });

  useEffect(() => {
    loadContracts();
    loadAlerts();
    loadChatHistory(); // Load chat history on mount
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from localStorage or create new session
  const loadChatHistory = () => {
    const savedChatId = localStorage.getItem('chatId');
    
    if (savedChatId) {
      setChatId(savedChatId);
      
      // Try to load history from backend
      fetch(`${API_URL}/chat/history/${savedChatId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            const formattedMessages = [
              messages[0], // Keep welcome message
              ...data.messages.map(msg => [
                { role: 'user', content: msg.user },
                { role: 'bot', content: msg.bot }
              ]).flat()
            ];
            setMessages(formattedMessages);
            console.log('✅ Chat history loaded:', data.messages.length, 'messages');
          }
        })
        .catch(err => {
          console.log('No previous chat history found');
        });
    }
  };

  const loadContracts = async () => {
    try {
      const response = await fetch(`${API_URL}/contracts`);
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chat_id: chatId
        })
      });

      const data = await response.json();
      
      if (data.chat_id) {
        setChatId(data.chat_id);
        localStorage.setItem('chatId', data.chat_id); // Save chat ID
      }

      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Sorry, I encountered an error. Make sure Ollama is running with: ollama serve' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitContract = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting contract:', formData);
      
      const response = await fetch(`${API_URL}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salary: formData.salary ? parseFloat(formData.salary) : null
        })
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (response.ok && data.success) {
        setShowModal(false);
        
        setFormData({
          title: '',
          company: '',
          client_name: '',
          contract_type: 'individual',
          start_date: '',
          end_date: '',
          salary: '',
          notes: ''
        });
        
        await loadContracts();
        await loadAlerts();
        
        const salaryText = data.contract.salary 
          ? `\n💰 Salary: ${formatINR(data.contract.salary)}`
          : '';
        
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `✅ Contract "${data.contract.title}" added successfully!\n\n📋 ID: ${data.contract.id}\n🏢 Company: ${data.contract.company}${salaryText}\n📊 Status: ${data.contract.status}\n📅 End Date: ${data.contract.end_date}` 
        }]);
        
        console.log('✅ Contract saved and UI updated!');
      } else {
        console.error('Failed to save contract:', data);
        alert('Error: ' + (data.error || 'Failed to save contract'));
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Error creating contract: ' + error.message);
    }
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      localStorage.removeItem('chatId');
      setChatId(null);
      setMessages([{
        role: 'bot',
        content: `Hello! I'm your contract management assistant powered by Llama 2. I can help you:

• Search for contracts
• Check contract status
• View expiring contracts
• Answer questions about your contracts

How can I help you today?`
      }]);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'expiring': return 'status-expiring';
      case 'expired': return 'status-expired';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h1>📋 Contracts</h1>
        
        <div className="section">
          <h2>Quick Actions</h2>
          <button className="btn" onClick={() => setShowModal(true)}>➕ Add Contract</button>
          <button className="btn" onClick={loadContracts}>🔄 Refresh</button>
          <button className="btn" onClick={loadAlerts}>🔔 Alerts</button>
          <button className="btn" onClick={clearChatHistory}>🗑️ Clear Chat</button>
        </div>

        <div className="section">
          <h2>⚠️ Alerts ({alerts.length})</h2>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <p className="empty-text">No alerts</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.contract_id} className={`alert-item ${alert.status}`}>
                  <strong>{alert.title}</strong><br />
                  <small>{alert.company}</small><br />
                  <small>Days remaining: {alert.days_remaining}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h2>📄 All Contracts ({contracts.length})</h2>
          <div className="contract-list">
            {contracts.length === 0 ? (
              <p className="empty-text">No contracts</p>
            ) : (
              contracts.map(contract => (
                <div key={contract.id} className="contract-item">
                  <strong>{contract.title}</strong>
                  <span className={`status-badge ${getStatusClass(contract.status)}`}>
                    {contract.status}
                  </span>
                  <br />
                  <small>🏢 {contract.company}</small><br />
                  {contract.salary && (
                    <>
                      <small>💰 {formatINR(contract.salary)}</small><br />
                    </>
                  )}
                  <small>📅 Ends: {contract.end_date}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="main-content">
        <div className="chat-header">
          <h1>💬 Contract Assistant</h1>
          <p className="llama-badge">🦙 Powered by Llama 2 7B (Ollama)</p>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-content loading">
                <span className="loader"></span> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me about your contracts..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="send-btn" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Contract</h2>
            <form onSubmit={handleSubmitContract}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contract Type *</label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleFormChange}
                >
                  <option value="individual">Individual</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Salary (INR)</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleFormChange}
                  placeholder="e.g., 500000"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn">💾 Save Contract</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => setShowModal(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
