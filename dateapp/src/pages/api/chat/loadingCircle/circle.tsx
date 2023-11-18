import React from 'react';

const circleStyle = {
  width: '30px',
  height: '30px',
  border: '3px solid #f3f3f3',
  borderRadius: '50%',
  borderTop: '2px solid black',
  animation: 'spin 2s linear infinite'
};

const Circle = () => {
  return (
    <>
      <style>
        {`@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`}
      </style>
      <div style={circleStyle}></div>
    </>
  );
};

export default Circle;
