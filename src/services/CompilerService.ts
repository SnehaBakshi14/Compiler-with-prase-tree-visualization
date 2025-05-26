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
        // Handle other statements as before...
        i++;
      }
    }
    
    return i;
  }

  // All other methods from the original file remain unchanged...
  [... All other methods from the original file ...]
}