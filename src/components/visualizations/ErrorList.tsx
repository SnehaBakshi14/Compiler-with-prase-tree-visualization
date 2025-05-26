import React from 'react';
import { CompilerError } from '../../types/compiler';

interface ErrorListProps {
  errors: CompilerError[];
}

const ErrorList: React.FC<ErrorListProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-3">No errors found</h3>
          <p className="text-gray-500 mt-1">Your code compiled successfully without any errors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <h3 className="text-lg font-medium mb-4">Errors ({errors.length})</h3>
      
      <div className="space-y-4">
        {errors.map((error, index) => (
          <div 
            key={index} 
            className="bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error.message}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Line: {error.line}, Column: {error.column}</p>
                    {error.context && (
                      <pre className="mt-1 bg-red-100 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                        {error.context}
                      </pre>
                    )}
                  </div>
                  {error.suggestions && error.suggestions.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-red-800">Suggestions:</h4>
                      <ul className="list-disc pl-5 mt-1 text-sm text-red-700">
                        {error.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorList;