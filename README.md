# MiniLang — language workbench

**Explore:** lexer/parser design, syntax trees, interpreter behavior and defensive execution limits.

![MiniLang demo](screenshot.png)

## Run this independent project

Requires Python **3.11+**. The app and tests use only Python's standard library; no pip installation, API key, or other repository is required.

```bash
git clone https://github.com/itsmexavv/minilang-workbench.git
cd minilang-workbench
python run.py
```

Open **http://127.0.0.1:8000/**. On Windows, use `py run.py` if `python` is unavailable. Stop the server with Ctrl+C.

**Run in GitHub Codespaces:** click **Code → Codespaces → Create codespace on main**, then run `python run.py` in the terminal. Open the browser notification, or the globe beside port **8000** in the **Ports** tab. Keep the port Private and stop the Codespace after testing. GitHub's file viewer and GitHub Pages do not execute this Python backend.

For separate apps on one computer, choose another port: `python run.py --port 8001`. Use `--data-dir demo-data` for a separate synthetic dataset. Programs execute in memory; no database or saved-program storage is needed.

## Portfolio materials

- [Architecture and design choices](ARCHITECTURE.md)
- [Interview walkthrough and improvement ideas](PORTFOLIO.md)
- [Security boundaries](SECURITY.md)
- A local **Demo guide** page in the app
- Independent unit and HTTP tests, plus GitHub Actions on Python 3.11, 3.12 and 3.13

## Problem and workflow

Programming language internals can be hard to see. MiniLang exposes tokens, a JSON AST and execution output for a small numeric language.

From the repository root, run `python run.py`, then open **http://127.0.0.1:8000/**.

1. Run the provided program. It prints 3, 6, 9, 12 and 70.
2. Switch between Output, Tokens and AST.
3. Try `print 2 + 3 * 4;` and inspect how the AST represents precedence.
4. Try `print 1 / 0;` to see a runtime error.
5. Remove a semicolon to see a parser error with line and column.

## Grammar

```text
program     := statement*
statement   := "let" IDENT "=" expression ";"
             | "print" expression ";"
             | "repeat" expression "{" statement* "}"
expression  := numeric expression with +, -, *, /, unary -, parentheses and variables
```

Identifiers use ASCII letters/underscore followed by letters/underscore/digits. Number literals are nonnegative integers or decimal numbers; unary minus produces negative values. `#` starts a line comment. Arithmetic follows multiplication/division before addition/subtraction, with left associativity. Variables share a single global scope; `let` assigns or reassigns. Repeat executes its body a fixed number of times, evaluated once when entered.

Example:

```text
let total = 0;
repeat 3 {
  let total = total + 2;
  print total;
}
```

## Pipeline and API

The regex lexer produces positioned tokens. The parser builds statement nodes and uses precedence climbing for arithmetic. The interpreter walks the AST with an explicit variable dictionary and output buffer. It does not call Python `eval` or `exec`.

`POST /api/minilang/run` accepts:

```json
{"source": "print 2 + 3 * 4;"}
```

The result includes `tokens`, `ast`, `output`, `variables` and `steps`. Lexing, parsing and runtime failures return 422 with a message. Lexing and parsing errors include source positions; runtime messages identify the failed rule but do not currently include positions.

## Bounds

Source: 4,000 characters. Tokens: 1,500. Repeat nesting: 20. Expression recursion: 40. Repeat count: an integer from 0 to 100. Execution budget: 10,000 counted steps. Output: 500 lines. Numeric magnitude: at most 1e12. Inputs cannot import modules or access files/network APIs.

## Verification

Run `python -m unittest discover -v`. Tests cover precedence, parentheses, left associativity, unary minus, comments, variable updates, bounded repeats, undefined variables, division by zero, missing semicolons and resource limits. Browser checks run the example and inspect the AST tab.

## Extensions to make yourself

- Add comparison tokens and expressions, including precedence tests.
- Carry source spans into AST nodes for runtime error locations.
- Add lexical scope with explicit tests for shadowing.
- Write a bytecode compiler and compare it to the tree-walk interpreter.

## Limits

This is an interpreter workbench, not a Python implementation or native compiler. No strings, functions, conditionals, input, package imports or debugging breakpoints. Decimal literals use ordinary floating-point arithmetic; this language is not intended for financial calculations.


Built with AI assistance as a learning starter. Understand the design, verify the behavior, and add your own documented improvement before presenting it in an interview.

## Optional browser verification

The app itself needs no Node.js. To run its end-to-end workflow and responsive-layout checks locally, install Node.js 22+, then:

```bash
npm install --ignore-scripts
npx playwright install chromium
npm run test:browser
```

The script starts a separate server using disposable data, then closes it. GitHub Actions also runs these checks and uploads fresh desktop/mobile screenshots as the `browser-verification` artifact.
