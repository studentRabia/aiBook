import React from 'react';
import SimpleChatbot from '../components/SimpleChatbot';

export default function Root({children}) {
  return (
    <>
      {children}
      <SimpleChatbot />
    </>
  );
}
