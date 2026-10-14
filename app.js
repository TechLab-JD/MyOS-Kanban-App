// MyOS Kanban — drag cards between To Do / Doing / Done (localStorage).
const KEY = 'myos.kanban';
const COLS = ['To Do', 'Doing', 'Done'];
const board = document.getElementById('kb-board');

if (board) {
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!data) data = { 'To Do': [], 'Doing': [], 'Done': [] };
  COLS.forEach((c) => { if (!data[c]) data[c] = []; });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function render() {
    board.replaceChildren();
    COLS.forEach((col) => {
      const colEl = document.createElement('div'); colEl.className = 'kb-col'; colEl.dataset.col = col;
      const h = document.createElement('div'); h.className = 'kb-col-h'; h.textContent = col + ' (' + data[col].length + ')';
      const cards = document.createElement('div'); cards.className = 'kb-cards';

      data[col].forEach((card) => {
        const el = document.createElement('div'); el.className = 'kb-card'; el.draggable = true; el.dataset.id = card.id;
        const t = document.createElement('span'); t.className = 't'; t.textContent = card.text;
        const x = document.createElement('span'); x.className = 'x'; x.textContent = '✕';
        x.addEventListener('click', () => { data[col] = data[col].filter((c) => c.id !== card.id); save(); render(); });
        el.append(t, x);
        el.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', card.id); el.classList.add('dragging'); });
        el.addEventListener('dragend', () => el.classList.remove('dragging'));
        cards.appendChild(el);
      });

      const add = document.createElement('form'); add.className = 'kb-add';
      const inp = document.createElement('input'); inp.placeholder = '+ Add'; inp.autocomplete = 'off';
      const btn = document.createElement('button'); btn.textContent = '+'; btn.type = 'submit';
      add.append(inp, btn);
      add.addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; data[col].push({ id: uid(), text: v }); save(); render(); });

      colEl.addEventListener('dragover', (e) => { e.preventDefault(); colEl.classList.add('drop'); });
      colEl.addEventListener('dragleave', () => colEl.classList.remove('drop'));
      colEl.addEventListener('drop', (e) => {
        e.preventDefault(); colEl.classList.remove('drop');
        const id = e.dataTransfer.getData('text/plain');
        let moved = null;
        COLS.forEach((c) => { const idx = data[c].findIndex((x) => x.id === id); if (idx >= 0) { moved = data[c].splice(idx, 1)[0]; } });
        if (moved) { data[col].push(moved); save(); render(); }
      });

      colEl.append(h, cards, add);
      board.appendChild(colEl);
    });
  }
  render();
}
