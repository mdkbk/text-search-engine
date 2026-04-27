'use strict';

// ── Run all 4 algorithms and render chart ─────────────────────
function runBenchmark() {
  const corpus  = document.getElementById('corpus').value;
  const pattern = document.getElementById('benchPattern').value.trim();

  if (!corpus || !pattern) {
    alert('Please paste a corpus in the Search tab first, then enter a pattern here.');
    return;
  }

  const text = corpus.toLowerCase();
  const pat  = pattern.toLowerCase();

  const results = {
    'Boyer-Moore': boyerMoore(text, pat),
    'KMP':         kmpSearch(text, pat),
    'Naive':       naiveSearch(text, pat),
    'Rabin-Karp':  rabinKarp(text, pat),
  };

  renderCharts(results, pattern);
}

// ── Render Chart.js graphs ────────────────────────────────────
function renderCharts(results, pattern) {
  const algos   = Object.keys(results);
  const cmps    = algos.map(a => results[a].comparisons);
  const shifts  = algos.map(a => results[a].shifts);
  const matches = results['Boyer-Moore'].positions.length;

  const COLORS = {
    'Boyer-Moore': 'rgba(0, 229, 160, 0.85)',
    'KMP':         'rgba(91, 141, 238, 0.85)',
    'Naive':       'rgba(255, 77, 109, 0.85)',
    'Rabin-Karp':  'rgba(245, 158, 11, 0.85)',
  };
  const bgColors  = algos.map(a => COLORS[a]);
  const gridColor = 'rgba(255,255,255,0.07)';
  const textColor = '#a0a0b8';

  document.getElementById('benchChart').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">// Comparisons</div>
        <canvas id="cmpChart" height="220"></canvas>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">// Shifts</div>
        <canvas id="shiftChart" height="220"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">// Overall Efficiency Score</div>
      <canvas id="radarChart" height="120"></canvas>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-title" style="margin-bottom:12px">// Summary</div>
      <table style="width:100%;border-collapse:collapse;font-size:.78rem">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:8px 10px;color:var(--muted);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase">Algorithm</th>
            <th style="text-align:right;padding:8px 10px;color:var(--muted);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase">Comparisons</th>
            <th style="text-align:right;padding:8px 10px;color:var(--muted);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase">Shifts</th>
            <th style="text-align:right;padding:8px 10px;color:var(--muted);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase">Matches</th>
            <th style="text-align:right;padding:8px 10px;color:var(--muted);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase">vs Naive</th>
          </tr>
        </thead>
        <tbody>
          ${algos.map(a => {
            const naiveCmp = results['Naive'].comparisons;
            const saving   = naiveCmp ? Math.round((1 - results[a].comparisons / naiveCmp) * 100) : 0;
            const isNaive  = a === 'Naive';
            return `<tr style="border-bottom:1px solid rgba(30,30,46,.5)">
              <td style="padding:8px 10px;color:${COLORS[a].replace('0.85','1')};font-weight:600">${a}</td>
              <td style="padding:8px 10px;text-align:right;color:var(--text)">${results[a].comparisons.toLocaleString()}</td>
              <td style="padding:8px 10px;text-align:right;color:var(--text)">${results[a].shifts.toLocaleString()}</td>
              <td style="padding:8px 10px;text-align:right;color:var(--accent)">${results[a].positions.length}</td>
              <td style="padding:8px 10px;text-align:right;color:${isNaive ? 'var(--muted)' : saving > 0 ? 'var(--accent)' : 'var(--danger)'}">
                ${isNaive ? '— baseline' : (saving > 0 ? saving + '% fewer' : Math.abs(saving) + '% more')}
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('benchStats').textContent =
    `Corpus: ${document.getElementById('corpus').value.length.toLocaleString()} chars  ·  Pattern: "${pattern}"  ·  ${matches} match(es) found`;

  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    script.onload = () => drawCharts(algos, cmps, shifts, bgColors, gridColor, textColor);
    document.head.appendChild(script);
  } else {
    ['cmpChart','shiftChart','radarChart'].forEach(id => {
      const existing = Chart.getChart(id);
      if (existing) existing.destroy();
    });
    drawCharts(algos, cmps, shifts, bgColors, gridColor, textColor);
  }
}

function drawCharts(algos, cmps, shifts, bgColors, gridColor, textColor) {
  const chartDefaults = {
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e1e2e', titleColor: '#e8e8f0', bodyColor: '#a0a0b8' }
    },
    scales: {
      x: { ticks: { color: textColor, font: { family: 'IBM Plex Mono', size: 11 } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, font: { family: 'IBM Plex Mono', size: 11 } }, grid: { color: gridColor } }
    }
  };

  new Chart(document.getElementById('cmpChart'), {
    type: 'bar',
    data: {
      labels: algos,
      datasets: [{ label: 'Comparisons', data: cmps, backgroundColor: bgColors, borderRadius: 4, borderSkipped: false }]
    },
    options: { ...chartDefaults, plugins: { ...chartDefaults.plugins,
      tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} comparisons` } }
    }}
  });

  new Chart(document.getElementById('shiftChart'), {
    type: 'bar',
    data: {
      labels: algos,
      datasets: [{ label: 'Shifts', data: shifts, backgroundColor: bgColors, borderRadius: 4, borderSkipped: false }]
    },
    options: { ...chartDefaults, plugins: { ...chartDefaults.plugins,
      tooltip: { ...chartDefaults.plugins.tooltip, callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} shifts` } }
    }}
  });

  const maxCmp     = Math.max(...cmps);
  const efficiency = algos.map((a, i) => Math.round((1 - cmps[i] / maxCmp) * 100));

  new Chart(document.getElementById('radarChart'), {
    type: 'radar',
    data: {
      labels: algos,
      datasets: [{
        label: 'Efficiency Score (higher = better)',
        data: efficiency,
        backgroundColor: 'rgba(0,229,160,0.1)',
        borderColor: 'rgba(0,229,160,0.8)',
        pointBackgroundColor: bgColors,
        pointRadius: 5,
      }]
    },
    options: {
      plugins: {
        legend: { display: true, labels: { color: textColor, font: { family: 'IBM Plex Mono', size: 11 } } },
        tooltip: { backgroundColor: '#1e1e2e', titleColor: '#e8e8f0', bodyColor: '#a0a0b8',
          callbacks: { label: ctx => ` Efficiency: ${ctx.raw}%` } }
      },
      scales: {
        r: {
          ticks: { color: textColor, backdropColor: 'transparent', font: { size: 10 } },
          grid: { color: gridColor },
          pointLabels: { color: textColor, font: { family: 'IBM Plex Mono', size: 11 } },
          min: 0, max: 100,
        }
      }
    }
  });
}