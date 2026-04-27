/* 
   Boyer-Moore step visualizer
*/

   'use strict';

   // ── Module state 
   let vizSteps = [];
   let vizIdx   = 0;
   let vizTimer = null;
   
   // ── Initialise visualizer 
   function initViz() {
     const text    = document.getElementById('vizText').value;
     const pattern = document.getElementById('vizPattern').value;
     if (!text || !pattern) return;
   
     vizSteps = buildBMSteps(text, pattern);
     vizIdx   = 0;
   
     document.getElementById('vizWrap').style.display = 'block';
     renderVizStep();
   }
   
   // ── Build step trace 
   function buildBMSteps(text, pattern) {
     const n       = text.length;
     const m       = pattern.length;
     const badChar = buildBadChar(pattern);
     const steps   = [];
     let s = 0;
   
     while (s <= n - m) {
       let j = m - 1;
       const comparisonsThisShift = [];
   
       while (j >= 0) {
         comparisonsThisShift.push({
           textIdx: s + j,
           patIdx:  j,
           match:   text[s + j] === pattern[j],
         });
         if (text[s + j] !== pattern[j]) break;
         j--;
       }
   
       const matched = j < 0;
       steps.push({ s, m, n, text, pattern, comparisons: comparisonsThisShift, matched });
   
       if (matched) {
         s += (s + m < n) ? m - (badChar[text[s + m]] ?? -1) : 1;
       } else {
         s += Math.max(1, j - (badChar[text[s + j]] ?? -1));
       }
     }
   
     return steps;
   }
   
   // ── Render current step 
   function renderVizStep() {
     if (!vizSteps.length) return;
   
     const step = vizSteps[Math.min(vizIdx, vizSteps.length - 1)];
     const { s, m, text, pattern, comparisons, matched } = step;
   
     // Step label
     document.getElementById('vizStepLabel').textContent =
       `Step ${vizIdx + 1} / ${vizSteps.length}`;
   
     // Counter badge
     const lastComp = comparisons.at(-1);
     const shiftAmt = lastComp
       ? Math.max(1, lastComp.patIdx - (buildBadChar(pattern)[text[s + lastComp.patIdx]] ?? -1))
       : 1;
     document.getElementById('vizCounter').textContent =
       matched ? '✓ MATCH' : `shift by ${shiftAmt}`;
   
     const activeIdxs = new Set(comparisons.map(c => c.textIdx));
   
     // ── Text row ──
     document.getElementById('vizTextChars').innerHTML =
       text.split('').map((ch, i) => {
         let cls = 'viz-char';
         if (activeIdxs.has(i)) {
           if (lastComp && i === lastComp.textIdx && !lastComp.match) cls += ' mismatch';
           else if (matched && i >= s && i < s + m)                   cls += ' matched';
           else                                                         cls += ' active';
         }
         return `<div class="${cls}">${escHtml(ch)}</div>`;
       }).join('');
   
     // ── Pattern row (offset by s * char width) ──
     const offsetPx = s * 31; // 28px width + 3px gap
     document.getElementById('vizPatChars').innerHTML =
       `<div style="display:flex;gap:3px;margin-left:${offsetPx}px">` +
       pattern.split('').map((ch, j) => {
         const comp = comparisons.find(c => c.patIdx === j);
         let cls = 'viz-char pattern';
         if (comp) {
           if (!comp.match)       cls = 'viz-char mismatch';
           else if (matched)      cls = 'viz-char matched';
           else                   cls = 'viz-char active';
         }
         return `<div class="${cls}">${escHtml(ch)}</div>`;
       }).join('') +
       '</div>';
   
     // ── Info line ──
     const infoEl = document.getElementById('vizInfo');
     if (matched) {
       infoEl.innerHTML =
         `<span style="color:var(--accent)">✓ Pattern found at position ${s}</span>`;
     } else if (lastComp) {
       const bc    = buildBadChar(pattern)[text[lastComp.textIdx]] ?? -1;
       const shift = Math.max(1, lastComp.patIdx - bc);
       infoEl.innerHTML =
         `Mismatch at text[${lastComp.textIdx}]='${text[lastComp.textIdx]}' ` +
         `vs pattern[${lastComp.patIdx}]='${pattern[lastComp.patIdx]}' ` +
         `→ bad char shift = ${shift}`;
     } else {
       infoEl.textContent = '';
     }
   
     // ── Button states ──
     document.getElementById('vizPrev').disabled = vizIdx === 0;
     document.getElementById('vizNext').disabled = vizIdx >= vizSteps.length - 1;
   }
   
   // ── Manual step 
   function vizStep(dir) {
     vizIdx = Math.max(0, Math.min(vizSteps.length - 1, vizIdx + dir));
     renderVizStep();
   }
   
   // ── Auto-play / pause 
   function vizPlay() {
     const btn = document.getElementById('vizPlayBtn');
   
     if (vizTimer) {
       clearInterval(vizTimer);
       vizTimer = null;
       btn.textContent = '▶ Auto';
       return;
     }
   
     btn.textContent = '⏸ Pause';
     vizTimer = setInterval(() => {
       if (vizIdx >= vizSteps.length - 1) {
         clearInterval(vizTimer);
         vizTimer = null;
         btn.textContent = '▶ Auto';
         return;
       }
       vizIdx++;
       renderVizStep();
     }, 900);
   }