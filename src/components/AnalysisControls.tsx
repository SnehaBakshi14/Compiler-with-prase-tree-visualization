import React from 'react';

interface AnalysisControlsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasResult: boolean;
}

const AnalysisControls: React.FC<AnalysisControlsProps> = ({ 
  activeTab, 
  onTabChange, 
  hasResult 
}) => {
  const tabs = [
    { id: 'tokens', label: 'Tokens', icon: 'list-bullet' },
    { id: 'parseTree', label: 'Parse Tree', icon: 'git-branch' },
    { id: 'scope', label: 'Scopes', icon: 'layers' },
    { id: 'controlFlow', label: 'Control Flow', icon: 'arrow-right-circle' },
    { id: 'complexity', label: 'Complexity', icon: 'gauge' },
    { id: 'errors', label: 'Errors', icon: 'alert-triangle' },
  ];

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>
      </div>
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={!hasResult}
            className={`px-4 py-2 border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${!hasResult ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center space-x-1">
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalysisControls;