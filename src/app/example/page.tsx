"use client";
import React, { useEffect, useState } from 'react';

const MovingTextBox: React.FC = () => {
  const [position, setPosition] = useState({ top: 100, left: 100 });

  useEffect(() => {
    const targetPosition = { top: 300, left: 500 };

    const timer = setTimeout(() => {
      setPosition(targetPosition);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        padding: '10px 15px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        transition: 'all 2s ease',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      Watch me move!
    </div>
  );
};

export default MovingTextBox;
