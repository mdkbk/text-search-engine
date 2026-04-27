/* 
   Keyword index
   Mirrors Indexer.java logic
 */

   'use strict';

   // ── Build in-memory inverted index ────────
   function buildKeywordIndex(text) {
     App.keywordIndex = {};
     const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
   
     words.forEach((word, idx) => {
       if (!App.keywordIndex[word]) App.keywordIndex[word] = [];
       App.keywordIndex[word].push(idx);
     });
   }
   
   // ── Rebuild from corpus textarea ──────────
   function buildIndex() {
     buildKeywordIndex(document.getElementById('corpus').value);
     renderIndex();
   }
   
   // ── Render index table (with live filter) ─
   function renderIndex() {
     const filter = (document.getElementById('indexFilter')?.value || '').toLowerCase();
     const keys   = Object.keys(App.keywordIndex)
       .filter(k => k.includes(filter))
       .sort();
   
     if (keys.length === 0) {
       document.getElementById('indexContent').innerHTML = `
         <div class="empty-state" style="margin-top:40px">
           <span class="big" style="font-size:2rem">#</span>
           No index entries${filter ? ' matching filter' : ''}.
           ${!filter ? 'Build index first.' : ''}
         </div>`;
       return;
     }
   
     const rows = keys.slice(0, 200).map(k => {
       const positions = App.keywordIndex[k];
       const shown     = positions.slice(0, 12);
       const extra     = positions.length - shown.length;
   
       const posTags = shown.map(p => `<span class="pos-tag">${p}</span>`).join('');
       const moreTag = extra > 0
         ? `<span style="color:var(--muted);font-size:.65rem"> +${extra} more</span>`
         : '';
   
       return `
         <tr>
           <td><code style="color:var(--accent)">${escHtml(k)}</code></td>
           <td><span style="color:var(--accent2)">${positions.length}</span></td>
           <td>${posTags}${moreTag}</td>
         </tr>`;
     }).join('');
   
     document.getElementById('indexContent').innerHTML = `
       <table class="index-table">
         <thead>
           <tr>
             <th>Token</th>
             <th>Frequency</th>
             <th>Positions</th>
           </tr>
         </thead>
         <tbody>${rows}</tbody>
       </table>`;
   }