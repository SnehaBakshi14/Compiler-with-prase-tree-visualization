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

  const renderNode = (node: ParseTreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="ml-4">
        <div 
          className="flex items-center py-1 hover:bg-blue-50 rounded cursor-pointer group"
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            setSelectedNode(node);
          }}
        >
          <div className="w-4">
            {hasChildren && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </div>
          
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex items-center">
                  <span className="font-mono text-sm">
                    {node.type}
                    {node.value && (
                      <span className="text-blue-600 ml-2">{node.value}</span>
                    )}
                  </span>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-3 py-2 rounded text-sm"
                  sideOffset={5}
                >
                  <div>
                    <div className="font-medium">Node Type: {node.type}</div>
                    {node.value && <div>Value: {node.value}</div>}
                    <div>Children: {node.children.length}</div>
                  </div>
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="border-l-2 border-gray-200">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!parseTree) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No parse tree available</p>
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
                  <dd className="mt-1 text-sm text-gray-900">{selectedNode.type}</dd>
                </div>
                {selectedNode.value && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Value</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{selectedNode.value}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Children</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedNode.children.length}</dd>
                </div>
              </dl>
            </div>

            {selectedNode.children.length > 0 && (
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Child Nodes</h4>
                <ul className="mt-2 space-y-1">
                  {selectedNode.children.map((child, index) => (
                    <li key={index} className="text-sm">
                      <span className="text-gray-500">{index + 1}.</span>{' '}
                      <span className="font-mono">{child.type}</span>
                      {child.value && (
                        <span className="text-blue-600 ml-2">({child.value})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Select a node to view details</p>
        )}
      </div>
    </div>
  );
};

export default ParseTreeVisualization;