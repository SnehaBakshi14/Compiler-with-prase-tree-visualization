import { 
  CompilationResult, 
  Token, 
  ParseTreeNode, 
  VariableScope, 
  ControlFlowNode,
  ComplexityInfo,
  CompilerError
} from '../types/compiler';

export class CompilerService {
  static async compile(code: string): Promise<CompilationResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const tokens = this.performLexicalAnalysis(code);
      const parseTree = this.performSyntaxAnalysis(tokens);
      const { scopes, errors } = this.performSemanticAnalysis(parseTree, tokens);
      const controlFlow = this.analyzeControlFlow(parseTree);
      const complexity = this.estimateComplexity(parseTree, controlFlow, code);
      
      // Combine lexical, syntax, and semantic errors
      const allErrors = [
        ...this.findLexicalErrors(tokens),
        ...this.findSyntaxErrors(parseTree),
        ...errors
      ];

      return {
        tokens,
        parseTree,
        scopes,
        controlFlow,
        complexity,
        errors: allErrors,
      };
    } catch (e) {
      console.error('Compilation error:', e);
      return {
        tokens: [],
        parseTree: null,
        scopes: [],
        controlFlow: null,
        complexity: null,
        errors: [{
          message: `Fatal error: ${e instanceof Error ? e.message : 'Unknown error'}`,
          line: 1,
          column: 1,
          severity: 'error',
          suggestions: ['Check for syntax errors', 'Ensure all brackets are properly closed']
        }]
      };
    }
  }

  private static findLexicalErrors(tokens: Token[]): CompilerError[] {
    const errors: CompilerError[] = [];
    
    tokens.forEach((token, index) => {
      if (token.type === 'ERROR') {
        errors.push({
          message: `Invalid token: ${token.value}`,
          line: token.line,
          column: token.column,
          severity: 'error',
          context: this.getErrorContext(tokens, index),
          suggestions: [
            'Check for invalid characters',
            'Ensure proper syntax is used',
            'Verify string literals are properly closed'
          ]
        });
      }
    });

    return errors;
  }

  private static findSyntaxErrors(parseTree: ParseTreeNode): CompilerError[] {
    const errors: CompilerError[] = [];
    let bracketStack: { char: string, line: number, column: number }[] = [];
    
    const checkNode = (node: ParseTreeNode) => {
      if (node.type === 'PUNCTUATION') {
        if (['{', '(', '['].includes(node.value || '')) {
          bracketStack.push({ 
            char: node.value || '', 
            line: node.line || 0, 
            column: node.column || 0 
          });
        } else if (['}', ')', ']'].includes(node.value || '')) {
          const last = bracketStack.pop();
          if (!last || !this.matchingBrackets(last.char, node.value || '')) {
            errors.push({
              message: `Mismatched brackets: expected closing ${last?.char || 'bracket'}`,
              line: node.line || 0,
              column: node.column || 0,
              severity: 'error',
              suggestions: ['Ensure all brackets are properly matched']
            });
          }
        }
      }
      
      node.children.forEach(checkNode);
    };
    
    checkNode(parseTree);
    
    // Check for unclosed brackets
    bracketStack.forEach(bracket => {
      errors.push({
        message: `Unclosed bracket: ${bracket.char}`,
        line: bracket.line,
        column: bracket.column,
        severity: 'error',
        suggestions: ['Add the corresponding closing bracket']
      });
    });

    return errors;
  }

  private static matchingBrackets(open: string, close: string): boolean {
    return (
      (open === '{' && close === '}') ||
      (open === '(' && close === ')') ||
      (open === '[' && close === ']')
    );
  }

  private static getErrorContext(tokens: Token[], errorIndex: number): string {
    const contextSize = 5;
    const start = Math.max(0, errorIndex - contextSize);
    const end = Math.min(tokens.length, errorIndex + contextSize);
    
    return tokens
      .slice(start, end)
      .map(t => t.value)
      .join(' ');
  }

  private static estimateComplexity(
    parseTree: ParseTreeNode, 
    controlFlow: ControlFlowNode,
    sourceCode: string
  ): ComplexityInfo {
    const loops = this.findLoops(parseTree);
    const conditionals = this.findConditionals(parseTree);
    const variables = this.findVariables(parseTree);
    
    // Calculate time complexity
    const timeComplexity = this.calculateTimeComplexity(loops, conditionals);
    
    // Calculate space complexity
    const spaceComplexity = this.calculateSpaceComplexity(variables, loops);
    
    // Generate optimization suggestions
    const suggestions = this.generateOptimizationSuggestions(
      timeComplexity,
      spaceComplexity,
      loops,
      conditionals,
      variables,
      sourceCode
    );

    return {
      time: {
        bigO: timeComplexity.complexity,
        factors: timeComplexity.factors
      },
      space: {
        bigO: spaceComplexity.complexity,
        details: spaceComplexity.details
      },
      suggestions
    };
  }

  private static findLoops(node: ParseTreeNode): any[] {
    const loops: any[] = [];
    
    const traverse = (n: ParseTreeNode) => {
      if (['FOR_STATEMENT', 'WHILE_STATEMENT'].includes(n.type)) {
        loops.push({
          type: n.type,
          nested: this.isNestedLoop(n),
          condition: this.extractLoopCondition(n)
        });
      }
      n.children.forEach(traverse);
    };
    
    traverse(node);
    return loops;
  }

  private static findConditionals(node: ParseTreeNode): any[] {
    const conditionals: any[] = [];
    
    const traverse = (n: ParseTreeNode) => {
      if (n.type === 'IF_STATEMENT') {
        conditionals.push({
          condition: this.extractCondition(n),
          hasElse: this.hasElseBranch(n)
        });
      }
      n.children.forEach(traverse);
    };
    
    traverse(node);
    return conditionals;
  }

  private static findVariables(node: ParseTreeNode): any[] {
    const variables: any[] = [];
    
    const traverse = (n: ParseTreeNode) => {
      if (n.type === 'STATEMENT' && n.children[0]?.type === 'KEYWORD') {
        const type = n.children[0].value;
        const name = n.children[1]?.value;
        if (name) {
          variables.push({ type, name });
        }
      }
      n.children.forEach(traverse);
    };
    
    traverse(node);
    return variables;
  }

  private static calculateTimeComplexity(loops: any[], conditionals: any[]): {
    complexity: number;
    factors: string[];
  } {
    let maxComplexity = 1; // O(1)
    const factors: string[] = [];
    
    // Analyze nested loops
    const nestedDepth = this.calculateNestedLoopDepth(loops);
    if (nestedDepth > 0) {
      maxComplexity = Math.min(nestedDepth + 2, 8); // Cap at O(n!)
      factors.push(`${nestedDepth} level(s) of nested loops`);
    }
    
    // Analyze loop conditions
    loops.forEach(loop => {
      if (this.isLogNComplexity(loop.condition)) {
        maxComplexity = Math.max(maxComplexity, 2); // O(log n)
        factors.push('Logarithmic loop condition');
      }
    });
    
    // Consider conditionals
    if (conditionals.length > 0) {
      factors.push(`${conditionals.length} conditional branches`);
    }

    return { complexity: maxComplexity, factors };
  }

  private static calculateSpaceComplexity(variables: any[], loops: any[]): {
    complexity: number;
    details: string[];
  } {
    let maxComplexity = 1; // O(1)
    const details: string[] = [];
    
    // Analyze variable allocations
    const dynamicAllocations = variables.filter(v => 
      ['array', 'vector', 'string'].includes(v.type.toLowerCase())
    );
    
    if (dynamicAllocations.length > 0) {
      maxComplexity = 2; // O(n)
      details.push(`Dynamic memory allocation for ${dynamicAllocations.length} variable(s)`);
    }
    
    // Check for recursive functions
    if (this.hasRecursion(variables)) {
      maxComplexity = Math.max(maxComplexity, 3); // O(n) for call stack
      details.push('Recursive function calls');
    }
    
    // Base memory usage
    details.push(`${variables.length} variable(s) declared`);

    return { complexity: maxComplexity, details };
  }

  private static generateOptimizationSuggestions(
    timeComplexity: { complexity: number; factors: string[] },
    spaceComplexity: { complexity: number; details: string[] },
    loops: any[],
    conditionals: any[],
    variables: any[],
    sourceCode: string
  ): { title: string; description: string }[] {
    const suggestions: { title: string; description: string }[] = [];
    
    // Time complexity suggestions
    if (timeComplexity.complexity > 4) {
      suggestions.push({
        title: 'Consider reducing nested loops',
        description: 'Multiple nested loops lead to high time complexity. Consider using more efficient data structures or algorithms.'
      });
    }
    
    // Space complexity suggestions
    if (spaceComplexity.complexity > 2) {
      suggestions.push({
        title: 'Optimize memory usage',
        description: 'Consider using memory pooling or reducing the number of dynamic allocations.'
      });
    }
    
    // Loop optimization suggestions
    loops.forEach(loop => {
      if (this.canOptimizeLoop(loop, sourceCode)) {
        suggestions.push({
          title: 'Loop optimization possible',
          description: 'Consider combining loops or using a more efficient iteration strategy.'
        });
      }
    });
    
    // Conditional optimization suggestions
    if (conditionals.length > 3) {
      suggestions.push({
        title: 'Simplify conditional logic',
        description: 'Consider using a switch statement or lookup table instead of multiple if-else statements.'
      });
    }

    return suggestions;
  }

  private static isNestedLoop(node: ParseTreeNode): boolean {
    let hasParentLoop = false;
    let current = node;
    
    while (current.parent) {
      if (['FOR_STATEMENT', 'WHILE_STATEMENT'].includes(current.parent.type)) {
        hasParentLoop = true;
        break;
      }
      current = current.parent;
    }
    
    return hasParentLoop;
  }

  private static extractLoopCondition(node: ParseTreeNode): string {
    const conditionNode = node.children.find(n => 
      n.type === 'FOR_CONDITION' || n.type === 'WHILE_CONDITION'
    );
    
    return conditionNode
      ? conditionNode.children.map(c => c.value).join(' ')
      : '';
  }

  private static extractCondition(node: ParseTreeNode): string {
    const conditionNode = node.children.find(n => n.type === 'IF_CONDITION');
    return conditionNode
      ? conditionNode.children.map(c => c.value).join(' ')
      : '';
  }

  private static hasElseBranch(node: ParseTreeNode): boolean {
    return node.children.some(n => n.type === 'ELSE_STATEMENT');
  }

  private static calculateNestedLoopDepth(loops: any[]): number {
    let maxDepth = 0;
    let currentDepth = 0;
    
    loops.forEach(loop => {
      if (loop.nested) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else {
        currentDepth = 0;
      }
    });
    
    return maxDepth;
  }

  private static isLogNComplexity(condition: string): boolean {
    // Check for patterns that suggest logarithmic complexity
    return condition.includes('/= 2') || 
           condition.includes('>>= 1') || 
           condition.includes('*= 2');
  }

  private static hasRecursion(variables: any[]): boolean {
    // Simple check for function calls that might be recursive
    return variables.some(v => 
      v.type === 'function' && 
      v.name.toLowerCase().includes('recursive')
    );
  }

  private static canOptimizeLoop(loop: any, sourceCode: string): boolean {
    // Check for common patterns that can be optimized
    return (
      loop.condition.includes('i++') || // Simple increment
      sourceCode.includes('array[i]') || // Array access
      loop.nested // Nested loops
    );
  }

  private static performLexicalAnalysis(code: string): Token[] {
    const tokens: Token[] = [];
    
    const patterns = [
      { type: 'COMMENT', pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
      { type: 'KEYWORD', pattern: /\b(int|char|float|double|void|if|else|while|for|return|printf)\b/ },
      { type: 'IDENTIFIER', pattern: /[a-zA-Z_][a-zA-Z0-9_]*/ },
      { type: 'STRING', pattern: /"[^"]*"/ },
      { type: 'NUMBER', pattern: /\b\d+(\.\d+)?(e[+-]?\d+)?\b/ },
      { type: 'OPERATOR', pattern: /[+\-*\/%=<>!&|^]=?|&&|\|\||\+\+|--/ },
      { type: 'PUNCTUATION', pattern: /[;,(){}\[\].]/ },
      { type: 'WHITESPACE', pattern: /\s+/ }
    ];
    
    let line = 1;
    let column = 1;
    let remaining = code;
    
    while (remaining.length > 0) {
      let match = null;
      let matchedType = '';
      
      for (const { type, pattern } of patterns) {
        const regex = new RegExp(`^${pattern.source}`);
        const result = regex.exec(remaining);
        
        if (result && (match === null || result[0].length > match.length)) {
          match = result[0];
          matchedType = type;
        }
      }
      
      if (match) {
        if (matchedType !== 'WHITESPACE' && matchedType !== 'COMMENT') {
          tokens.push({
            type: matchedType,
            value: match,
            line,
            column
          });
        }
        
        // Update line and column
        for (let i = 0; i < match.length; i++) {
          if (match[i] === '\n') {
            line++;
            column = 1;
          } else {
            column++;
          }
        }
        
        remaining = remaining.substring(match.length);
      } else {
        tokens.push({
          type: 'ERROR',
          value: remaining[0],
          line,
          column,
          severity: 'error',
          message: `Unexpected character: ${remaining[0]}`
        });
        
        column++;
        remaining = remaining.substring(1);
      }
    }
    
    return tokens;
  }

  private static performSyntaxAnalysis(tokens: Token[]): ParseTreeNode {
    let currentId = 0;
    const getNextId = () => `node_${currentId++}`;

    const root: ParseTreeNode = {
      id: getNextId(),
      type: 'PROGRAM',
      children: []
    };

    let i = 0;
    while (i < tokens.length) {
      if (tokens[i].type === 'KEYWORD') {
        const node: ParseTreeNode = {
          id: getNextId(),
          type: 'STATEMENT',
          children: []
        };
        
        while (i < tokens.length && tokens[i].value !== ';' && tokens[i].value !== '{') {
          node.children.push({
            id: getNextId(),
            type: tokens[i].type,
            value: tokens[i].value,
            children: []
          });
          i++;
        }

        if (i < tokens.length && tokens[i].value === '{') {
          i++;
          i = this.parseFunctionBody(tokens, i, 1, node, getNextId);
        }

        root.children.push(node);
      }
      i++;
    }

    return root;
  }

  private static performSemanticAnalysis(parseTree: ParseTreeNode, tokens: Token[]): { scopes: VariableScope[], errors: any[] } {
    const scopes: VariableScope[] = [];
    const errors: any[] = [];
    let currentScope: VariableScope = {
      id: 'global',
      variables: new Map(),
      parent: null,
      children: []
    };
    scopes.push(currentScope);

    const analyzeNode = (node: ParseTreeNode, scope: VariableScope) => {
      if (node.type === 'STATEMENT' && node.children[0]?.type === 'KEYWORD') {
        const keyword = node.children[0].value;
        if (['int', 'char', 'float', 'double'].includes(keyword)) {
          const identifier = node.children[1];
          if (identifier && identifier.type === 'IDENTIFIER') {
            scope.variables.set(identifier.value, {
              type: keyword,
              initialized: node.children.length > 3
            });
          }
        }
      }

      if (node.type === 'FOR_STATEMENT' || node.type === 'IF_STATEMENT') {
        const newScope: VariableScope = {
          id: `${scope.id}_${node.id}`,
          variables: new Map(),
          parent: scope,
          children: []
        };
        scope.children.push(newScope);
        currentScope = newScope;
        scopes.push(newScope);
      }

      node.children.forEach(child => analyzeNode(child, currentScope));
    };

    analyzeNode(parseTree, currentScope);
    return { scopes, errors };
  }

  private static analyzeControlFlow(parseTree: ParseTreeNode): ControlFlowNode {
    const createFlowNode = (node: ParseTreeNode): ControlFlowNode => {
      const flowNode: ControlFlowNode = {
        id: node.id,
        type: node.type,
        next: [],
        conditions: []
      };

      if (node.type === 'FOR_STATEMENT' || node.type === 'WHILE_STATEMENT') {
        const condition = node.children.find(child => child.type.includes('CONDITION'));
        if (condition) {
          flowNode.conditions.push({
            type: 'LOOP',
            expression: condition.children.map(t => t.value).join(' ')
          });
        }
      }

      node.children.forEach(child => {
        const childFlow = createFlowNode(child);
        flowNode.next.push(childFlow);
      });

      return flowNode;
    };

    return createFlowNode(parseTree);
  }

  private static parseFunctionBody(
    tokens: Token[], 
    startIndex: number, 
    openBraces: number,
    parentNode: ParseTreeNode,
    getNextId: () => string
  ): number {
    let i = startIndex;
    let braceCount = openBraces;
    
    while (i < tokens.length && braceCount > 0) {
      // For loop handling
      if (i < tokens.length && tokens[i].type === 'KEYWORD' && tokens[i].value === 'for') {
        const forNode: ParseTreeNode = {
          id: getNextId(),
          type: 'FOR_STATEMENT',
          children: []
        };
        
        i++;
        
        // Parse for loop components (initialization, condition, increment)
        if (i < tokens.length && tokens[i].value === '(') {
          i++;
          
          // Parse initialization
          const initNode: ParseTreeNode = {
            id: getNextId(),
            type: 'FOR_INIT',
            children: []
          };
          
          while (i < tokens.length && tokens[i].value !== ';') {
            initNode.children.push({
              id: getNextId(),
              type: tokens[i].type,
              value: tokens[i].value,
              children: []
            });
            i++;
          }
          forNode.children.push(initNode);
          i++; // Skip semicolon
          
          // Parse condition
          const condNode: ParseTreeNode = {
            id: getNextId(),
            type: 'FOR_CONDITION',
            children: []
          };
          
          while (i < tokens.length && tokens[i].value !== ';') {
            condNode.children.push({
              id: getNextId(),
              type: tokens[i].type,
              value: tokens[i].value,
              children: []
            });
            i++;
          }
          forNode.children.push(condNode);
          i++; // Skip semicolon
          
          // Parse increment
          const incrNode: ParseTreeNode = {
            id: getNextId(),
            type: 'FOR_INCREMENT',
            children: []
          };
          
          while (i < tokens.length && tokens[i].value !== ')') {
            incrNode.children.push({
              id: getNextId(),
              type: tokens[i].type,
              value: tokens[i].value,
              children: []
            });
            i++;
          }
          forNode.children.push(incrNode);
          i++; // Skip closing parenthesis
        }
        
        // Parse for loop body
        if (i < tokens.length && tokens[i].value === '{') {
          const bodyNode: ParseTreeNode = {
            id: getNextId(),
            type: 'FOR_BODY',
            children: []
          };
          
          i++;
          braceCount++;
          i = this.parseFunctionBody(tokens, i, braceCount, bodyNode, getNextId);
          
          forNode.children.push(bodyNode);
        }
        
        parentNode.children.push(forNode);
      } else {
        if (tokens[i].value === '{') {
          braceCount++;
        } else if (tokens[i].value === '}') {
          braceCount--;
        }
        i++;
      }
    }
    
    return i;
  }
}