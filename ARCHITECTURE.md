# MiniLang architecture

Browser (index.html + app.js) → same-origin HTTP API (run.py) → domain rules (app.py) → lexer → parser → bounded interpreter.

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| run.py | Loopback server, exact Codespaces host/origin checks, JSON validation, safe static allowlist and HTTP error mapping |
| app.py | Language workbench rules and API dispatch |
| core.py | Explicit API errors, input validation |
| app.js | Forms, fetch calls, escaped output, success/error feedback |
| index.html / style.css | Keyboard-accessible shell and responsive dashboard |
| test_business.py / test_http.py | Isolated domain tests and actual HTTP boundary checks |

## Data flow

A form sends JSON to `/api/minilang/…`. The server validates the request shape before calling the domain handler. Domain errors become explicit HTTP responses. The interface refreshes from saved state after successful changes, rather than guessing the result. `/api/health` confirms the running project's identity.

## Main design decision

Read README.md's data model and design choice sections. Trace one successful operation and one rejected operation through the frontend, API, and domain code. This repository includes the helper code it needs; it never imports graduate-portfolio or the other four projects.

## Runtime limits

Execution uses its own AST visitor, not eval or exec. The language has hard limits on source size, nesting, numeric magnitude, output, and execution steps. The browser is a workbench, not a general Python execution service.
