/* No external scripts. All user-controlled text is escaped before rendering. */
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso = cents => new Intl.NumberFormat('en-PH', {style:'currency', currency:'PHP'}).format(cents/100);
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const option = (value, name) => `<option value="${esc(value)}">${esc(name)}</option>`;
const field = (label, name, type='text', extra='') => `<label class="field">${label}<input name="${name}" type="${type}" ${extra} required></label>`;
const stat = (label, value) => `<div class="stat"><span>${label}</span><strong>${esc(value)}</strong></div>`;
const empty = cols => `<tr><td class="empty" colspan="${cols}">No records yet. Add one to get started.</td></tr>`;
let toastTimer;
function toast(message, error=false) { const el=$('#toast'); el.textContent=message; el.className=error?'error':''; el.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.hidden=true,6000); }
async function api(app, path, method='GET', data) {
  const response = await fetch(`/api/${app}${path}`, {method, ...(data===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})});
  const result = await response.json();
  if(!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
function bindForm(selector, action) {
  $(selector).addEventListener('submit', async event => {
    event.preventDefault(); const form=event.currentTarget, button=form.querySelector('button[type="submit"]');
    button.disabled=true;
    try { await action(Object.fromEntries(new FormData(form)), form); } catch(error) { toast(error.message,true); }
    finally { button.disabled=false; }
  });
}
function bindAction(selector, action) {
  $(selector).addEventListener('click', async event => { const button=event.target.closest('button'); if(!button) return; button.disabled=true;
    try { await action(button); } catch(error) { toast(error.message,true); } finally { button.disabled=false; }
  });
}
function hero(number, heading, description, track) { return `<header class="hero hero-row"><div><div class="eyebrow">MiniLang / ${track}</div><h1>${heading}</h1><p>${description}</p></div><span class="badge">Interactive demo</span></header>`; }
async function minilang() {
  $('#view').innerHTML=hero('05','A small language. A clear pipeline.','Follow your source code from tokens to a syntax tree to execution, with useful errors at each step.','Language tooling')+`<div class="split"><section class="panel"><div class="toolbar"><h2>Program editor</h2><button id="example" class="secondary">Load example</button></div><form id="code-form"><label class="field" for="source">MiniLang source</label><textarea id="source" name="source" class="editor" maxlength="4000" spellcheck="false" required></textarea><div class="toolbar below"><span class="hint">let · print · repeat · arithmetic</span><button type="submit">Run program</button></div></form><p class="hint">Statements end with semicolons. Repeat uses braces. # begins a comment. Values are numeric; variables share one global scope.</p></section><section class="panel"><h2>Inspect the result</h2><div class="tabs" aria-label="Result view"><button class="secondary active" data-tab="output" aria-pressed="true">Output</button><button class="secondary" data-tab="tokens" aria-pressed="false">Tokens</button><button class="secondary" data-tab="ast" aria-pressed="false">AST</button></div><pre id="result" class="code-output" aria-live="polite">Run a program to see its output.</pre><div id="execution" class="hint"></div></section></div><div class="notice below">Execution stays within the interpreter. Programs have no file, network or Python access. Loops and output are bounded.</div>`;
  const example='# A simple running total\nlet total = 0;\nlet step = 3;\nrepeat 4 {\n  let total = total + step;\n  print total;\n}\nprint (total + 2) * 5;';
  $('#source').value=example; let result=null, tab='output';
  function render() { if(!result) return; $('#result').textContent=tab==='output'?(result.output.join('\n')||'(No output)'):JSON.stringify(result[tab],null,2); }
  $('#example').addEventListener('click',()=>{$('#source').value=example;});
  bindAction('.tabs',async b=>{ tab=b.dataset.tab; document.querySelectorAll('.tabs button').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',String(el===b));}); render(); });
  bindForm('#code-form',async d=>{ result=null; $('#execution').textContent=''; try { result=await api('minilang','/run','POST',d); render(); $('#execution').textContent=`${result.tokens.length} tokens · ${result.steps} execution steps · Variables: ${JSON.stringify(result.variables)}`; } catch(e) { $('#result').textContent=e.message; throw e; } });
}
Promise.resolve().then(()=>minilang()).catch(error=>{toast(error.message,true); console.error(error);});
