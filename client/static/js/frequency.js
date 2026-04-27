

   'use strict';

   // ── Render both charts when tab opens ────
   function renderFrequency() {
     const corpus = document.getElementById('corpus').value;
     if (!corpus) return;
   
     renderWordFrequency(corpus);
     renderCharFrequency(corpus);
   }
   
   // ── Word frequency (top 20) 
   function renderWordFrequency(corpus) {
     const wordCount = {};
     const words = corpus.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
   
     words.forEach(w => {
       wordCount[w] = (wordCount[w] || 0) + 1;
     });
   
     const top20 = Object.entries(wordCount)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 20);
   
     const maxW = top20[0]?.[1] || 1;
   
     document.getElementById('freqBars').innerHTML = top20.map(([word, count]) => `
       <div class="freq-bar-row">
         <div class="freq-word" title="${escHtml(word)}">${escHtml(word)}</div>
         <div class="freq-bar-wrap">
           <div class="freq-bar" style="width:${(count / maxW * 100).toFixed(1)}%"></div>
         </div>
         <div class="freq-count">${count}</div>
       </div>`).join('');
   }
   
   // ── Character frequency (letters only) ───
   function renderCharFrequency(corpus) {
     const charCount = {};
   
     for (const ch of corpus.toLowerCase()) {
       if (/[a-z]/.test(ch)) charCount[ch] = (charCount[ch] || 0) + 1;
     }
   
     const topChars = Object.entries(charCount)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 16);
   
     const maxC = topChars[0]?.[1] || 1;
   
     document.getElementById('charFreqBars').innerHTML = topChars.map(([ch, count]) => `
       <div class="freq-bar-row">
         <div class="freq-word" style="width:30px;font-weight:700;color:var(--accent2)">${ch}</div>
         <div class="freq-bar-wrap">
           <div class="freq-bar" style="width:${(count / maxC * 100).toFixed(1)}%;background:var(--accent2)"></div>
         </div>
         <div class="freq-count">${count}</div>
       </div>`).join('');
   }