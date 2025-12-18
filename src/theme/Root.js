import React, { useState } from 'react';
import RAGChatbot from '../components/RAGChatbot';

// Custom CSS for the floating chat button
const floatingButtonStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#3578e5', // Docusaurus primary color
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  zIndex: '999',
  transition: 'all 0.3s ease',
  fontWeight: 'bold',
};

const floatingButtonHoverStyle = {
  ...floatingButtonStyle,
  transform: 'scale(1.1)',
  backgroundColor: '#2a69d9', // Darker shade for hover
};

const chatContainerStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  zIndex: '999',
  width: '400px',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
};

const chatbotWrapperStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const closeChatButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: '#e0e0e0',
  color: '#333',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  zIndex: '1000',
  transition: 'background-color 0.2s ease',
};

const closeChatButtonHoverStyle = {
  ...closeChatButtonStyle,
  backgroundColor: '#d0d0d0',
};

const Root = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      {children}
      {isChatOpen ? (
        <div style={chatContainerStyle}>
          <div style={chatbotWrapperStyle}>
            <button
              style={isCloseHovered ? closeChatButtonHoverStyle : closeChatButtonStyle}
              onClick={closeChat}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
            <RAGChatbot />
          </div>
        </div>
      ) : (
        <button
          style={isHovered ? floatingButtonHoverStyle : floatingButtonStyle}
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Open chatbot"
        >
          🤖
        </button>
      )}
    </>
  );
};

export default Root;