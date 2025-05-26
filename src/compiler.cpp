#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <unordered_map>

// Token structure
struct Token {
    std::string type;
    std::string value;
    int line;
    int column;
};

// AST Node structure
struct ASTNode {
    std::string type;
    std::string value;
    std::vector<std::shared_ptr<ASTNode>> children;
};

// Lexer class for tokenization
class Lexer {
private:
    std::string input;
    size_t position;
    int line;
    int column;

    struct Pattern {
        std::string type;
        std::string regex;
    };

    std::vector<Pattern> patterns = {
        {"KEYWORD", "int|char|float|double|void|if|else|while|for|return|printf"},
        {"IDENTIFIER", "[a-zA-Z_][a-zA-Z0-9_]*"},
        {"NUMBER", "\\d+(\\.\\d+)?"},
        {"OPERATOR", "[+\\-*/%=<>!]"},
        {"PUNCTUATION", "[;,(){}\\[\\]]"},
        {"WHITESPACE", "[ \\t\\n\\r]+"}
    };

public:
    Lexer(const std::string& source) : input(source), position(0), line(1), column(1) {}

    std::vector<Token> tokenize() {
        std::vector<Token> tokens;
        
        while (position < input.length()) {
            char current = input[position];
            
            // Handle whitespace
            if (isspace(current)) {
                if (current == '\n') {
                    line++;
                    column = 1;
                } else {
                    column++;
                }
                position++;
                continue;
            }

            // Handle identifiers and keywords
            if (isalpha(current) || current == '_') {
                std::string identifier;
                int start_column = column;
                
                while (position < input.length() && 
                       (isalnum(input[position]) || input[position] == '_')) {
                    identifier += input[position];
                    position++;
                    column++;
                }

                // Check if it's a keyword
                if (isKeyword(identifier)) {
                    tokens.push_back({"KEYWORD", identifier, line, start_column});
                } else {
                    tokens.push_back({"IDENTIFIER", identifier, line, start_column});
                }
                continue;
            }

            // Handle numbers
            if (isdigit(current)) {
                std::string number;
                int start_column = column;
                
                while (position < input.length() && 
                       (isdigit(input[position]) || input[position] == '.')) {
                    number += input[position];
                    position++;
                    column++;
                }
                
                tokens.push_back({"NUMBER", number, line, start_column});
                continue;
            }

            // Handle operators and punctuation
            std::string op_punct(1, current);
            tokens.push_back({
                ispunct(current) ? "PUNCTUATION" : "OPERATOR",
                op_punct,
                line,
                column
            });
            position++;
            column++;
        }

        return tokens;
    }

private:
    bool isKeyword(const std::string& word) {
        static const std::unordered_map<std::string, bool> keywords = {
            {"int", true}, {"char", true}, {"float", true},
            {"double", true}, {"void", true}, {"if", true},
            {"else", true}, {"while", true}, {"for", true},
            {"return", true}, {"printf", true}
        };
        return keywords.find(word) != keywords.end();
    }
};

// Parser class for building AST
class Parser {
private:
    std::vector<Token> tokens;
    size_t current;

public:
    Parser(const std::vector<Token>& tokens) : tokens(tokens), current(0) {}

    std::shared_ptr<ASTNode> parse() {
        auto root = std::make_shared<ASTNode>();
        root->type = "PROGRAM";

        while (current < tokens.size()) {
            auto node = parseDeclaration();
            if (node) {
                root->children.push_back(node);
            }
        }

        return root;
    }

private:
    std::shared_ptr<ASTNode> parseDeclaration() {
        // Parse function or variable declaration
        if (current >= tokens.size() || tokens[current].type != "KEYWORD") {
            return nullptr;
        }

        auto type = tokens[current++].value;
        
        if (current >= tokens.size() || tokens[current].type != "IDENTIFIER") {
            return nullptr;
        }

        auto name = tokens[current++].value;

        // Function declaration
        if (current < tokens.size() && tokens[current].value == "(") {
            auto funcNode = std::make_shared<ASTNode>();
            funcNode->type = "FUNCTION_DECLARATION";
            funcNode->value = name;

            // Skip opening parenthesis
            current++;

            // Parse parameters
            while (current < tokens.size() && tokens[current].value != ")") {
                // Parameter parsing logic here
                current++;
            }

            // Skip closing parenthesis
            if (current < tokens.size() && tokens[current].value == ")") {
                current++;
            }

            // Parse function body
            if (current < tokens.size() && tokens[current].value == "{") {
                current++;
                funcNode->children.push_back(parseBlock());
            }

            return funcNode;
        }

        return nullptr;
    }

    std::shared_ptr<ASTNode> parseBlock() {
        auto block = std::make_shared<ASTNode>();
        block->type = "BLOCK";

        while (current < tokens.size() && tokens[current].value != "}") {
            auto statement = parseStatement();
            if (statement) {
                block->children.push_back(statement);
            }
        }

        // Skip closing brace
        if (current < tokens.size() && tokens[current].value == "}") {
            current++;
        }

        return block;
    }

    std::shared_ptr<ASTNode> parseStatement() {
        if (current >= tokens.size()) {
            return nullptr;
        }

        // Parse different types of statements
        if (tokens[current].type == "KEYWORD") {
            if (tokens[current].value == "if") {
                return parseIfStatement();
            }
            if (tokens[current].value == "return") {
                return parseReturnStatement();
            }
        }

        // Parse expression statement
        auto stmt = parseExpressionStatement();
        if (current < tokens.size() && tokens[current].value == ";") {
            current++;
        }
        return stmt;
    }

    // Add other parsing methods as needed...
};

int main() {
    // Example usage
    std::string source = R"(
        int main() {
            int x = 10;
            if (x > 5) {
                printf("x is greater than 5\n");
            }
            return 0;
        }
    )";

    // Create lexer and tokenize
    Lexer lexer(source);
    auto tokens = lexer.tokenize();

    // Print tokens
    std::cout << "Tokens:\n";
    for (const auto& token : tokens) {
        std::cout << "Type: " << token.type 
                  << ", Value: " << token.value 
                  << ", Line: " << token.line 
                  << ", Column: " << token.column << "\n";
    }

    // Create parser and generate AST
    Parser parser(tokens);
    auto ast = parser.parse();

    return 0;
}