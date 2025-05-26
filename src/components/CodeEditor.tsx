import React, { useEffect, useRef } from 'react';
import { CompilerError } from '../types/compiler';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  errors: CompilerError[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, errors }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  // Update line numbers whenever code changes
  useEffect(() => {
    if (!lineNumbersRef.current) return;
    
    const lineCount = code.split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)
      .map(num => `<div class="line-number ${hasErrorInLine(num) ? 'text-red-500 font-medium' : ''}">${num}</div>`)
      .join('');
    
    lineNumbersRef.current.innerHTML = lineNumbers;
  }, [code, errors]);
  
  const hasErrorInLine = (lineNumber: number): boolean => {
    return errors.some(error => error.line === lineNumber);
  };
  
  // Handle textarea scroll to sync line numbers
  const handleScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };
  
  return (
    <div className="relative h-full font-mono text-sm">
      <div 
        ref={lineNumbersRef}
        className="absolute left-0 top-0 bottom-0 w-12 px-2 py-2 bg-gray-100 text-gray-500 text-right overflow-hidden"
      />
      <textarea
        ref={editorRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="w-full h-full pl-14 pr-4 py-2 bg-white focus:outline-none resize-none"
        spellCheck="false"
      />
      
      {/* Error indicators */}
      {errors.map((error, index) => (
        <div 
          key={index}
          className="absolute left-12 right-0 h-6 bg-red-100 opacity-30 pointer-events-none"
          style={{ top: `${(error.line - 1) * 1.5}rem` }} // Adjust based on your line height
        />
      ))}
    </div>
  );
};

export default CodeEditor;