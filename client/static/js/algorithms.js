/* 
  All string-matching algorithms
  Mirrors the Java classes in /algorithms/BoyerMoore.java
  etc. so logic is consistent on both sides.
*/

   'use strict';

   // ── Boyer-Moore 
   function buildBadChar(pattern) {
     const table = {};
     for (let i = 0; i < pattern.length; i++) {
       table[pattern[i]] = i;
     }
     return table;
   }
   
   function boyerMoore(text, pattern) {
     const n = text.length;
     const m = pattern.length;
     if (m === 0) return { positions: [], comparisons: 0, shifts: 0 };
   
     const badChar  = buildBadChar(pattern);
     const positions = [];
     let comparisons = 0;
     let shifts      = 0;
     let s           = 0;
   
     while (s <= n - m) {
       let j = m - 1;
   
       while (j >= 0) {
         comparisons++;
         if (pattern[j] !== text[s + j]) break;
         j--;
       }
   
       if (j < 0) {
         // Full match
         positions.push(s);
         s += (s + m < n) ? m - (badChar[text[s + m]] ?? -1) : 1;
       } else {
         // Bad-character shift
         const bc = j - (badChar[text[s + j]] ?? -1);
         s += Math.max(1, bc);
       }
       shifts++;
     }
   
     return { positions, comparisons, shifts };
   }
   
   // ── Naive (brute-force) 
   function naiveSearch(text, pattern) {
     const n = text.length;
     const m = pattern.length;
     const positions = [];
     let comparisons = 0;
     let shifts      = 0;
   
     for (let i = 0; i <= n - m; i++) {
       shifts++;
       let j = 0;
       while (j < m) {
         comparisons++;
         if (text[i + j] !== pattern[j]) break;
         j++;
       }
       if (j === m) positions.push(i);
     }
   
     return { positions, comparisons, shifts };
   }
   
   // ── KMP 
   function kmpSearch(text, pattern) {
     const n = text.length;
     const m = pattern.length;
     if (m === 0) return { positions: [], comparisons: 0, shifts: 0 };
   
     // Build failure (LPS) array
     const lps = new Array(m).fill(0);
     let len = 0;
     let i   = 1;
     while (i < m) {
       if (pattern[i] === pattern[len]) {
         lps[i++] = ++len;
       } else if (len) {
         len = lps[len - 1];
       } else {
         lps[i++] = 0;
       }
     }
   
     const positions = [];
     let comparisons = 0;
     let shifts      = 0;
     i = 0;
     let j = 0;
   
     while (i < n) {
       comparisons++;
       if (text[i] === pattern[j]) {
         i++;
         j++;
       }
       if (j === m) {
         positions.push(i - j);
         j = lps[j - 1];
         shifts++;
       } else if (i < n && text[i] !== pattern[j]) {
         if (j) { j = lps[j - 1]; shifts++; }
         else   { i++; }
       }
     }
   
     return { positions, comparisons, shifts };
   }
   
   // ── Rabin-Karp 
   function rabinKarp(text, pattern) {
     const n   = text.length;
     const m   = pattern.length;
     const BASE = 31;
     const MOD  = 1e9 + 9;
   
     const positions = [];
     let comparisons = 0;
     let shifts      = 0;
     let ph    = 0;
     let th    = 0;
     let power = 1;
   
     for (let i = 0; i < m; i++) {
       ph = (ph * BASE + pattern.charCodeAt(i)) % MOD;
       th = (th * BASE + text.charCodeAt(i))    % MOD;
       if (i) power = (power * BASE) % MOD;
     }
   
     for (let i = 0; i <= n - m; i++) {
       shifts++;
       if (ph === th) {
         let match = true;
         for (let j = 0; j < m; j++) {
           comparisons++;
           if (text[i + j] !== pattern[j]) { match = false; break; }
         }
         if (match) positions.push(i);
       }
       if (i < n - m) {
         th = (th - text.charCodeAt(i) * power % MOD + MOD) % MOD;
         th = (th * BASE + text.charCodeAt(i + m)) % MOD;
       }
     }
   
     return { positions, comparisons, shifts };
   }
   
   // ── Dispatcher 
   function runAlgo(text, pattern) {
     switch (App.currentAlgo) {
       case 'bm':    return boyerMoore(text, pattern);
       case 'naive': return naiveSearch(text, pattern);
       case 'kmp':   return kmpSearch(text, pattern);
       case 'rk':    return rabinKarp(text, pattern);
       default:      return boyerMoore(text, pattern);
     }
   }