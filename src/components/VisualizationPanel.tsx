import React from 'react';
import { CompilationResult } from '../types/compiler';
import ParseTreeVisualization from './visualizations/ParseTreeVisualization';
import TokensVisualization from './visualizations/TokensVisualization';
import ScopeVisualization from './visualizations/ScopeVisualization';
import ErrorList from './visualizations/ErrorList';
import ControlFlowVisualization from './visualizations/ControlFlowVisualization';
import ComplexityVisualization from './visualizations/ComplexityVisualization';

interface VisualizationPanelProps {
  activeTab: string;
  compilationResult: CompilationResult | null;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
  activeTab, 
  compilationResult 
}) => {
  if (!compilationResult) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No compilation result</h3>
          <p className="mt-2 text-sm text-gray-500">
            Click the "Compile" button to analyze your code and visualize the results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {activeTab === 'tokens' && (
        <TokensVisualization tokens={compilationResult.tokens} />
      )}
      
      {activeTab === 'parseTree' && (
        <ParseTreeVisualization parseTree={compilationResult.parseTree} />
      )}
      
      {activeTab === 'scope' && (
        <ScopeVisualization scopes={compilationResult.scopes} />
      )}
      
      {activeTab === 'controlFlow' && (
        <ControlFlowVisualization controlFlow={compilationResult.controlFlow} />
      )}
      
      {activeTab === 'complexity' && (
        <ComplexityVisualization complexity={compilationResult.complexity} />
      )}
      
      {activeTab === 'errors' && (
        <ErrorList errors={compilationResult.errors} />
      )}
    </div>
  );
};

export default VisualizationPanel;