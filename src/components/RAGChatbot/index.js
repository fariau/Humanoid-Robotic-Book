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
        text: response.response,
        sender: 'bot',
        sources: response.sources || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';

      // Provide more specific error messages based on the error type
      if (error.message && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please make sure the backend service is running and properly configured.';
      } else if (error.message && error.message.includes('404')) {
        errorMessage = 'The API endpoint was not found. Please check if the backend service is properly configured.';
      } else if (error.message && error.message.includes('500')) {
        errorMessage = 'The server encountered an internal error. Please check the backend logs for more details.';
      } else if (error.message && error.message.includes('NetworkError')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
      }

      const errorMsg = {
        id: Date.now() + 1,
        text: errorMessage,
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
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: question,
          context: { selectedText: selectedText || null },
          language: 'en'
        }),
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
      border: '1px solid #d0d0d0',
      borderRadius: '8px',
      padding: '16px',
      margin: '20px 0',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #eee'
      }}>
        <h3 style={{
          margin: 0,
          color: '#242526',
          fontSize: '16px',
          fontWeight: '600'
        }}>🤖 Textbook Assistant</h3>
        <button
          onClick={handleAskSelected}
          style={{
            backgroundColor: '#3578e5',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
          title="Ask about selected text"
        >
          Ask about selected
        </button>
      </div>

      {selectedText && (
        <div style={{
          backgroundColor: '#f0f8ff',
          border: '1px solid #d0ebff',
          borderRadius: '6px',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '14px',
          color: '#24292f'
        }}>
          <strong style={{ color: '#0969da' }}>Selected:</strong> "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '12px',
        padding: '8px',
        backgroundColor: '#fafbfc',
        border: '1px solid #e1e4e8',
        borderRadius: '6px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            color: '#586069',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px',
            fontSize: '14px'
          }}>
            Ask me anything about the Physical AI & Humanoid Robotics textbook! You can also select text on the page and click "Ask about selected".
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: '10px',
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: msg.sender === 'user' ? '#3578e5' : '#ffffff',
                  color: msg.sender === 'user' ? 'white' : '#242526',
                  maxWidth: '80%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e1e4e8'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '10px'
          }}>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '18px 18px 18px 4px',
                backgroundColor: '#ffffff',
                color: '#242526',
                maxWidth: '80%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                border: '1px solid #e1e4e8'
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
            border: '1px solid #d0d0d0',
            borderRadius: '6px',
            resize: 'vertical',
            minHeight: '40px',
            maxHeight: '100px',
            fontSize: '14px',
            outline: 'none'
          }}
          rows={1}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          style={{
            backgroundColor: isLoading || !inputValue.trim() ? '#d0d0d0' : '#3578e5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
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