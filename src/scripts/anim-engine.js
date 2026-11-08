// 分步小动画引擎：取自区块链基础知识（blockchain/basics/assets/page.js 的 Guide.mount），逻辑未改。
// 区别只在数据来源：从 <div class="anim" data-anim="JSON"> 读，JSON 由 Anim 组件在构建时写入。
// 从第 0 步累加到第 i 步算出每个元素的状态，所以前进、后退、重来都一致。
function mount(host) {
  const d = JSON.parse(host.dataset.anim);
  host.innerHTML = `<div class="mini"></div>
    <div class="mctl"><button type="button" class="btn ghost" data-a="prev">上一步</button><button type="button" class="btn" data-a="next">下一步</button>
    <button type="button" class="btn ghost" data-a="play">播放</button><span class="prog"></span></div>
    <p class="mcap" aria-live="polite"></p>`;
  const stage = host.querySelector(".mini"), cap = host.querySelector(".mcap"), pg = host.querySelector(".prog");
  const bP = host.querySelector("[data-a=prev]"), bN = host.querySelector("[data-a=next]"), bPl = host.querySelector("[data-a=play]");
  stage.style.height = d.h + "px";
  const boxes = {}, items = {};
  d.b.forEach(([id, x, y, w, h, t]) => {
    const e = document.createElement("div"); e.className = "bx";
    Object.assign(e.style, { left: x + "%", top: y + "%", width: w + "%", height: h + "%" });
    if (t) { const s = document.createElement("span"); s.textContent = t; e.appendChild(s); }
    stage.appendChild(e); boxes[id] = e;
  });
  d.it.forEach((o) => { const e = document.createElement("div"); e.className = "it"; stage.appendChild(e); items[o.id] = e; });
  let i = 0, tm = null;
  function show() {
    const stt = {}; d.it.forEach((o) => (stt[o.id] = { x: o.x, y: o.y, h: o.h, hide: !!o.hide }));
    for (let k = 0; k <= i; k++) { const set = d.s[k].set || {}; for (const id in set) Object.assign(stt[id], set[id]); }
    for (const id in stt) {
      const e = items[id], v = stt[id];
      if (e.dataset.h !== v.h) { e.innerHTML = v.h; e.dataset.h = v.h; }
      e.style.left = v.x + "%"; e.style.top = v.y + "%";
      e.classList.toggle("hide", !!v.hide);
    }
    const st = d.s[i];
    for (const id in boxes) { boxes[id].classList.toggle("lit", (st.lit || []).includes(id)); boxes[id].classList.toggle("bad", (st.bad || []).includes(id)); }
    cap.textContent = st.c;
    pg.textContent = `${i + 1} / ${d.s.length}`;
    bP.disabled = i === 0;
    bN.textContent = i === d.s.length - 1 ? "重来" : "下一步";
  }
  const stop = () => { clearInterval(tm); tm = null; bPl.textContent = "播放"; };
  bN.addEventListener("click", () => { stop(); i = i === d.s.length - 1 ? 0 : i + 1; show(); });
  bP.addEventListener("click", () => { stop(); i = Math.max(0, i - 1); show(); });
  bPl.addEventListener("click", () => {
    if (tm) return stop();
    if (i === d.s.length - 1) i = 0;
    bPl.textContent = "暂停"; show();
    tm = setInterval(() => { if (i >= d.s.length - 1) return stop(); i++; show(); }, 3200);
  });
  show();
}
document.querySelectorAll(".anim[data-anim]").forEach(mount);
