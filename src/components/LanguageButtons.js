import React, { useState } from 'react';

// PersonalizeButton component
export const PersonalizeButton = ({ children, ...props }) => {
  const [isPersonalized, setIsPersonalized] = useState(false);

  const handleClick = () => {
    setIsPersonalized(!isPersonalized);
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: isPersonalized ? '#4caf50' : '#2196f3',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        margin: '4px',
      }}
      {...props}
    >
      {isPersonalized ? 'Personalized' : 'Personalize'}
      {children}
    </button>
  );
};

// UrduToggleButton component
export const UrduToggleButton = ({ children, ...props }) => {
  const [isUrdu, setIsUrdu] = useState(false);

  const handleClick = () => {
    setIsUrdu(!isUrdu);
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: isUrdu ? '#ff9800' : '#9e9e9e',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        margin: '4px',
      }}
      {...props}
    >
      {isUrdu ? 'اُردو' : 'English'}
      {children}
    </button>
  );
};