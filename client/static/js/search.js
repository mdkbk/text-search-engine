'use strict';

// ── API endpoint — Java backend 
const API_BASE = 'https://text-search-engine-production.up.railway.app';

// ── Main entry point 
async function runSearch() {
  const corpus        = document.getElementById('corpus').value;
  const pattern       = document.getElementById('mainSearch').value.trim();
  const caseSensitive = document.getElementById('caseSensitive').checked;
  const wholeWord     = document.getElementById('wholeWord').checked;

  if (!corpus || !pattern) {
    alert('Please provide both a corpus and a pattern.');
    return;
  }

  const spinner = document.getElementById('spinner');
  spinner.classList.add('active');
  await new Promise(r => setTimeout(r, 30));

  const t0 = performance.now();
  let result;
  let usedFallback = false;

  try {
    // ── Always try Java backend first
    result = await searchViaAPI({ corpus, pattern, caseSensitive, wholeWord });
  } catch (err) {
    // ── JS fallback only if Java is unreachable 
    console.warn('Java backend unavailable — using JS fallback.', err);
    result       = searchClientSide({ corpus, pattern, caseSensitive, wholeWord });
    usedFallback = true;
  }

  const elapsed = (performance.now() - t0).toFixed(2);
  spinner.classList.remove('active');

  renderStats(result, elapsed, usedFallback);
  renderResults(corpus, pattern, result.positions);

  // Keep index in sync
  buildKeywordIndex(corpus);
}

// ── Call Java backend ─────────────────────────────
async function searchViaAPI({ corpus, pattern, caseSensitive, wholeWord }) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text:          corpus,
      pattern:       pattern,
      algorithm:     App.currentAlgo,
      caseSensitive: caseSensitive,
      wholeWord:     wholeWord,
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { positions, comparisons, shifts }
}

// ── JS fallback (keeps working if Java is down) ───
function searchClientSide({ corpus, pattern, caseSensitive, wholeWord }) {
  let text = caseSensitive ? corpus  : corpus.toLowerCase();
  let pat  = caseSensitive ? pattern : pattern.toLowerCase();

  let { positions, comparisons, shifts } = runAlgo(text, pat);

  if (wholeWord) {
    positions = positions.filter(p => {
      const before = p === 0 || /\W/.test(text[p - 1]);
      const after  = (p + pat.length >= text.length) || /\W/.test(text[p + pat.length]);
      return before && after;
    });
  }

  return { positions, comparisons, shifts };
}

// ── Render stats row 
function renderStats({ positions, comparisons, shifts }, elapsed, usedFallback) {
  document.getElementById('statsRow').style.display = 'flex';

  animateNum('statMatches',     positions.length);
  animateNum('statComparisons', comparisons);
  animateNum('statShifts',      shifts);

  document.getElementById('statTime').textContent = elapsed + 'ms';

  const algoLabel = { bm: 'BM', naive: 'Naive', kmp: 'KMP', rk: 'RK' }[App.currentAlgo] || 'BM';
  document.getElementById('statAlgo').textContent = usedFallback
    ? algoLabel + ' (JS)'   // shows JS fallback was used
    : algoLabel + ' (Java)'; // shows Java backend was used
}

// ── Render result cards
function renderResults(corpus, pattern, positions) {
  const resultsEl = document.getElementById('results');
  const CONTEXT   = 80;

  if (!positions.length) {
    resultsEl.innerHTML = `
      <div class="empty-state">
        <span class="big" style="font-size:2rem">∅</span>
        No matches found for <mark>${escHtml(pattern)}</mark>
      </div>`;
    return;
  }

  resultsEl.innerHTML = positions.map((pos, i) => {
    const start  = Math.max(0, pos - CONTEXT);
    const end    = Math.min(corpus.length, pos + pattern.length + CONTEXT);
    const before = escHtml(corpus.slice(start, pos));
    const match  = escHtml(corpus.slice(pos, pos + pattern.length));
    const after  = escHtml(corpus.slice(pos + pattern.length, end));

    return `<div class="result-item">
      <div class="result-meta">
        <span class="result-pos">pos:${pos}</span>
        <span>match ${i + 1} of ${positions.length}</span>
        <span>end:${pos + pattern.length - 1}</span>
      </div>
      <div class="result-snippet">
        ${start > 0 ? '…' : ''}${before}<mark>${match}</mark>${after}${end < corpus.length ? '…' : ''}
      </div>
    </div>`;
  }).join('');
}