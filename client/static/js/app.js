/* 
 Global state & tab switching
*/

   'use strict';

   // ── Global state
   window.App = {
     currentAlgo:  'bm',
     keywordIndex: {},
   };
   
   // ── Tab switching 
   function switchTab(event, name) {
     document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
     document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
     event.target.classList.add('active');
     document.getElementById('panel-' + name).classList.add('active');
   
     // Lazy-render side panels
     if (name === 'frequency') renderFrequency();
     if (name === 'index')     renderIndex();
   }
   
   // ── Algorithm selection 
   function selectAlgo(btn, algo) {
     document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('selected'));
     btn.classList.add('selected');
     App.currentAlgo = algo;
   }
   
   // ── Utility: escape HTML 
   function escHtml(s) {
     return s
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;');
   }
   
   // ── Utility: animated counter 
   function animateNum(id, target) {
     const el     = document.getElementById(id);
     const dur    = 600;
     const step   = 16;
     const frames = dur / step;
     const inc    = target / frames;
     let cur      = 0;
   
     const timer = setInterval(() => {
       cur = Math.min(cur + inc, target);
       el.textContent = Math.floor(cur).toLocaleString();
       if (cur >= target) clearInterval(timer);
     }, step);
   }