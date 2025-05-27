// Token from lexical analysis
export interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

// Node in the parse tree
export interface ParseTreeNode {
  id: string;
  type: string;
  value?: string;
  children: ParseTreeNode[];
  parent?: ParseTreeNode;
  line?: number;
  column?: number;
}

// Variable information
export interface Variable {
  name: string;
  type: string;
  line: number;
  used: boolean;
  initialized: boolean;
}

// Scope information
export interface VariableScope {
  name: string;
  start: number;
  end: number;
  variables: Variable[];
  children: VariableScope[];
}

// Node in the control flow graph
export interface ControlFlowNode {
  id: string;
  type: string;
  condition?: string;
  next: ControlFlowNode[];
  conditions: Array<{
    type: string;
    expression: string;
  }>;
}

// Complexity information
export interface ComplexityInfo {
  time: {
    bigO: number;
    factors: string[];
  };
  space: {
    bigO: number;
    details: string[];
  };
  suggestions: Array<{
    title: string;
    description: string;
  }>;
}

// Compiler error
export interface CompilerError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  context?: string;
  suggestions?: string[];
}

// Complete compilation result
export interface CompilationResult {
  tokens: Token[];
  parseTree: ParseTreeNode | null;
  scopes: VariableScope[];
  controlFlow: ControlFlowNode | null;
  complexity: ComplexityInfo | null;
  errors: CompilerError[];
}