// Builds the pastel animated background scene (orbs, clouds, petals,
// sparkles, rings, macaroon blobs) inside the given container.

export function buildBackground(container) {
  container.innerHTML = '';

  // Glow orbs
  [
    { w: 260, h: 200, t: '-5%', l: '-8%', bg: 'rgba(180,240,220,0.38)', dur: '5s', del: '0s' },
    { w: 220, h: 180, t: '25%', r: '-6%', bg: 'rgba(210,185,255,0.32)', dur: '6.5s', del: '-2.5s' },
    { w: 200, h: 160, b: '8%', l: '-5%', bg: 'rgba(255,210,235,0.35)', dur: '5.8s', del: '-1.2s' },
    { w: 170, h: 140, t: '55%', l: '22%', bg: 'rgba(185,225,255,0.3)', dur: '7s', del: '-3.5s' },
    { w: 150, h: 130, t: '12%', l: '52%', bg: 'rgba(255,235,200,0.28)', dur: '4.8s', del: '-0.8s' },
  ].forEach(o => {
    const d = document.createElement('div');
    d.className = 'orb';
    Object.assign(d.style, {
      width: o.w + 'px', height: o.h + 'px',
      top: o.t || '', bottom: o.b || '', left: o.l || '', right: o.r || '',
      background: o.bg, animationDuration: o.dur, animationDelay: o.del,
    });
    container.appendChild(d);
  });

  // Fluffy clouds
  [
    { top: '6%', dur: '30s', del: '0s', sc: 1 },
    { top: '20%', dur: '38s', del: '-14s', sc: .72 },
    { top: '38%', dur: '46s', del: '-22s', sc: .55 },
    { top: '60%', dur: '34s', del: '-7s', sc: .65 },
    { top: '78%', dur: '42s', del: '-18s', sc: .48 },
  ].forEach(cc => {
    const wrap = document.createElement('div');
    wrap.className = 'cloud';
    wrap.style.top = cc.top;
    wrap.style.left = '-260px';
    wrap.style.animationDuration = cc.dur;
    wrap.style.animationDelay = cc.del;
    const bw = Math.round(120 * cc.sc), bh = Math.round(38 * cc.sc);
    const body = document.createElement('div');
    body.className = 'cloud-body';
    body.style.cssText = `position:relative;width:${bw}px;height:${bh}px;`;
    const base = document.createElement('div');
    base.className = 'cloud-base';
    base.style.cssText = `width:100%;height:100%;top:0;left:0;background:rgba(255,255,255,0.8);border-radius:${bh / 2}px;`;
    [
      { w: Math.round(bh * 1.4), h: Math.round(bh * 1.4), t: Math.round(-bh * .62), l: Math.round(bw * .1) },
      { w: Math.round(bh * 1.15), h: Math.round(bh * 1.15), t: Math.round(-bh * .48), l: Math.round(bw * .36) },
      { w: Math.round(bh * .95), h: Math.round(bh * .95), t: Math.round(-bh * .38), l: Math.round(bw * .6) },
    ].forEach(b => {
      const bump = document.createElement('div');
      bump.className = 'cloud-bump';
      bump.style.cssText = `width:${b.w}px;height:${b.h}px;top:${b.t}px;left:${b.l}px;background:rgba(255,255,255,0.82);`;
      body.appendChild(bump);
    });
    body.appendChild(base);
    wrap.appendChild(body);
    container.appendChild(wrap);
  });

  // Petals
  const petalColors = ['rgba(255,185,215,0.72)', 'rgba(240,200,255,0.68)', 'rgba(195,235,220,0.70)', 'rgba(255,215,195,0.65)', 'rgba(200,220,255,0.68)', 'rgba(255,230,210,0.70)'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const sz = 10 + Math.random() * 14;
    p.style.cssText = `width:${sz}px;height:${sz * 1.4}px;left:${2 + Math.random() * 96}%;top:-22px;background:${petalColors[i % petalColors.length]};animation-duration:${6 + Math.random() * 6}s;animation-delay:${-Math.random() * 11}s;`;
    container.appendChild(p);
  }

  // Sparkle dots
  const sparkleColors = ['rgba(125,212,184,0.8)', 'rgba(184,157,232,0.75)', 'rgba(240,160,200,0.75)', 'rgba(144,200,240,0.75)', 'rgba(240,192,144,0.75)'];
  [[6, '8%', '18%', 0], [5, '20%', '76%', 1], [7, '46%', '12%', 2], [5, '60%', '80%', 3], [6, '76%', '38%', 4], [5, '33%', '52%', 0], [6, '88%', '16%', 2], [5, '13%', '60%', 1], [4, '50%', '65%', 3]].forEach(([sz, top, left, ci], i) => {
    const d = document.createElement('div');
    d.className = 'sp-dot';
    d.style.cssText = `width:${sz}px;height:${sz}px;top:${top};left:${left};background:${sparkleColors[ci]};animation-duration:${2.2 + i * .35}s;animation-delay:${-i * .5}s;`;
    container.appendChild(d);
  });

  // Rings
  [
    { sz: 72, top: '13%', left: '66%', col: 'rgba(125,212,184,0.4)', dur: '4s' },
    { sz: 52, top: '63%', left: '10%', col: 'rgba(184,157,232,0.38)', dur: '5.5s', del: '-1.5s' },
    { sz: 40, top: '40%', left: '76%', col: 'rgba(240,160,200,0.38)', dur: '3.8s', del: '-.8s' },
  ].forEach(r => {
    const d = document.createElement('div');
    d.className = 'soft-ring';
    d.style.cssText = `width:${r.sz}px;height:${r.sz}px;top:${r.top};left:${r.left};border-color:${r.col};border-width:2px;animation-duration:${r.dur};animation-delay:${r.del || '0s'};`;
    container.appendChild(d);
  });

  // Macaroon circles
  const macColors = [
    { bg: 'rgba(125,212,184,0.45)', b: 'rgba(90,188,158,0.5)' },
    { bg: 'rgba(184,157,232,0.38)', b: 'rgba(148,117,208,0.48)' },
    { bg: 'rgba(240,160,200,0.38)', b: 'rgba(204,120,168,0.48)' },
    { bg: 'rgba(144,200,240,0.38)', b: 'rgba(100,164,210,0.45)' },
    { bg: 'rgba(240,192,144,0.38)', b: 'rgba(204,152,100,0.45)' },
  ];
  [[28, '78%', '5%', 0, 4], [22, '6%', '80%', 1, 5], [24, '66%', '70%', 2, 6], [18, '28%', '5%', 3, 3.5], [16, '90%', '52%', 4, 5.5]].forEach(([sz, top, left, mi, dur], i) => {
    const d = document.createElement('div');
    d.className = 'mac';
    const m = macColors[mi];
    d.style.cssText = `width:${sz}px;height:${sz}px;top:${top};left:${left};background:${m.bg};border:2px solid ${m.b};animation-duration:${dur}s;animation-delay:${-i * .7}s;`;
    container.appendChild(d);
  });
}
