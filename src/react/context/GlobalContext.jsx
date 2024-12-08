import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [projectPath, setProjectPath] = useState('');

  return (
    <GlobalContext.Provider
      value={{ projectPath, setProjectPath}}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
