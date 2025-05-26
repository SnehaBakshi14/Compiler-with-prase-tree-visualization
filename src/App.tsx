import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import VisualizationPanel from './components/VisualizationPanel';
import AnalysisControls from './components/AnalysisControls';
import { CompilerService } from './services/CompilerService';
import { CompilationResult } from './types/compiler';
import { MessageBar } from './components/MessageBar';

function App() {
  const [code, setCode] = useState<string>('// Write your C-like code here\nint main() {\n  int x = 10;\n  if (x > 5) {\n    printf("x is greater than 5\\n");\n  }\n  return 0;\n}');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('parseTree');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [message, setMessage] = useState<{text: string, type: 'info' | 'error' | 'success'} | null>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setMessage({ text: 'Compiling...', type: 'info' });
    
    try {
      const result = await CompilerService.compile(code);
      setCompilationResult(result);
      
      if (result.errors.length > 0) {
        setMessage({ 
          text: `Compilation completed with ${result.errors.length} error(s)`, 
          type: 'error' 
        });
      } else {
        setMessage({ text: 'Compilation successful!', type: 'success' });
      }
    } catch (error) {
      setMessage({ 
        text: 'An error occurred during compilation', 
        type: 'error' 
      });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">CodeVision</h1>
            <span className="text-sm bg-blue-700 px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <button className="px-3 py-1 rounded-md hover:bg-blue-800 transition-colors">
              Examples
            </button>
            <button className="px-3 py-1 rounded-md hover:bg-blue-800 transition-colors">
              Documentation
            </button>
            <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 transition-colors rounded-md">
              Share
            </button>
          </nav>
        </div>
      </header>

      {/* Message Bar */}
      {message && (
        <MessageBar type={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </MessageBar>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Code Editor Panel */}
        <div className="w-full md:w-1/2 border-r border-gray-200 flex flex-col">
          <div className="bg-gray-100 border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Source Code</h2>
            <p className="text-sm text-gray-600">Write your C-like code below</p>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeEditor 
              code={code} 
              onChange={handleCodeChange} 
              errors={compilationResult?.errors || []}
            />
          </div>
          <div className="bg-white border-t border-gray-200 p-4">
            <button 
              onClick={handleCompile}
              disabled={isCompiling}
              className={`w-full px-4 py-2 rounded-md font-medium ${
                isCompiling 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white transition-colors'
              }`}
            >
              {isCompiling ? 'Compiling...' : 'Compile'}
            </button>
          </div>
        </div>

        {/* Visualization Panel */}
        <div className="w-full md:w-1/2 flex flex-col">
          <AnalysisControls 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            hasResult={!!compilationResult}
          />
          <div className="flex-1 overflow-auto bg-white p-4">
            <VisualizationPanel 
              activeTab={activeTab}
              compilationResult={compilationResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;