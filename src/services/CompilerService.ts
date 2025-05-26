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
  
  // Lexical Analysis
  private static performLexicalAnalysis(code: string): Token[] {
    const tokens: Token[] = [];
    
    // Define token patterns using regular expressions
    const patterns = [
      { type: 'KEYWORD', pattern: /\b(int|char|float|double|void|if|else|while|for|return|printf)\b/ },
      { type: 'IDENTIFIER', pattern: /[a-zA-Z_][a-zA-Z0-9_]*/ },
      { type: 'STRING', pattern: /"[^"]*"/ },
      { type: 'NUMBER', pattern: /\b\d+(\.\d+)?(e[+-]?\d+)?\b/ },
      { type: 'OPERATOR', pattern: /[+\-*\/%=<>!&|^]=?|&&|\|\||\+\+|--/ },
      { type: 'PUNCTUATION', pattern: /[;,(){}\[\].]/ },
      { type: 'WHITESPACE', pattern: /\s+/ }
    ];
    
    // Keep track of line and column
    let line = 1;
    let column = 1;
    let remaining = code;
    
    // Tokenize until the entire string is processed
    while (remaining.length > 0) {
      let match = null;
      let matchedType = '';
      
      // Try to match each pattern
      for (const { type, pattern } of patterns) {
        const regex = new RegExp(`^${pattern.source}`);
        const result = regex.exec(remaining);
        
        if (result && (match === null || result[0].length > match.length)) {
          match = result[0];
          matchedType = type;
        }
      }
      
      // If we found a match
      if (match) {
        // Only add non-whitespace tokens to the result
        if (matchedType !== 'WHITESPACE') {
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
        
        // Move forward in the string
        remaining = remaining.substring(match.length);
      } else {
        // If no pattern matches, we have an error
        // Just skip the current character and continue
        tokens.push({
          type: 'ERROR',
          value: remaining[0],
          line,
          column
        });
        
        column++;
        remaining = remaining.substring(1);
      }
    }
    
    return tokens;
  }
  
  // Syntax Analysis
  private static performSyntaxAnalysis(tokens: Token[]): ParseTreeNode {
    // For this simulation, we'll create a simplified parse tree
    // In a real compiler, this would be more complex using a proper parser
    
    let nodeId = 0;
    const getNextId = () => `node_${nodeId++}`;
    
    // Create the root program node
    const rootNode: ParseTreeNode = {
      id: getNextId(),
      type: 'PROGRAM',
      children: []
    };
    
    // Find all function declarations
    let i = 0;
    
    while (i < tokens.length) {
      // Look for potential function declarations
      if (
        i + 3 < tokens.length &&
        (tokens[i].type === 'KEYWORD' && ['int', 'void', 'char', 'float', 'double'].includes(tokens[i].value)) &&
        tokens[i+1].type === 'IDENTIFIER' &&
        tokens[i+2].type === 'PUNCTUATION' && tokens[i+2].value === '('
      ) {
        // We found a function declaration
        const functionNode: ParseTreeNode = {
          id: getNextId(),
          type: 'FUNCTION_DECLARATION',
          children: [
            {
              id: getNextId(),
              type: 'TYPE',
              value: tokens[i].value,
              children: []
            },
            {
              id: getNextId(),
              type: 'IDENTIFIER',
              value: tokens[i+1].value,
              children: []
            }
          ]
        };
        
        // Skip past the function name
        i += 3;
        
        // Parse parameters
        const paramsNode: ParseTreeNode = {
          id: getNextId(),
          type: 'PARAMETERS',
          children: []
        };
        
        // Simplified parameter parsing
        while (i < tokens.length && tokens[i].value !== ')') {
          if (tokens[i].type === 'KEYWORD' && ['int', 'void', 'char', 'float', 'double'].includes(tokens[i].value) &&
              i + 1 < tokens.length && tokens[i+1].type === 'IDENTIFIER') {
            
            paramsNode.children.push({
              id: getNextId(),
              type: 'PARAMETER',
              children: [
                {
                  id: getNextId(),
                  type: 'TYPE',
                  value: tokens[i].value,
                  children: []
                },
                {
                  id: getNextId(),
                  type: 'IDENTIFIER',
                  value: tokens[i+1].value,
                  children: []
                }
              ]
            });
            
            i += 2;
            
            // Skip comma if present
            if (i < tokens.length && tokens[i].value === ',') {
              i++;
            }
          } else {
            i++;
          }
        }
        
        functionNode.children.push(paramsNode);
        
        // Skip the closing parenthesis
        if (i < tokens.length && tokens[i].value === ')') {
          i++;
        }
        
        // Look for function body starting with '{'
        if (i < tokens.length && tokens[i].value === '{') {
          const bodyNode: ParseTreeNode = {
            id: getNextId(),
            type: 'FUNCTION_BODY',
            children: []
          };
          
          i++;
          const openBraces = 1;
          this.parseFunctionBody(tokens, i, openBraces, bodyNode, getNextId);
          
          // Find where the function body ends
          let braceCount = 1;
          const startPos = i;
          
          while (i < tokens.length && braceCount > 0) {
            if (tokens[i].value === '{') braceCount++;
            if (tokens[i].value === '}') braceCount--;
            i++;
          }
          
          functionNode.children.push(bodyNode);
        }
        
        rootNode.children.push(functionNode);
      } else {
        i++;
      }
    }
    
    return rootNode;
  }
  
  // Helper method to parse function body
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
      // Variable declaration
      if (
        i + 2 < tokens.length &&
        tokens[i].type === 'KEYWORD' && ['int', 'char', 'float', 'double'].includes(tokens[i].value) &&
        tokens[i+1].type === 'IDENTIFIER'
      ) {
        const declNode: ParseTreeNode = {
          id: getNextId(),
          type: 'VARIABLE_DECLARATION',
          children: [
            {
              id: getNextId(),
              type: 'TYPE',
              value: tokens[i].value,
              children: []
            },
            {
              id: getNextId(),
              type: 'IDENTIFIER',
              value: tokens[i+1].value,
              children: []
            }
          ]
        };
        
        i += 2;
        
        // Check for initialization
        if (i < tokens.length && tokens[i].value === '=') {
          i++;
          const valueNode = this.parseExpression(tokens, i, getNextId);
          declNode.children.push(valueNode.node);
          i = valueNode.newIndex;
        }
        
        // Skip past semicolon
        if (i < tokens.length && tokens[i].value === ';') {
          i++;
        }
        
        parentNode.children.push(declNode);
      }
      // If statement
      else if (i < tokens.length && tokens[i].type === 'KEYWORD' && tokens[i].value === 'if') {
        const ifNode: ParseTreeNode = {
          id: getNextId(),
          type: 'IF_STATEMENT',
          children: []
        };
        
        i++;
        
        // Parse condition inside parentheses
        if (i < tokens.length && tokens[i].value === '(') {
          i++;
          const conditionNode: ParseTreeNode = {
            id: getNextId(),
            type: 'CONDITION',
            children: []
          };
          
          const parenCount = 1;
          while (i < tokens.length && parenCount > 0) {
            if (tokens[i].value === '(') braceCount++;
            if (tokens[i].value === ')') braceCount--;
            
            if (parenCount > 0) {
              conditionNode.children.push({
                id: getNextId(),
                type: tokens[i].type,
                value: tokens[i].value,
                children: []
              });
            }
            i++;
          }
          
          ifNode.children.push(conditionNode);
        }
        
        // Parse the if body
        if (i < tokens.length && tokens[i].value === '{') {
          const ifBodyNode: ParseTreeNode = {
            id: getNextId(),
            type: 'IF_BODY',
            children: []
          };
          
          i++;
          braceCount++;
          i = this.parseFunctionBody(tokens, i, braceCount, ifBodyNode, getNextId);
          
          ifNode.children.push(ifBodyNode);
        }
        
        // Parse potential else clause
        if (i + 1 < tokens.length && tokens[i].type === 'KEYWORD' && tokens[i].value === 'else') {
          const elseNode: ParseTreeNode = {
            id: getNextId(),
            type: 'ELSE',
            children: []
          };
          
          i++;
          
          if (i < tokens.length && tokens[i].value === '{') {
            i++;
            braceCount++;
            i = this.parseFunctionBody(tokens, i, braceCount, elseNode, getNextId);
          }
          
          ifNode.children.push(elseNode);
        }
        
        parentNode.children.push(ifNode);
      }
      // Function call
      else if (
        i + 2 < tokens.length && 
        tokens[i].type === 'IDENTIFIER' && 
        tokens[i+1].value === '('
      ) {
        const callNode: ParseTreeNode = {
          id: getNextId(),
          type: 'FUNCTION_CALL',
          children: [
            {
              id: getNextId(),
              type: 'IDENTIFIER',
              value: tokens[i].value,
              children: []
            }
          ]
        };
        
        i += 2;
        
        // Parse arguments
        const argsNode: ParseTreeNode = {
          id: getNextId(),
          type: 'ARGUMENTS',
          children: []
        };
        
        // Simple argument parsing
        while (i < tokens.length && tokens[i].value !== ')') {
          if (tokens[i].type === 'STRING' || tokens[i].type === 'NUMBER' || tokens[i].type === 'IDENTIFIER') {
            argsNode.children.push({
              id: getNextId(),
              type: tokens[i].type,
              value: tokens[i].value,
              children: []
            });
            
            i++;
            
            // Skip comma if present
            if (i < tokens.length && tokens[i].value === ',') {
              i++;
            }
          } else {
            i++;
          }
        }
        
        callNode.children.push(argsNode);
        
        // Skip the closing parenthesis
        if (i < tokens.length && tokens[i].value === ')') {
          i++;
        }
        
        // Skip semicolon
        if (i < tokens.length && tokens[i].value === ';') {
          i++;
        }
        
        parentNode.children.push(callNode);
      }
      // Return statement
      else if (i < tokens.length && tokens[i].type === 'KEYWORD' && tokens[i].value === 'return') {
        const returnNode: ParseTreeNode = {
          id: getNextId(),
          type: 'RETURN',
          children: []
        };
        
        i++;
        
        // Parse return value
        if (i < tokens.length && tokens[i].value !== ';') {
          const valueNode = this.parseExpression(tokens, i, getNextId);
          returnNode.children.push(valueNode.node);
          i = valueNode.newIndex;
        }
        
        // Skip semicolon
        if (i < tokens.length && tokens[i].value === ';') {
          i++;
        }
        
        parentNode.children.push(returnNode);
      }
      // Just track braces
      else if (i < tokens.length && tokens[i].value === '{') {
        braceCount++;
        i++;
      }
      else if (i < tokens.length && tokens[i].value === '}') {
        braceCount--;
        i++;
      }
      else {
        i++;
      }
    }
    
    return i;
  }
  
  // Helper to parse an expression
  private static parseExpression(
    tokens: Token[], 
    startIndex: number,
    getNextId: () => string
  ): { node: ParseTreeNode, newIndex: number } {
    let i = startIndex;
    
    const exprNode: ParseTreeNode = {
      id: getNextId(),
      type: 'EXPRESSION',
      children: []
    };
    
    while (i < tokens.length && tokens[i].value !== ';' && tokens[i].value !== ')' && tokens[i].value !== ',') {
      exprNode.children.push({
        id: getNextId(),
        type: tokens[i].type,
        value: tokens[i].value,
        children: []
      });
      
      i++;
    }
    
    return { node: exprNode, newIndex: i };
  }
  
  // Semantic Analysis
  private static performSemanticAnalysis(parseTree: ParseTreeNode, tokens: Token[]): { 
    scopes: VariableScope[],
    errors: any[]
  } {
    const scopes: VariableScope[] = [];
    const errors: any[] = [];
    
    // Find all function declarations in the parse tree
    parseTree.children.forEach((functionNode, functionIndex) => {
      if (functionNode.type === 'FUNCTION_DECLARATION') {
        const functionName = functionNode.children[1].value || `function_${functionIndex}`;
        
        // Create a scope for this function
        const functionScope: VariableScope = {
          name: functionName,
          start: 1, // placeholder
          end: tokens.length, // placeholder
          variables: [],
          children: []
        };
        
        // Find the function body to analyze
        const bodyNode = functionNode.children.find(child => child.type === 'FUNCTION_BODY');
        
        if (bodyNode) {
          // Find variable declarations in the function body
          this.findVariablesInScope(bodyNode, functionScope);
          
          // Find and analyze nested scopes (if, while, for blocks)
          this.findNestedScopes(bodyNode, functionScope);
        }
        
        // Add the function scope to our list
        scopes.push(functionScope);
      }
    });
    
    // Find any unused variables across all scopes
    this.checkForUnusedVariables(scopes, errors);
    
    // This is a very simplified semantic analysis
    // In a real compiler, we would do much more:
    // - Type checking
    // - Undefined variable references
    // - Function signature validation
    // - etc.
    
    return { scopes, errors };
  }
  
  // Helper to find all variables in a scope
  private static findVariablesInScope(node: ParseTreeNode, scope: VariableScope): void {
    if (node.type === 'VARIABLE_DECLARATION') {
      const typeNode = node.children.find(child => child.type === 'TYPE');
      const identifierNode = node.children.find(child => child.type === 'IDENTIFIER');
      
      if (typeNode && identifierNode) {
        // We found a variable declaration
        scope.variables.push({
          name: identifierNode.value || 'unknown',
          type: typeNode.value || 'unknown',
          line: 0, // In a real implementation, we would have line information
          used: false // We'll determine usage in a separate pass
        });
      }
    }
    
    // Recursively process children
    node.children.forEach(child => {
      this.findVariablesInScope(child, scope);
    });
  }
  
  // Helper to find nested scopes
  private static findNestedScopes(node: ParseTreeNode, parentScope: VariableScope): void {
    if (node.type === 'IF_BODY' || node.type === 'ELSE' || node.type.includes('LOOP_BODY')) {
      // Create a new scope for this block
      const childScope: VariableScope = {
        name: node.type,
        start: 0, // placeholder
        end: 0,   // placeholder
        variables: [],
        children: []
      };
      
      // Find variables in this scope
      this.findVariablesInScope(node, childScope);
      
      // Find any further nested scopes
      node.children.forEach(child => {
        this.findNestedScopes(child, childScope);
      });
      
      // Add this scope as a child of the parent
      parentScope.children.push(childScope);
    } else {
      // Recursively process all children
      node.children.forEach(child => {
        this.findNestedScopes(child, parentScope);
      });
    }
  }
  
  // Helper to check for unused variables
  private static checkForUnusedVariables(scopes: VariableScope[], errors: any[]): void {
    const checkScope = (scope: VariableScope) => {
      scope.variables.forEach(variable => {
        if (!variable.used && variable.name !== 'unused') {
          errors.push({
            message: `Warning: Variable '${variable.name}' is declared but never used`,
            line: variable.line,
            column: 0,
            severity: 'warning',
            context: `${variable.type} ${variable.name};`,
            suggestions: [`Remove the unused variable declaration`, `Use the variable in your code`]
          });
        }
      });
      
      // Check child scopes
      scope.children.forEach(childScope => {
        checkScope(childScope);
      });
    };
    
    scopes.forEach(scope => {
      checkScope(scope);
    });
  }
  
  // Control Flow Analysis
  private static analyzeControlFlow(parseTree: ParseTreeNode): ControlFlowNode | null {
    // Find the main function
    const mainFunction = parseTree.children.find(node => 
      node.type === 'FUNCTION_DECLARATION' && 
      node.children.some(child => child.type === 'IDENTIFIER' && child.value === 'main')
    );
    
    if (!mainFunction) {
      return null;
    }
    
    // Create the entry node
    const entryNode: ControlFlowNode = {
      id: 'entry',
      type: 'ENTRY',
      children: []
    };
    
    // Find the function body
    const bodyNode = mainFunction.children.find(child => child.type === 'FUNCTION_BODY');
    
    if (bodyNode) {
      // Process the function body to build the control flow graph
      const cfgNodes = this.buildControlFlowGraph(bodyNode);
      
      if (cfgNodes.length > 0) {
        entryNode.children = [cfgNodes[0]];
      }
    }
    
    // Add an exit node
    const exitNode: ControlFlowNode = {
      id: 'exit',
      type: 'EXIT',
      children: []
    };
    
    // Find the last node and connect it to the exit node
    const findLastNode = (node: ControlFlowNode): ControlFlowNode => {
      if (node.children.length === 0) {
        return node;
      }
      return findLastNode(node.children[node.children.length - 1]);
    };
    
    if (entryNode.children.length > 0) {
      const lastNode = findLastNode(entryNode.children[0]);
      lastNode.children.push(exitNode);
    } else {
      entryNode.children.push(exitNode);
    }
    
    return entryNode;
  }
  
  // Helper to build a control flow graph
  private static buildControlFlowGraph(node: ParseTreeNode): ControlFlowNode[] {
    const nodes: ControlFlowNode[] = [];
    
    // Process each child node
    node.children.forEach(child => {
      if (child.type === 'IF_STATEMENT') {
        // Create an IF node
        const ifNode: ControlFlowNode = {
          id: `if_${child.id}`,
          type: 'IF',
          condition: this.getConditionString(child),
          children: []
        };
        
        // Find the true branch (if body)
        const ifBody = child.children.find(n => n.type === 'IF_BODY');
        if (ifBody) {
          const trueNodes = this.buildControlFlowGraph(ifBody);
          if (trueNodes.length > 0) {
            ifNode.children.push(trueNodes[0]);
          }
        }
        
        // Find the false branch (else body)
        const elseBody = child.children.find(n => n.type === 'ELSE');
        if (elseBody) {
          const falseNodes = this.buildControlFlowGraph(elseBody);
          if (falseNodes.length > 0) {
            ifNode.children.push(falseNodes[0]);
          }
        }
        
        nodes.push(ifNode);
      }
      else if (child.type === 'FUNCTION_CALL') {
        // Create a call node
        const callNode: ControlFlowNode = {
          id: `call_${child.id}`,
          type: 'CALL',
          children: []
        };
        
        nodes.push(callNode);
      }
      else if (child.type === 'RETURN') {
        // Create a return node
        const returnNode: ControlFlowNode = {
          id: `return_${child.id}`,
          type: 'RETURN',
          children: []
        };
        
        nodes.push(returnNode);
      }
      else if (child.type === 'VARIABLE_DECLARATION') {
        // Create a statement node for variable declaration
        const declNode: ControlFlowNode = {
          id: `decl_${child.id}`,
          type: 'STATEMENT',
          children: []
        };
        
        nodes.push(declNode);
      }
      // Add more control structures as needed (while, for, etc.)
      
      // Recursively process children that might contain control structures
      if (child.children && child.children.length > 0 && 
          child.type !== 'IF_BODY' && child.type !== 'ELSE') {
        const childNodes = this.buildControlFlowGraph(child);
        nodes.push(...childNodes);
      }
    });
    
    // Connect nodes sequentially
    for (let i = 0; i < nodes.length - 1; i++) {
      // Only connect if this node doesn't already have children 
      // (meaning it's not a control structure with dedicated exits)
      if (nodes[i].type !== 'IF' && nodes[i].type !== 'RETURN') {
        nodes[i].children.push(nodes[i + 1]);
      }
    }
    
    return nodes;
  }
  
  // Helper to extract the condition string from an if statement
  private static getConditionString(ifNode: ParseTreeNode): string {
    const conditionNode = ifNode.children.find(child => child.type === 'CONDITION');
    if (conditionNode && conditionNode.children.length > 0) {
      return conditionNode.children.map(token => token.value).join(' ');
    }
    return '';
  }
  
  // Complexity Analysis
  private static estimateComplexity(parseTree: ParseTreeNode, controlFlow: ControlFlowNode | null): ComplexityInfo | null {
    // This is a very simplified complexity analysis
    // In a real implementation, we would do a much more thorough analysis
    
    // If we don't have a parse tree or control flow, we can't analyze complexity
    if (!parseTree || !controlFlow) {
      return null;
    }
    
    // Default complexity values
    let timeComplexity = 1;  // O(1)
    let spaceComplexity = 1; // O(1)
    
    // Look for loops in the parse tree - they increase time complexity
    const hasNestedLoops = this.hasNestedLoops(parseTree);
    const loopCount = this.countLoops(parseTree);
    
    if (hasNestedLoops) {
      timeComplexity = 5; // O(n²) for nested loops
    } else if (loopCount > 0) {
      timeComplexity = 3; // O(n) for single loops
    }
    
    // Count variable declarations for space complexity
    const varCount = this.countVariables(parseTree);
    
    // If there are arrays or we're allocating memory based on input
    const hasArrays = this.hasArrays(parseTree);
    
    if (hasArrays) {
      spaceComplexity = 3; // O(n) for arrays
    } else if (varCount > 10) {
      spaceComplexity = 2; // O(log n) as an approximation for many variables
    }
    
    // Generate factors that contribute to the complexity
    const timeFactors = [];
    if (loopCount > 0) {
      timeFactors.push(`${loopCount} loop(s) in the code`);
    }
    if (hasNestedLoops) {
      timeFactors.push('Nested loops detected');
    }
    if (this.countFunctionCalls(parseTree) > 0) {
      timeFactors.push('Function calls may contribute to runtime');
    }
    
    // Generate space complexity details
    const spaceDetails = [];
    spaceDetails.push(`${varCount} variable(s) declared`);
    if (hasArrays) {
      spaceDetails.push('Arrays or dynamic data structures detected');
    }
    
    // Generate optimization suggestions
    const suggestions = [];
    
    if (hasNestedLoops) {
      suggestions.push({
        title: 'Consider optimizing nested loops',
        description: 'Nested loops lead to O(n²) time complexity. Look for ways to combine or eliminate loops.'
      });
    }
    
    if (this.hasUnusedVariables(parseTree)) {
      suggestions.push({
        title: 'Remove unused variables',
        description: 'Unused variables consume memory unnecessarily. Consider removing them to optimize space usage.'
      });
    }
    
    return {
      time: {
        bigO: timeComplexity,
        factors: timeFactors
      },
      space: {
        bigO: spaceComplexity,
        details: spaceDetails
      },
      suggestions
    };
  }
  
  // Helper to check for nested loops
  private static hasNestedLoops(node: ParseTreeNode): boolean {
    let foundLoop = false;
    
    const checkNode = (n: ParseTreeNode, inLoop: boolean): boolean => {
      // Check if this node is a loop
      const isLoop = n.type === 'FOR_STATEMENT' || n.type === 'WHILE_STATEMENT';
      
      // If we're already in a loop and find another, we have nesting
      if (inLoop && isLoop) {
        return true;
      }
      
      // Check children
      for (const child of n.children) {
        if (checkNode(child, inLoop || isLoop)) {
          return true;
        }
      }
      
      return false;
    };
    
    return checkNode(node, false);
  }
  
  // Helper to count loops
  private static countLoops(node: ParseTreeNode): number {
    let count = 0;
    
    const checkNode = (n: ParseTreeNode) => {
      if (n.type === 'FOR_STATEMENT' || n.type === 'WHILE_STATEMENT') {
        count++;
      }
      
      n.children.forEach(child => {
        checkNode(child);
      });
    };
    
    checkNode(node);
    return count;
  }
  
  // Helper to count variables
  private static countVariables(node: ParseTreeNode): number {
    let count = 0;
    
    const checkNode = (n: ParseTreeNode) => {
      if (n.type === 'VARIABLE_DECLARATION') {
        count++;
      }
      
      n.children.forEach(child => {
        checkNode(child);
      });
    };
    
    checkNode(node);
    return count;
  }
  
  // Helper to check for arrays
  private static hasArrays(node: ParseTreeNode): boolean {
    let found = false;
    
    const checkNode = (n: ParseTreeNode): boolean => {
      // Very simplified check - look for square brackets in variable declarations
      if (n.type === 'VARIABLE_DECLARATION') {
        const typeName = n.children.find(child => child.type === 'TYPE')?.value || '';
        if (typeName.includes('[') || typeName.includes(']')) {
          return true;
        }
      }
      
      // Check children
      for (const child of n.children) {
        if (checkNode(child)) {
          return true;
        }
      }
      
      return false;
    };
    
    return checkNode(node);
  }
  
  // Helper to count function calls
  private static countFunctionCalls(node: ParseTreeNode): number {
    let count = 0;
    
    const checkNode = (n: ParseTreeNode) => {
      if (n.type === 'FUNCTION_CALL') {
        count++;
      }
      
      n.children.forEach(child => {
        checkNode(child);
      });
    };
    
    checkNode(node);
    return count;
  }
  
  // Helper to check for unused variables
  private static hasUnusedVariables(node: ParseTreeNode): boolean {
    // This would need to cross-reference declarations with usages
    // For this simulation, we'll just return false
    return false;
  }
}