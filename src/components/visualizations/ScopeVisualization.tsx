import React from 'react';
import { VariableScope } from '../../types/compiler';

interface ScopeVisualizationProps {
  scopes: VariableScope[];
}

const ScopeVisualization: React.FC<ScopeVisualizationProps> = ({ scopes }) => {
  if (!scopes || scopes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No scope information available</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <h3 className="text-lg font-medium mb-4">Variable Scopes</h3>
      
      <div className="space-y-6">
        {scopes.map((scope, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-blue-50 p-3 border-b">
              <h4 className="font-medium">
                {scope.name}
                <span className="ml-2 text-sm text-gray-500">
                  (Lines {scope.start}-{scope.end})
                </span>
              </h4>
            </div>
            
            <div className="p-4">
              {scope.variables.length === 0 ? (
                <p className="text-gray-500 text-sm">No variables in this scope</p>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-left">Line</th>
                      <th className="py-2 px-4 text-left">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scope.variables.map((variable, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 px-4 font-mono">
                          {variable.name}
                        </td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                            {variable.type}
                          </span>
                        </td>
                        <td className="py-2 px-4">{variable.line}</td>
                        <td className="py-2 px-4">
                          {variable.used ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {scope.children && scope.children.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2">Inner Scopes</h5>
                  <div className="pl-4 border-l border-blue-200">
                    {scope.children.map((child, i) => (
                      <div key={i} className="mb-2">
                        <h6 className="text-sm font-medium">
                          {child.name}
                          <span className="ml-2 text-xs text-gray-500">
                            (Lines {child.start}-{child.end})
                          </span>
                        </h6>
                        <p className="text-sm text-gray-600">
                          {child.variables.length} variable(s)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScopeVisualization;