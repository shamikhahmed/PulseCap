'use strict';
/* ── PulseCap — Progress Photos ──
   Private before/after timeline. Photos are compressed on-device (longest
   edge 1080px, JPEG q0.7 ≈ ≤200KB) and stored in IndexedDB so they never
   leave the phone and never touch the 5MB localStorage budget. */

const PhotoStore = {
  DB: 'pulsecap-photos',
  STORE: 'photos',
  VERSION: 2,
  _dbPromise: null,
  _open() {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise(function(res, rej) {
      const req = indexedDB.open(PhotoStore.DB, PhotoStore.VERSION);
      req.onupgradeneeded = function() {
        const store = req.result.objectStoreNames.contains(PhotoStore.STORE)
          ? req.transaction.objectStore(PhotoStore.STORE)
          : req.result.createObjectStore(PhotoStore.STORE, { keyPath: 'id' });
        if (!store.indexNames.contains('profileId')) store.createIndex('profileId', 'profileId', { unique: false });
      };
      req.onsuccess = function() {
        req.result.onversionchange = function() {
          req.result.close();
          PhotoStore._dbPromise = null;
        };
        res(req.result);
      };
      req.onerror = function() {
        PhotoStore._dbPromise = null;
        rej(req.error);
      };
    });
    return this._dbPromise;
  },
  async add(entry) {
    const db = await this._open();
    const stored = Object.assign({}, entry);
    if (entry.blob instanceof Blob) {
      stored.blobData = new Uint8Array(await entry.blob.arrayBuffer());
      stored.blobType = entry.blob.type || 'image/jpeg';
      delete stored.blob;
    }
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      tx.objectStore(PhotoStore.STORE).put(stored);
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error || new Error('Could not save photo')); };
    });
  },
  async all(profileId) {
    if (!profileId) return [];
    const db = await this._open();
    return new Promise(function(res, rej) {
      const req = db.transaction(PhotoStore.STORE).objectStore(PhotoStore.STORE).index('profileId').getAll(profileId);
      req.onsuccess = function() {
        const rows = (req.result || []).map(function(row) {
          if (!row.blob && row.blobData) {
            row.blob = new Blob([row.blobData], { type: row.blobType || 'image/jpeg' });
          }
          return row;
        });
        res(rows.sort(function(a, b) { return a.date < b.date ? 1 : -1; }));
      };
      req.onerror = function() { rej(req.error); };
    });
  },
  async remove(id, profileId) {
    const db = await this._open();
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      const store = tx.objectStore(PhotoStore.STORE);
      const get = store.get(id);
      get.onsuccess = function() {
        if (get.result && get.result.profileId === profileId) store.delete(id);
      };
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error); };
    });
  },
  async removeProfile(profileId) {
    if (!profileId) return;
    const db = await this._open();
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      const cursor = tx.objectStore(PhotoStore.STORE).index('profileId').openKeyCursor(profileId);
      cursor.onsuccess = function() {
        const row = cursor.result;
        if (!row) return;
        tx.objectStore(PhotoStore.STORE).delete(row.primaryKey);
        row.continue();
      };
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error); };
    });
  },
  async legacyCount() {
    const db = await this._open();
    return new Promise(function(res, rej) {
      const req = db.transaction(PhotoStore.STORE).objectStore(PhotoStore.STORE).getAll();
      req.onsuccess = function() { res((req.result || []).filter(function(p) { return !p.profileId; }).length); };
      req.onerror = function() { rej(req.error); };
    });
  },
  async claimLegacy(profileId) {
    if (!profileId) return;
    const db = await this._open();
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      const cursor = tx.objectStore(PhotoStore.STORE).openCursor();
      cursor.onsuccess = function() {
        const row = cursor.result;
        if (!row) return;
        if (!row.value.profileId) {
          const value = row.value;
          value.profileId = profileId;
          row.update(value);
        }
        row.continue();
      };
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error); };
    });
  },
  async deleteLegacy() {
    const db = await this._open();
    return new Promise(function(res, rej) {
      const tx = db.transaction(PhotoStore.STORE, 'readwrite');
      const cursor = tx.objectStore(PhotoStore.STORE).openCursor();
      cursor.onsuccess = function() {
        const row = cursor.result;
        if (!row) return;
        if (!row.value.profileId) row.delete();
        row.continue();
      };
      tx.oncomplete = function() { res(); };
      tx.onerror = function() { rej(tx.error); };
    });
  }
};
window.PhotoStore = PhotoStore;

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
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type) || file.size > 12 * 1024 * 1024) {
    toast('Choose a JPG, PNG, or WebP under 12 MB', 'warn');
    input.value = '';
    return;
  }
  _compressPhoto(file).then(function(blob) {
    const weight = S.g('user.weight') || null;
    const profileId = S.activeId();
    if (!profileId) throw new Error('missing profile');
    const suffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2);
    return PhotoStore.add({ id: 'ph_' + suffix, profileId: profileId, date: today(), blob: blob, weight: weight });
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
    '<button type="button" class="btn btn-primary" style="flex:1;background:var(--danger)" onclick="_doDeletePhoto(' + jsArg(id) + ')">Delete</button>' +
    '<button type="button" class="btn btn-ghost" onclick="closeModal()">Keep</button></div>');
};
window._doDeletePhoto = function(id) {
  PhotoStore.remove(id, S.activeId()).then(function() { closeModal(); go('photos'); });
};

window.claimLegacyPhotos = function() {
  PhotoStore.claimLegacy(S.activeId()).then(function() {
    closeModal();
    toast('Legacy photos assigned to this profile', 'ok');
    go('photos');
  }).catch(function() { toast('Could not migrate legacy photos', 'warn'); });
};
window.confirmClaimLegacyPhotos = function(count) {
  modal('Assign legacy photos?',
    '<div class="body-13">Assign ' + Number(count || 0) + ' quarantined photo' + (Number(count) === 1 ? '' : 's') + ' to this profile. Other profiles will not see them.</div>',
    '<button type="button" class="btn btn-primary mt-14" onclick="claimLegacyPhotos()">Assign to this profile</button>' +
    '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()">Cancel</button>');
};
window.confirmDeleteLegacyPhotos = function() {
  modal('Delete quarantined photos?',
    '<div class="body-13">This permanently deletes legacy photos that could not be linked to a profile.</div>',
    '<button type="button" class="btn btn-danger mt-14" onclick="PhotoStore.deleteLegacy().then(function(){closeModal();go(\'photos\')})">Delete permanently</button>' +
    '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()">Cancel</button>');
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
    let legacyCount = 0;
    try {
      items = await PhotoStore.all(S.activeId());
      legacyCount = await PhotoStore.legacyCount();
    } catch(e) {}
    const legacy = document.getElementById('photo-legacy');
    if (legacy && legacyCount) {
      legacy.innerHTML = '<div class="card-block"><div class="section-label">Legacy photos quarantined</div>' +
        '<div class="body-13">' + legacyCount + ' photo' + (legacyCount === 1 ? '' : 's') + ' from an older PulseCap version need an owner.</div>' +
        '<div class="flex-gap-8 mt-14"><button type="button" class="btn btn-primary btn-sm" onclick="confirmClaimLegacyPhotos(' + legacyCount + ')">Assign here</button>' +
        '<button type="button" class="btn btn-danger btn-sm" onclick="confirmDeleteLegacyPhotos()">Delete</button></div></div>';
    }
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
        (p.weight ? '<div style="font-size:10px;color:rgba(255,255,255,0.75)">' + esc(formatWeight(p.weight)) + '</div>' : '') + '</div>' +
        '<button type="button" onclick="deleteProgressPhoto(' + jsArg(p.id) + ')" aria-label="Delete photo" style="min-width:44px;min-height:44px;background:rgba(0,0,0,0.45);border:none;border-radius:8px;color:#fff;padding:5px 8px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center">' + icon('alert', 14, '#fff') + '</button>' +
        '</div></div>';
    }).join('');
  }, 0);

  return moduleTopbar('Progress Photos', 'Private · stays on this phone') +
    '<div id="photo-legacy"></div>' +
    '<div style="padding:0 16px 8px">' +
    '<label class="btn btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer">' + icon('camera', 18, '#fff') + ' Add today\'s photo' +
    '<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onchange="addProgressPhoto(this)" style="display:none"></label>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:8px">Same spot, same light, once a week — that\'s where change shows.</div>' +
    '</div>' +
    '<div id="photo-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 16px"></div>' +
    '<div  class="spacer-bottom"></div>';
});

if (typeof registerRouteCleanup === 'function') {
  registerRouteCleanup('photos', function() {
    _photoUrls.forEach(function(u) { URL.revokeObjectURL(u); });
    _photoUrls = [];
  });
}
