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

  // Enhanced parse function to handle for loops
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

  private static estimateComplexity(parseTree: ParseTreeNode, controlFlow: ControlFlowNode): ComplexityInfo {
    let cyclomaticComplexity = 1;
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    const calculateComplexity = (node: ParseTreeNode) => {
      if (node.type === 'FOR_STATEMENT' || node.type === 'WHILE_STATEMENT') {
        cyclomaticComplexity++;
        
        // Simple estimation: nested loops increase complexity
        if (timeComplexity === 'O(1)') timeComplexity = 'O(n)';
        else if (timeComplexity === 'O(n)') timeComplexity = 'O(n²)';
      }

      if (node.type === 'IF_STATEMENT') {
        cyclomaticComplexity++;
      }

      node.children.forEach(calculateComplexity);
    };

    calculateComplexity(parseTree);

    return {
      cyclomatic: cyclomaticComplexity,
      time: timeComplexity,
      space: spaceComplexity
    };
  }
}