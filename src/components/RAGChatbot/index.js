import React, { useState, useRef, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

const RAGChatbot = ({ selectedTextInitial = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState(selectedTextInitial);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Function to get selected text from the page
  const getSelectedText = () => {
    const selectedText = window.getSelection().toString().trim();
    return selectedText;
  };

  // Function to handle asking about selected text
  const handleAskSelected = () => {
    const currentSelection = getSelectedText();
    if (currentSelection) {
      setSelectedText(currentSelection);
      setInputValue('Explain this content');
      inputRef.current?.focus();
    } else {
      alert('Please select some text on the page first');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Add user message to chat
    const userMsg = { id: Date.now(), text: userMessage, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await callRAGAPI(userMessage, selectedText);

      const botMsg = {
        id: Date.now() + 1,
        text: response.answer,
        sender: 'bot',
        sources: response.sources || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to call the RAG API
  const callRAGAPI = async (question, selectedText) => {
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, selectedText }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling RAG API:', error);
      throw error;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chatbot-container" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      margin: '20px 0',
      backgroundColor: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>🤖 Textbook Assistant</h3>
        <button
          onClick={handleAskSelected}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Ask about selected text"
        >
          Ask about selected text
        </button>
      </div>

      {selectedText && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '4px',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          <strong>Selected text:</strong> "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
        </div>
      )}

      <div style={{
        height: '300px',
        overflowY: 'auto',
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#777', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            Ask me anything about the Physical AI & Humanoid Robotics textbook! You can also select text on the page and click "Ask about selected text".
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: '10px',
                textAlign: msg.sender === 'user' ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '18px',
                  backgroundColor: msg.sender === 'user' ? '#3498db' : '#ecf0f1',
                  color: msg.sender === 'user' ? 'white' : '#2c3e50',
                  maxWidth: '80%'
                }}
              >
                {msg.text}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
                  Sources: {msg.sources.map((source, idx) => (
                    <span key={idx} style={{ display: 'block', marginLeft: '10px' }}>
                      📄 {source.source_file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '18px',
                backgroundColor: '#ecf0f1',
                color: '#2c3e50',
                maxWidth: '80%'
              }}
            >
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the textbook content..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '18px',
            resize: 'vertical',
            minHeight: '40px',
            maxHeight: '100px'
          }}
          rows={1}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          style={{
            backgroundColor: isLoading || !inputValue.trim() ? '#bdc3c7' : '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '18px',
            cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

// Wrapper to ensure component only renders in browser
const RAGChatbotWrapper = (props) => {
  return (
    <BrowserOnly>
      {() => <RAGChatbot {...props} />}
    </BrowserOnly>
  );
};

export default RAGChatbotWrapper;