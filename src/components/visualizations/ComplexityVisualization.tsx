import React from 'react';
import { ComplexityInfo } from '../../types/compiler';

interface ComplexityVisualizationProps {
  complexity: ComplexityInfo | null;
}

const ComplexityVisualization: React.FC<ComplexityVisualizationProps> = ({ 
  complexity 
}) => {
  if (!complexity) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No complexity information available</p>
      </div>
    );
  }

  // Helper function to get color based on complexity
  const getComplexityColor = (value: number, type: 'time' | 'space'): string => {
    if (type === 'time') {
      if (value <= 2) return 'text-green-600'; // O(1) or O(log n)
      if (value <= 3) return 'text-amber-600'; // O(n)
      return 'text-red-600'; // O(n²) or worse
    } else {
      if (value <= 2) return 'text-green-600'; // O(1) or O(log n)
      return 'text-amber-600'; // O(n) or worse
    }
  };

  // Helper to convert complexity index to readable notation
  const complexityToNotation = (index: number): string => {
    switch (index) {
      case 1: return 'O(1)';
      case 2: return 'O(log n)';
      case 3: return 'O(n)';
      case 4: return 'O(n log n)';
      case 5: return 'O(n²)';
      case 6: return 'O(n³)';
      case 7: return 'O(2ⁿ)';
      case 8: return 'O(n!)';
      default: return 'Unknown';
    }
  };

  // Helper to get complexity explanation
  const getComplexityExplanation = (index: number): string => {
    switch (index) {
      case 1: 
        return 'Constant time - Operations are independent of input size';
      case 2: 
        return 'Logarithmic time - Typically found in binary search or divide-and-conquer algorithms';
      case 3: 
        return 'Linear time - Operations scale linearly with input size, typical for loops iterating once through data';
      case 4: 
        return 'Linearithmic time - Common in efficient sorting algorithms like mergesort or heapsort';
      case 5: 
        return 'Quadratic time - Nested loops, common in simple sorting algorithms like bubble sort';
      case 6: 
        return 'Cubic time - Triple nested loops, common in some matrix operations';
      case 7: 
        return 'Exponential time - Operations double with each input element, typical for brute force solutions';
      case 8: 
        return 'Factorial time - Operations grow factorially with input size, as in permutation algorithms';
      default: 
        return 'Unable to determine complexity';
    }
  };

  return (
    <div className="h-full overflow-auto p-4">
      <h3 className="text-lg font-medium mb-4">Complexity Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Complexity */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-blue-50 p-4 border-b">
            <h4 className="font-medium text-blue-900">Time Complexity</h4>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold mr-2 leading-none" 
                      style={{ fontFamily: 'math' }}>
                  {complexityToNotation(complexity.time.bigO)}
                </span>
                <span className={`${getComplexityColor(complexity.time.bigO, 'time')}`}>
                  {complexity.time.bigO <= 3 ? 'Efficient' : 
                   complexity.time.bigO <= 5 ? 'Moderate' : 'Inefficient'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getComplexityExplanation(complexity.time.bigO)}
              </p>
            </div>
            
            <h5 className="font-medium text-sm mb-2">Contributing Factors:</h5>
            <ul className="text-sm space-y-2">
              {complexity.time.factors.map((factor, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-4 h-4 bg-blue-100 rounded-full mr-2 mt-0.5 flex-shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Space Complexity */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="bg-teal-50 p-4 border-b">
            <h4 className="font-medium text-teal-900">Space Complexity</h4>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold mr-2 leading-none" 
                      style={{ fontFamily: 'math' }}>
                  {complexityToNotation(complexity.space.bigO)}
                </span>
                <span className={`${getComplexityColor(complexity.space.bigO, 'space')}`}>
                  {complexity.space.bigO <= 2 ? 'Efficient' : 'Moderate'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getComplexityExplanation(complexity.space.bigO)}
              </p>
            </div>
            
            <h5 className="font-medium text-sm mb-2">Memory Usage:</h5>
            <ul className="text-sm space-y-2">
              {complexity.space.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-4 h-4 bg-teal-100 rounded-full mr-2 mt-0.5 flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Optimization Suggestions */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden md:col-span-2">
          <div className="bg-purple-50 p-4 border-b">
            <h4 className="font-medium text-purple-900">Optimization Suggestions</h4>
          </div>
          <div className="p-4">
            {complexity.suggestions.length === 0 ? (
              <p className="text-gray-500">No suggestions available.</p>
            ) : (
              <ul className="space-y-3">
                {complexity.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full mr-3 flex-shrink-0 text-purple-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{suggestion.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexityVisualization;