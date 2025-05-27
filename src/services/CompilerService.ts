import { 
  CompilationResult, 
  Token, 
  ParseTreeNode, 
  VariableScope, 
  ControlFlowNode,
  ComplexityInfo
} from '../types/compiler';

export class CompilerService {
  // Main compilation process
  static async compile(code: string): Promise<CompilationResult> {
    // Simulate a delay to make it feel like processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Step 1: Perform lexical analysis (tokenize the code)
      const tokens = this.performLexicalAnalysis(code);
      
      // Step 2: Parse the tokens into a parse tree
      const parseTree = this.performSyntaxAnalysis(tokens);
      
      // Step 3: Perform semantic analysis
      const { scopes, errors } = this.performSemanticAnalysis(parseTree, tokens);
      
      // Step 4: Analyze control flow
      const controlFlow = this.analyzeControlFlow(parseTree);
      
      // Step 5: Estimate algorithm complexity
      const complexity = this.estimateComplexity(parseTree, controlFlow);
      
      // Return the complete compilation result
      return {
        tokens,
        parseTree,
        scopes,
        controlFlow,
        complexity,
        errors,
      };
    } catch (e) {
      console.error('Compilation error:', e);
      
      // Return a minimal result with just the error
      return {
        tokens: [],
        parseTree: null,
        scopes: [],
        controlFlow: null,
        complexity: null,
        errors: [
          {
            message: `Fatal error: ${e instanceof Error ? e.message : 'Unknown error'}`,
            line: 1,
            column: 1,
            severity: 'error'
          }
        ]
      };
    }
  }

  // Enhanced lexical analysis to handle comments
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

  private static performSemanticAnalysis(parseTree: ParseTreeNode, tokens: Token[]): { scopes: VariableScope[], errors: any[] } {
    const scopes: VariableScope[] = [];
    const errors: any[] = [];
    
    // Create global scope
    const globalScope: VariableScope = {
      name: 'Global Scope',
      start: 1,
      end: tokens[tokens.length - 1]?.line || 1,
      variables: [],
      children: []
    };
    
    scopes.push(globalScope);
    
    const analyzeNode = (node: ParseTreeNode, currentScope: VariableScope, depth: number = 0) => {
      // Track line numbers for scope boundaries
      if (node.children[0]?.line) {
        currentScope.start = Math.min(currentScope.start, node.children[0].line);
      }
      
      if (node.children[node.children.length - 1]?.line) {
        currentScope.end = Math.max(currentScope.end, node.children[node.children.length - 1].line);
      }
      
      // Handle variable declarations
      if (node.type === 'STATEMENT' && node.children[0]?.type === 'KEYWORD') {
        const keyword = node.children[0].value;
        if (['int', 'char', 'float', 'double'].includes(keyword)) {
          const identifier = node.children[1];
          if (identifier && identifier.type === 'IDENTIFIER') {
            currentScope.variables.push({
              name: identifier.value,
              type: keyword,
              line: identifier.line || 0,
              used: false,
              initialized: node.children.length > 3
            });
          }
        }
      }
      
      // Create new scope for control structures
      if (['FOR_STATEMENT', 'IF_STATEMENT', 'WHILE_STATEMENT'].includes(node.type)) {
        const newScope: VariableScope = {
          name: `${node.type} Scope`,
          start: node.children[0]?.line || currentScope.start,
          end: node.children[node.children.length - 1]?.line || currentScope.end,
          variables: [],
          children: []
        };
        
        currentScope.children.push(newScope);
        currentScope = newScope;
      }
      
      // Recursively analyze children
      node.children.forEach(child => analyzeNode(child, currentScope, depth + 1));
    };
    
    analyzeNode(parseTree, globalScope);
    
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
        const condition = node.children.find(child => 
          child.type === 'FOR_CONDITION' || child.type === 'WHILE_CONDITION'
        );
        
        if (condition) {
          flowNode.conditions.push({
            type: 'LOOP',
            expression: condition.children.map(t => t.value).join(' ')
          });
        }
      } else if (node.type === 'IF_STATEMENT') {
        const condition = node.children.find(child => child.type === 'IF_CONDITION');
        if (condition) {
          flowNode.conditions.push({
            type: 'BRANCH',
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

  private static estimateComplexity(parseTree: ParseTreeNode, controlFlow: ControlFlowNode): ComplexityInfo {
    let maxNestingDepth = 0;
    let loopCount = 0;
    let branchCount = 0;
    
    const analyzeNode = (node: ParseTreeNode, depth: number = 0) => {
      maxNestingDepth = Math.max(maxNestingDepth, depth);
      
      if (node.type === 'FOR_STATEMENT' || node.type === 'WHILE_STATEMENT') {
        loopCount++;
      } else if (node.type === 'IF_STATEMENT') {
        branchCount++;
      }
      
      node.children.forEach(child => analyzeNode(child, 
        ['FOR_STATEMENT', 'WHILE_STATEMENT'].includes(node.type) ? depth + 1 : depth
      ));
    };
    
    analyzeNode(parseTree);
    
    // Calculate time complexity
    const timeComplexity = {
      bigO: maxNestingDepth === 0 ? 1 : // O(1)
            maxNestingDepth === 1 ? 3 : // O(n)
            maxNestingDepth === 2 ? 5 : // O(n²)
            maxNestingDepth >= 3 ? 6 : 2, // O(n³) or O(log n)
      factors: []
    };
    
    // Add complexity factors
    if (loopCount > 0) {
      timeComplexity.factors.push(`Contains ${loopCount} loop(s)`);
    }
    if (maxNestingDepth > 1) {
      timeComplexity.factors.push(`Maximum nesting depth: ${maxNestingDepth}`);
    }
    if (branchCount > 0) {
      timeComplexity.factors.push(`Contains ${branchCount} conditional branch(es)`);
    }
    
    // Calculate space complexity
    const spaceComplexity = {
      bigO: maxNestingDepth === 0 ? 1 : // O(1)
            maxNestingDepth === 1 ? 2 : // O(log n)
            3, // O(n)
      details: []
    };
    
    // Add space complexity details
    spaceComplexity.details.push(`Stack depth: ${maxNestingDepth + 1}`);
    if (loopCount > 0) {
      spaceComplexity.details.push(`Loop variable(s): ${loopCount}`);
    }
    
    // Generate optimization suggestions
    const suggestions: Array<{ title: string; description: string }> = [];
    
    if (maxNestingDepth > 2) {
      suggestions.push({
        title: 'Consider reducing nested loops',
        description: 'Deep nesting can lead to performance issues. Consider restructuring the algorithm or using more efficient data structures.'
      });
    }
    
    if (branchCount > 5) {
      suggestions.push({
        title: 'Simplify conditional logic',
        description: 'Large number of conditions may indicate need for refactoring. Consider using switch statements or lookup tables.'
      });
    }
    
    return {
      time: timeComplexity,
      space: spaceComplexity,
      suggestions
    };
  }
}