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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Errors ({errors.length})</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          errors.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {errors.length} {errors.length === 1 ? 'error' : 'errors'} found
        </span>
      </div>
      
      <div className="space-y-4">
        {errors.map((error, index) => (
          <div 
            key={index} 
            className={`rounded-lg shadow-sm overflow-hidden border-l-4 ${
              error.severity === 'error' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {error.severity === 'error' ? (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    error.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {error.message}
                  </h3>
                  <div className="mt-2 text-sm">
                    <div className={error.severity === 'error' ? 'text-red-700' : 'text-yellow-700'}>
                      <span className="font-medium">Location:</span> Line {error.line}, Column {error.column}
                    </div>
                    {error.context && (
                      <pre className={`mt-2 p-2 rounded font-mono text-xs overflow-x-auto ${
                        error.severity === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {error.context}
                      </pre>
                    )}
                  </div>
                  {error.suggestions && error.suggestions.length > 0 && (
                    <div className="mt-3">
                      <h4 className={`text-sm font-medium ${
                        error.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        Suggestions:
                      </h4>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {error.suggestions.map((suggestion, i) => (
                          <li 
                            key={i} 
                            className={`text-sm ${
                              error.severity === 'error' ? 'text-red-700' : 'text-yellow-700'
                            }`}
                          >
                            {suggestion}
                          </li>
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