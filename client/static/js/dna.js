/* 
   DNA pattern matching panel
   Uses Boyer-Moore on nucleotide sequences
    */

   'use strict';

   // ── Load a canned DNA sequence 
   function loadDNASample() {
     document.getElementById('dnaSeq').value =
       'ATGCGATCGATCGATCGATCGTAGCTAGCTATGCATCGATCGATCGATCGATCGTAGCTAGCTATGCATCGATCGATCG' +
       'GCATCGATCGATCGATCGATCGTAGCTAGCTATGCATCGATCGTAGCTAGCTATGCATCGATCGATCGATCGATCG';
   }
   
   // ── Run Boyer-Moore on DNA sequence 
   function runDNASearch() {
     const seq = document.getElementById('dnaSeq').value.trim();
     const pat = document.getElementById('dnaPattern').value.trim();
   
     if (!seq || !pat) return;
   
     const { positions, comparisons, shifts } = boyerMoore(seq, pat);
   
     // Stats
     document.getElementById('dnaStats').innerHTML = `
       <span style="color:var(--accent)">▸ ${positions.length} occurrence(s) found</span><br>
       Comparisons: ${comparisons} &nbsp;|&nbsp; Shifts: ${shifts}<br>
       Positions: ${positions.length ? positions.join(', ') : '—'}`;
   
     // Render coloured + highlighted sequence
     const highlighted = new Set(
       positions.flatMap(p =>
         Array.from({ length: pat.length }, (_, i) => p + i)
       )
     );
   
     let html = '';
     for (let i = 0; i < seq.length; i++) {
       const ch = seq[i];
       const cls = highlighted.has(i)
         ? `dna-match dna-${ch}`
         : `dna-${ch}`;
       html += `<span class="${cls}">${ch}</span>`;
   
       // Spacing every 10 bases, line break every 60
       if ((i + 1) % 60 === 0)      html += '<br>';
       else if ((i + 1) % 10 === 0) html += ' ';
     }
   
     document.getElementById('dnaDisplay').innerHTML = html;
   }