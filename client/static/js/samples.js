/* 
   Sample corpora + load/clear
*/

   'use strict';

   const SAMPLES = {
     lorem: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, pattern matching is a fundamental concept in computer science. The Boyer-Moore algorithm is one of the most efficient string matching algorithms. It preprocesses the pattern and uses two heuristics: bad character and good suffix.`,
   
     dna_sample: `ATGCGATACGTAGCTAGCATCGTAGCTAGCTATGCATCGATCGATCGATCGATCGATCGTAGCTAGCTATCGATCGATCGATCGTAGCTAGCTATGCATCGATCGATCG`,
   
     code_sample: `function boyerMoore(text, pattern) {
     const n = text.length, m = pattern.length;
     if (m === 0) return [];
     const badChar = buildBadChar(pattern);
     const results = [];
     let s = 0;
     while (s <= n - m) {
       let j = m - 1;
       while (j >= 0 && pattern[j] === text[s + j]) j--;
       if (j < 0) {
         results.push(s);
         s += (s + m < n) ? m - badChar[text[s + m]] : 1;
       } else {
         s += Math.max(1, j - (badChar[text[s + j]] ?? -1));
       }
     }
     return results;
   }`,
   };
   
   function loadSample() {
     const val = document.getElementById('sampleSelect').value;
     if (val && SAMPLES[val]) {
       document.getElementById('corpus').value = SAMPLES[val];
     }
   }
   
   function clearAll() {
     document.getElementById('corpus').value    = '';
     document.getElementById('mainSearch').value = '';
     clearResults();
     document.getElementById('statsRow').style.display = 'none';
   }
   
   function clearResults() {
     document.getElementById('results').innerHTML = `
       <div class="empty-state">
         <span class="big">{ }</span>
         Enter a pattern and hit Search.
       </div>`;
   }

   //Fetch document list from Java backend
async function loadDocumentList() {
  const select = document.getElementById('docSelect');
  try {
      const res   = await fetch('https://text-search-engine.onrender.com/api/documents');
    const files = await res.json();
    if (files.length === 0) {
      select.innerHTML = '<option value="">No docs/ files found</option>';
      return;
    }
    select.innerHTML = '<option value="">— pick a document —</option>' +
      files.map(f => `<option value="${f}">${f}</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Server unavailable</option>';
  }
}

async function loadDocument() {
  const fileName = document.getElementById('docSelect').value;
  if (!fileName) return;
    const res  = await fetch(`https://text-search-engine.onrender.com/api/document?file=${encodeURIComponent(fileName)}`);
  const text = await res.text();
  document.getElementById('corpus').value = text;
}

async function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }
    document.getElementById('fileName').innerText = file.name;

    const text = await file.text();

    // Put uploaded content into textarea
    document.getElementById('corpus').value = text;
}

document.addEventListener('DOMContentLoaded', loadDocumentList);