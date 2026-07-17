'use strict';
/* ── PulseCap — Progress Photos ──
   Private before/after timeline. Photos are compressed on-device (longest
   edge 1080px, JPEG q0.7 ≈ ≤200KB) and stored in IndexedDB so they never
   leave the phone and never touch the 5MB localStorage budget. */

const PhotoStore = {
  DB: 'pulsecap-photos',
  STORE: 'photos',
  _open() {
    return new Promise(function(res, rej) {
      const req = indexedDB.open(PhotoStore.DB, 1);
      req.onupgradeneeded = function() {
        req.result.createObjectStore(PhotoStore.STORE, { keyPath: 'id' });
      };
      req.onsuccess = function() { res(req.result); };
      req.onerror = function() { rej(req.error); };
    });
  },
  async add(entry) {
    const db = await this._open();
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      tx.objectStore(PhotoStore.STORE).put(entry);
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error); };
    });
  },
  async all() {
    const db = await this._open();
    return new Promise(function(res, rej) {
      const req = db.transaction(PhotoStore.STORE).objectStore(PhotoStore.STORE).getAll();
      req.onsuccess = function() {
        res((req.result || []).sort(function(a, b) { return a.date < b.date ? 1 : -1; }));
      };
      req.onerror = function() { rej(req.error); };
    });
  },
  async remove(id) {
    const db = await this._open();
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      tx.objectStore(PhotoStore.STORE).delete(id);
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error); };
    });
  }
};

function _compressPhoto(file) {
  return new Promise(function(res, rej) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function() {
      const MAX = 1080;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function(blob) { blob ? res(blob) : rej(new Error('compress failed')); }, 'image/jpeg', 0.7);
    };
    img.onerror = function() { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src = url;
  });
}

window.addProgressPhoto = function(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  _compressPhoto(file).then(function(blob) {
    const weight = S.g('user.weight') || null;
    return PhotoStore.add({ id: 'ph_' + Date.now(), date: today(), blob: blob, weight: weight });
  }).then(function() {
    toast('Saved. Future you says thanks.', 'ok');
    go('photos');
  }).catch(function() {
    toast('Couldn\'t read that photo — try another', 'warn');
  });
};

window.deleteProgressPhoto = function(id) {
  modal('Delete this photo?',
    '<div style="font-size:14px;color:var(--txt2)">Gone for good — there\'s no cloud copy (that\'s the point).</div>',
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '<button type="button" class="btn btn-primary" style="flex:1;background:#ff453a" onclick="_doDeletePhoto(\'' + id + '\')">Delete</button>' +
    '<button type="button" class="btn btn-ghost" onclick="closeModal()">Keep</button></div>');
};
window._doDeletePhoto = function(id) {
  PhotoStore.remove(id).then(function() { closeModal(); go('photos'); });
};

let _photoUrls = [];
reg('photos', function() {
  /* Render shell now, hydrate async from IndexedDB */
  setTimeout(async function() {
    const grid = document.getElementById('photo-grid');
    if (!grid) return;
    _photoUrls.forEach(function(u) { URL.revokeObjectURL(u); });
    _photoUrls = [];
    let items = [];
    try { items = await PhotoStore.all(); } catch(e) {}
    if (!items.length) {
      grid.innerHTML = '<div style="grid-column:1/-1">' +
        emptyState(icon('camera', 30), 'No photos yet', 'The scale lies some weeks. Photos don\'t. One a week, same light, same pose.', null, null) + '</div>';
      return;
    }
    grid.innerHTML = items.map(function(p) {
      const url = URL.createObjectURL(p.blob);
      _photoUrls.push(url);
      return '<div style="position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--bg3)">' +
        '<img src="' + url + '" alt="Progress photo ' + esc(p.date) + '" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block">' +
        '<div style="position:absolute;bottom:0;left:0;right:0;padding:20px 10px 8px;background:linear-gradient(transparent,rgba(0,0,0,0.75));display:flex;justify-content:space-between;align-items:flex-end">' +
        '<div><div style="font-size:11px;font-weight:700;color:#fff">' + esc(fmtDate(p.date)) + '</div>' +
        (p.weight ? '<div style="font-size:10px;color:rgba(255,255,255,0.75)">' + p.weight + 'kg</div>' : '') + '</div>' +
        '<button type="button" onclick="deleteProgressPhoto(\'' + p.id + '\')" aria-label="Delete" style="background:rgba(0,0,0,0.45);border:none;border-radius:8px;color:#fff;padding:5px 8px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center">' + icon('alert', 14, '#fff') + '</button>' +
        '</div></div>';
    }).join('');
  }, 0);

  return moduleTopbar('Progress Photos', 'Private · stays on this phone') +
    '<div style="padding:0 16px 8px">' +
    '<label class="btn btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer">' + icon('camera', 18, '#fff') + ' Add today\'s photo' +
    '<input type="file" accept="image/*" capture="environment" onchange="addProgressPhoto(this)" style="display:none"></label>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:8px">Same spot, same light, once a week — that\'s where change shows.</div>' +
    '</div>' +
    '<div id="photo-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 16px"></div>' +
    '<div  class="spacer-bottom"></div>';
});
