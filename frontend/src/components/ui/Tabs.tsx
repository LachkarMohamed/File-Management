import React, { createContext, useContext } from 'react';

interface TabsContextType {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ activeValue: value, onValueChange }}>
      <div className="space-y-4">
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children }) => {
  return (
    <div className="flex space-x-1 border-b border-gray-200">
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within a Tabs component');
  
  const { activeValue, onValueChange } = context;
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
        ${isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within a Tabs component');
  
  const { activeValue } = context;
  const isActive = activeValue === value;

  return isActive ? (
    <div className="py-4">
      {children}
    </div>
  ) : null;
};