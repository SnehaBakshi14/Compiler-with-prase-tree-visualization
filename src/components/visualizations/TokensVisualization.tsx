import React from 'react';
import { Token } from '../../types/compiler';

interface TokensVisualizationProps {
  tokens: Token[];
}

const TokensVisualization: React.FC<TokensVisualizationProps> = ({ tokens }) => {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No tokens available</p>
      </div>
    );
  }

  // Group tokens by line
  const tokensByLine: { [line: number]: Token[] } = {};
  tokens.forEach(token => {
    if (!tokensByLine[token.line]) {
      tokensByLine[token.line] = [];
    }
    tokensByLine[token.line].push(token);
  });

  const getTokenColor = (type: string): string => {
    switch (type) {
      case 'KEYWORD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IDENTIFIER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPERATOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NUMBER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'STRING':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PUNCTUATION':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <h3 className="text-lg font-medium mb-4">Lexical Analysis</h3>
      
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 border text-left">Type</th>
              <th className="py-2 px-4 border text-left">Value</th>
              <th className="py-2 px-4 border text-left">Line</th>
              <th className="py-2 px-4 border text-left">Column</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getTokenColor(token.type)}`}>
                    {token.type}
                  </span>
                </td>
                <td className="py-2 px-4 border font-mono">{token.value}</td>
                <td className="py-2 px-4 border">{token.line}</td>
                <td className="py-2 px-4 border">{token.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <h3 className="text-lg font-medium mb-4">Source with Token Highlighting</h3>
      
      <div className="border rounded-md bg-white p-4 font-mono text-sm">
        {Object.entries(tokensByLine).map(([line, lineTokens]) => (
          <div key={line} className="mb-1">
            <span className="inline-block w-8 text-right text-gray-500 mr-4">{line}</span>
            {lineTokens.map((token, index) => (
              <span 
                key={index} 
                className={`inline-block px-1 rounded ${getTokenColor(token.type)}`}
                title={token.type}
              >
                {token.value}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokensVisualization;