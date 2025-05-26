import React, { useEffect, useState, useRef } from 'react';
import { ParseTreeNode } from '../../types/compiler';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ParseTreeVisualizationProps {
  parseTree: ParseTreeNode | null;
}

const ParseTreeVisualization: React.FC<ParseTreeVisualizationProps> = ({ parseTree }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['node_0']));
  const [selectedNode, setSelectedNode] = useState<ParseTreeNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ParseTreeNode | null>(null);
  
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'PROGRAM':
        return 'bg-blue-100 text-blue-800';
      case 'FOR_STATEMENT':
        return 'bg-purple-100 text-purple-800';
      case 'IF_STATEMENT':
        return 'bg-amber-100 text-amber-800';
      case 'WHILE_STATEMENT':
        return 'bg-teal-100 text-teal-800';
      case 'FUNCTION_DECLARATION':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNode = (node: ParseTreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const nodeColor = getNodeColor(node.type);
    
    return (
      <div key={node.id} className="ml-4">
        <div 
          className={`flex items-center py-1 px-2 rounded cursor-pointer group transition-colors ${
            selectedNode?.id === node.id ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            setSelectedNode(node);
          }}
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div className="w-4 mr-2">
            {hasChildren && (
              <span className="text-gray-400 hover:text-gray-600">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>
          
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${nodeColor}`}>
                    {node.type}
                  </span>
                  {node.value && (
                    <span className="text-blue-600 font-mono text-sm">{node.value}</span>
                  )}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-3 py-2 rounded text-sm max-w-xs"
                  sideOffset={5}
                >
                  <div className="space-y-1">
                    <div className="font-medium">{node.type}</div>
                    {node.value && <div>Value: {node.value}</div>}
                    <div>Children: {node.children.length}</div>
                    {node.id && <div className="text-gray-300 text-xs">ID: {node.id}</div>}
                  </div>
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="border-l-2 border-gray-200 ml-3">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!parseTree) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No parse tree available</p>
          <p className="text-sm text-gray-400 mt-2">Try compiling your code first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Tree View */}
      <div className="w-1/2 h-full overflow-auto p-4 border-r">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Parse Tree</h3>
          <p className="text-sm text-gray-600">Click nodes to expand/collapse</p>
        </div>
        {renderNode(parseTree)}
      </div>

      {/* Node Details */}
      <div className="w-1/2 p-4">
        <h3 className="text-lg font-medium mb-4">Node Details</h3>
        {selectedNode ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getNodeColor(selectedNode.type)}`}>
                      {selectedNode.type}
                    </span>
                  </dd>
                </div>
                {selectedNode.value && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Value</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {selectedNode.value}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Node ID</dt>
                  <dd className="mt-1 text-sm text-gray-600 font-mono">{selectedNode.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Children</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedNode.children.length} node{selectedNode.children.length !== 1 ? 's' : ''}
                  </dd>
                </div>
              </dl>
            </div>

            {selectedNode.children.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Child Nodes</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {selectedNode.children.map((child, index) => (
                    <li 
                      key={index} 
                      className="py-2 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors"
                      onClick={() => {
                        setSelectedNode(child);
                        setExpandedNodes(prev => new Set([...prev, child.id]));
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getNodeColor(child.type)}`}>
                          {child.type}
                        </span>
                        {child.value && (
                          <span className="text-blue-600 font-mono text-sm">{child.value}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500">Select a node to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParseTreeVisualization;