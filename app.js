// ===== App registry =====
const APPS = {
  mail: { title: 'MESSAGES.exe', icon: 'fa-envelope', width: 340, height: 280, build: buildMail },
  cats: { title: 'OURS.exe', icon: 'fa-paw', width: 300, height: 280, build: buildCats },
  draw: { title: 'MEMORIES.so', icon: 'fa-paintbrush', width: 320, height: 360, build: buildDraw },
  files: { title: 'ARCHIVE', icon: 'fa-folder', width: 300, height: 220, build: buildFiles },
  save: { title: 'KEEPSAKE', icon: 'fa-floppy-disk', width: 280, height: 220, build: buildSave },
  web: { title: 'CONNECT', icon: 'fa-globe', width: 340, height: 260, build: buildWeb },
  trash: { title: 'LETGO', icon: 'fa-trash', width: 260, height: 220, build: buildTrash },
  notes: { title: 'DIARY', icon: 'fa-pencil', width: 300, height: 240, build: buildNotes },
  letters: { title: 'LETTERS', icon: 'fa-envelope-open', width: 380, height: 340, build: buildLetters },
  music: { title: 'MUSIC', icon: 'fa-music', width: 320, height: 260, build: buildMusic },
  sunny: { title: 'VIBES', icon: 'fa-sun', width: 240, height: 200, build: buildSunny },
  time: { title: 'TIMELINE', icon: 'fa-clock', width: 220, height: 180, build: buildTime },
  chanteii: { title: 'FOR YOU', icon: 'fa-heart', width: 280, height: 240, build: buildChanteii },
  dialog: { title: 'SYSTEM', icon: 'fa-exclamation', width: 240, height: 140, build: buildDialog }
};

const openWindows = {};
let zCounter = 100;
let dialogShown = false;

function openApp(appKey, params) {
  params = params || {};
  if (openWindows[appKey] && appKey !== 'dialog') {
    focusWindow(openWindows[appKey]);
    return;
  }

  const cfg = APPS[appKey];
  if (!cfg) return;

  const win = document.createElement('div');
  win.className = 'window';
  win.setAttribute('data-app', appKey);
  const mobile = window.innerWidth <= 640;
  if (mobile) {
    win.style.width = '100%';
    win.style.height = 'calc(100% - var(--title-h) - 64px)';
    win.style.left = '0';
    win.style.top = 'var(--title-h)';
    win.style.border = 'none';
    win.style.borderTopLeftRadius = '16px';
    win.style.borderTopRightRadius = '16px';
    win.style.borderBottomLeftRadius = '0';
    win.style.borderBottomRightRadius = '0';
    win.style.boxShadow = '0 -4px 12px rgba(216,92,140,0.3)';
    win.style.position = 'fixed';
    win.style.zIndex = ++zCounter;
    document.body.appendChild(win);
    document.getElementById('mobileOverlay').style.display = 'block';
  } else {
    win.style.width = cfg.width + 'px';
    win.style.height = cfg.height + 'px';
    win.style.left = (40 + Math.random() * 200) + 'px';
    win.style.top = (30 + Math.random() * 100) + 'px';
    win.style.zIndex = ++zCounter;
    document.getElementById('content').appendChild(win);
  }

  win.innerHTML =
    '<div class="window-title" data-app="' + appKey + '">' +
      '<span class="tit"><i class="fas ' + cfg.icon + '"></i> ' + cfg.title + '</span>' +
      '<span class="window-buttons">' +
        '<span class="btn-yellow" data-act="min">&minus;</span>' +
        '<span class="btn-green" data-act="max">+</span>' +
        '<span class="btn-pink" data-act="close">&times;</span>' +
      '</span>' +
    '</div>' +
    '<div class="window-body"></div>';

  cfg.build(win.querySelector('.window-body'), params);

  win.addEventListener('mousedown', () => focusWindow(win));

  win.querySelectorAll('.window-buttons span').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      const act = b.getAttribute('data-act');
      if (act === 'close') closeWindow(win);
      else if (act === 'min') minimizeWindow(win);
      else if (act === 'max') maximizeWindow(win);
    });
  });

  if (appKey !== 'dialog') openWindows[appKey] = win;
  focusWindow(win);

  const wc = document.querySelector('.welcome-card');
  if (wc) wc.classList.add('hidden');

  if (window.innerWidth <= 640) {
    document.getElementById('mobileOverlay').onclick = () => closeWindow(win);
  }
}

function focusWindow(win) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  win.style.zIndex = ++zCounter;
}

function closeWindow(win) {
  const key = win.getAttribute('data-app');
  win.remove();
  delete openWindows[key];
  document.getElementById('mobileOverlay').style.display = 'none';
  if (Object.keys(openWindows).length === 0) {
    const wc = document.querySelector('.welcome-card');
    if (wc) wc.classList.remove('hidden');
  }
}

function minimizeWindow(win) { win.style.display = 'none'; }

function maximizeWindow(win) {
  const content = document.getElementById('content');
  if (win.getAttribute('data-maximized')) {
    win.style.left = win.getAttribute('data-ol');
    win.style.top = win.getAttribute('data-ot');
    win.style.width = win.getAttribute('data-ow');
    win.style.height = win.getAttribute('data-oh');
    win.removeAttribute('data-maximized');
  } else {
    win.setAttribute('data-ol', win.style.left);
    win.setAttribute('data-ot', win.style.top);
    win.setAttribute('data-ow', win.style.width);
    win.setAttribute('data-oh', win.style.height);
    win.style.left = '0px';
    win.style.top = '0px';
    win.style.width = content.clientWidth - 4 + 'px';
    win.style.height = content.clientHeight - 4 + 'px';
    win.setAttribute('data-maximized', '1');
  }
}

function makeDraggable(win) {
  const title = win.querySelector('.window-title');
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

  title.addEventListener('mousedown', e => {
    if (e.target.closest('.window-buttons')) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    ox = parseInt(win.style.left) || 0;
    oy = parseInt(win.style.top) || 0;
    e.preventDefault();
    focusWindow(win);
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = (ox + e.clientX - sx) + 'px';
    win.style.top = (oy + e.clientY - sy) + 'px';
  });

  document.addEventListener('mouseup', () => { dragging = false; });
}

// ===== BUILDERS =====

function buildMail(body) {
  body.innerHTML =
    '<div class="mail-list">' +
      '<div class="mail-item" data-id="0"><span class="mail-from">Our Story</span><span class="mail-subject">Month 1 🌸</span></div>' +
      '<div class="mail-item" data-id="1"><span class="mail-from">Us</span><span class="mail-subject">Monthly reminder</span></div>' +
      '<div class="mail-item" data-id="2"><span class="mail-from">Forever</span><span class="mail-subject">You are loved</span></div>' +
    '</div>' +
    '<div class="mail-view" style="display:none"></div>';

  body.querySelectorAll('.mail-item').forEach(item => {
    item.addEventListener('click', () => {
      const list = body.querySelector('.mail-list');
      const view = body.querySelector('.mail-view');
      const id = item.getAttribute('data-id');
      const msgs = [
        'Hey sayang 💕\n\nHappy another month together!\n\nMonth 1 down, forever to go.\n\nYou make every day feel like an anniversary.\n\nLove you endlessly 💖',
        'Monthly check-in 📅\n\nJust wanted you to know:\nYou are my favorite notification.\nMy favorite hello.\nMy favorite everything.\n\nSee you soon 💕',
        'Random reminder:\nYou are loved more than you know.\nMore than words can say.\nMore than all the months combined.\n\nForever yours 💖'
      ];
      list.style.display = 'none';
      view.style.display = 'block';
      view.innerHTML = msgs[id].replace(/\n/g, '<br>') + '<br><button class="mail-back">← back</button>';
      view.querySelector('.mail-back').addEventListener('click', () => {
        list.style.display = '';
        view.style.display = 'none';
      });
    });
  });
}

function buildCats(body) {
  body.style.padding = '6px';
  function render(imgs) {
    let html = '<div class="cats-grid">';
    const total = imgs && imgs.length ? imgs.length : 24;
    for (let i = 0; i < total; i++) {
      const src = imgs && imgs.length ? imgs[i % imgs.length] : '';
      const bg = src ? 'background-image:url(' + src + ');' : 'background:#ffc0d5';
      const name = src.includes('evan') ? 'Evan 💕' : (src.includes('riki') ? 'Riki 💖' : 'Foto');
      html += '<div class="cat-cell" data-src="' + src + '" data-name="' + name + '" style="' + bg + 'background-size:cover;background-position:center;cursor:pointer;" title="' + name + '"></div>';
    }
    html += '</div>';
    body.innerHTML = html;

    body.querySelectorAll('.cat-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const src = cell.getAttribute('data-src');
        const name = cell.getAttribute('data-name');
        if (src) {
          openApp('dialog', { text: name, img: src });
        }
      });
    });
  }

  if (window.__imgCfg && window.__imgCfg.catsGrid) {
    render(window.__imgCfg.catsGrid);
  } else {
    fetch('config.json').then(r => r.json()).then(cfg => {
      window.__imgCfg = cfg;
      render(cfg.catsGrid || []);
    }).catch(() => render([]));
  }

  setTimeout(() => {
    if (!dialogShown) {
      dialogShown = true;
      openApp('dialog', { text: 'TOO MANY MEMORIES 💕', icon: '🥺' });
    }
  }, 800);
}

function buildDialog(body, params) {
  let content = '';
  if (params.img) {
    content = '<img src="' + params.img + '" style="max-width:100%;max-height:200px;border-radius:8px;border:2px solid var(--pink);margin-bottom:10px;object-fit:cover;display:block;margin-left:auto;margin-right:auto">';
  } else {
    content = '<div class="dialog-cat">' + (params.icon || '🥺') + '</div>';
  }
  body.innerHTML =
    '<div class="dialog-body">' +
      content +
      '<div class="dialog-text">' + (params.text || 'MESSAGE') + '</div>' +
      '<button class="dialog-btn">OK</button>' +
    '</div>';
  body.querySelector('.dialog-btn').addEventListener('click', () => {
    closeWindow(body.closest('.window'));
  });
}

function buildDraw(body) {
  body.innerHTML =
    '<div class="draw-toolbar">' +
      '<button class="tool-btn active" data-tool="pencil" title="Pencil"><i class="fas fa-pencil"></i></button>' +
      '<button class="tool-btn" data-tool="eraser" title="Eraser"><i class="fas fa-eraser"></i></button>' +
      '<button class="tool-btn" data-tool="bucket" title="Bucket"><i class="fas fa-fill"></i></button>' +
      '<button class="tool-btn" data-tool="clear" title="Clear"><i class="fas fa-trash"></i></button>' +
    '</div>' +
    '<canvas class="draw-canvas" width="260" height="200"></canvas>' +
    '<div class="palette">' +
      ['#ff8bb0','#ff6464','#ffa060','#ffd770','#a8e060','#60d8a8','#60b0ff','#a860ff','#ffffff','#3a3a3a'].map((c, i) => {
        return '<span class="swatch' + (i===0?' active':'') + '" data-color="' + c + '" style="background:' + c + '"></span>';
      }).join('') +
    '</div>';

  const canvas = body.querySelector('.draw-canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 260, 200);

  let tool = 'pencil';
  let color = '#ff8bb0';
  let drawing = false;

  body.querySelectorAll('.tool-btn').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.getAttribute('data-tool');
      body.querySelectorAll('.tool-btn').forEach(x => x.classList.remove('active'));
      if (t === 'clear') { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 260, 200); return; }
      b.classList.add('active');
      tool = t;
    });
  });

  body.querySelectorAll('.swatch').forEach(s => {
    s.addEventListener('click', () => {
      body.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
      s.classList.add('active');
      color = s.getAttribute('data-color');
    });
  });

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  }

  function startDraw(e) {
    drawing = true;
    if (tool === 'bucket') { ctx.fillStyle = color; ctx.fillRect(0, 0, 260, 200); return; }
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function moveDraw(e) {
    if (!drawing || tool === 'bucket') return;
    const p = getPos(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? 12 : 3;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw() { drawing = false; ctx.beginPath(); }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e); });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); moveDraw(e); });
  canvas.addEventListener('touchend', endDraw);
}

function buildFiles(body) {
  body.innerHTML =
    '<div class="file-grid">' +
      '<div class="file-item" data-app="cats"><i class="fas fa-images"></i>all_photos</div>' +
      '<div class="file-item" data-img="images/evan1.jpg"><i class="fas fa-file-image"></i>evan.jpg</div>' +
      '<div class="file-item" data-img="images/riki1.jpg"><i class="fas fa-file-image"></i>riki.jpg</div>' +
      '<div class="file-item" data-app="letters"><i class="fas fa-file-pdf"></i>our_story.pdf</div>' +
      '<div class="file-item" data-app="music"><i class="fas fa-file-audio"></i>our_song.mp3</div>' +
      '<div class="file-item" data-app="notes"><i class="fas fa-folder"></i>month 1</div>' +
      '<div class="file-item" data-app="notes"><i class="fas fa-folder"></i>month 2</div>' +
      '<div class="file-item" data-app="notes"><i class="fas fa-folder"></i>month 3</div>' +
    '</div>';

  body.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.getAttribute('data-img');
      const app = item.getAttribute('data-app');
      if (img) {
        openApp('dialog', { text: item.textContent, img: img });
      } else if (app) {
        openApp(app);
      }
    });
  });
}

function buildSave(body) {
  body.innerHTML =
    '<div class="save-grid">' +
      '<div class="save-row"><span>first_kiss.png</span><span>∞ KB</span></div>' +
      '<div class="save-row"><span>first_date.jpg</span><span>forever</span></div>' +
      '<div class="save-row"><span>month_1.txt</span><span>priceless</span></div>' +
      '<div class="save-row"><span>promise.sketch</span><span>eternal</span></div>' +
      '<div class="save-row"><span>forever.mp3</span><span>always</span></div>' +
    '</div>';
}

function buildWeb(body) {
  body.innerHTML =
    '<div class="web-body">' +
      '<div class="web-url">💕 https://ourlove.story/us</div>' +
      '<div class="web-content">' +
        '<h4>Our Little Corner of the Internet</h4>' +
        'Every month, another chapter.<br><br>' +
        'This is where we keep our memories safe.<br><br>' +
        'Month by month. Moment by moment.<br><br>' +
        'Made with 💕 and infinite love.' +
      '</div>' +
    '</div>';
}

function buildTrash(body) {
  body.innerHTML =
    '<div class="trash-body">' +
      '<div class="trash-cat">🥺</div>' +
      '<div>empty.<br>we dont throw away memories here</div>' +
      '<button class="trash-empty-btn">Clear Anyway</button>' +
    '</div>';
  body.querySelector('.trash-empty-btn').addEventListener('click', () => {
    body.innerHTML =
      '<div class="trash-body">' +
        '<div class="trash-cat">💕</div>' +
        '<div>still empty.<br>love cant be deleted</div>' +
      '</div>';
  });
}

function buildNotes(body) {
  body.innerHTML =
    '<div class="notes-list">' +
      '<div class="note-item"><div class="note-date">Month 1</div>first month down. forever to go 💕</div>' +
      '<div class="note-item"><div class="note-date">Month 2</div>learning you more every day. still my favorite.</div>' +
      '<div class="note-item"><div class="note-date">Month 3</div>three months of us. best decision ever.</div>' +
    '</div>';
}

function buildLetters(body) {
  const LETTERS = [
    { text: 'Happy mensiversary sayang 💕\n\nMonth 1 sudah lewat. Rasanya baru kemarin kita mulai cerita ini. Dan aku masih inget persis momen itu — waktu kita official, dan semuanya berubah jadi lebih indah.', sig: 'Selamanya, aku' },
    { text: 'Inget gak? First date kita waktu itu. Kamu pilih baju 3 jam sebelumnya, aku deg-degan. Dan ternyata obrolannya bisa berjam-jam tanpa berasa. Sejak hari itu aku tahu: aku gak mungkin cari yang lain. Kamu udah pas.', sig: 'Masih deg-degan juga' },
    { text: 'Ada banyak momen kecil yang aku suka.\n\nKamu yang selalu ngingetin aku makan. Kamu yang suka ngambek hal sepele tapi lucu. Kamu yang ketawa sampai sakit perut pas aku cerita hal random.\n\nMomen kecil ini yang bikin aku jatuh cinta setiap bulan.', sig: 'Yang selalu jatuh cinta' },
    { text: 'Di bulan ini kamu udah jadi alasan aku bangun pagi, alesan aku semangat, alasan semua mimpi ini layak dikejar.\n\nAku gak tau bulan depan kayak apa. Yang aku tau, kalau ada kamu di dalamnya, aku mau.', sig: 'Sampai bulan depan' },
    { text: 'Happy mensiversary, cintaku 💕\n\nIni cuma catatan kecil di website kita. Tapi ini dari hati yang paling dalam.\n\nI love you. Selalu. Gak peduli berapa bulan harus aku ulang.', sig: 'Forever yours' }
  ];
  const FOUND = {};
  let foundCountL = 0;
  const FINALE_QUOTES = [
    '5 surat = 5 bulan bersamamu.\n\nHappy mensiversary.\n\nSekarang balik ke desktop. Masih banyak kenangan lain 💕',
    'Setiap surat adalah 1 bulan cerita kita.\n\nKamu udah nemuin semuanya.\n\nSelamat mensiversary — semoga tahun ini lebih banyak lagi 🌸',
    'Kamu pikir ini cuma game. Padahal setiap surat tadi adalah pengingat:\n\nAku selalu mikirin kamu.\n\nHappy mensiversary.'
  ];

  body.innerHTML =
    '<div class="letters-scene">' +
      '<div class="ls-title">Find our months</div>' +
      '<div class="ls-counter">' +
        '<span id="lsFound">0</span>/5' +
      '</div>' +
      '<div class="ls-canvas">' +

        // Heart shape outline
        '<svg class="ls-heart-outline" viewBox="0 0 100 100"><path d="M50 85 C20 55, 5 30, 30 15 C40 12, 45 15, 50 25 C55 15, 60 12, 70 15 C95 30, 80 55, 50 85z" fill="#ff8bb0" opacity="0.2"/></svg>' +

        // Spots
        '<div class="ls-spot" data-l="0" style="top:32%;left:38%" title="click">1️⃣</div>' +
        '<div class="ls-spot" data-l="1" style="top:22%;left:55%" title="click">2️⃣</div>' +
        '<div class="ls-spot" data-l="2" style="top:48%;left:28%" title="click">3️⃣</div>' +
        '<div class="ls-spot" data-l="3" style="top:48%;left:65%" title="click">4️⃣</div>' +
        '<div class="ls-spot" data-l="4" style="top:62%;left:48%" title="click">5️⃣</div>' +

      '</div>' +
      '<div class="ls-modal" id="lsModal" style="display:none">' +
        '<div class="ls-card">' +
          '<div class="ls-heart">&#10084;&#65039;</div>' +
          '<div class="ls-text" id="lsText"></div>' +
          '<div class="ls-sign" id="lsSig"></div>' +
          '<button class="ls-close" id="lsClose">OK</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  const modal = body.querySelector('#lsModal');
  const lsText = body.querySelector('#lsText');
  const lsSig = body.querySelector('#lsSig');

  body.querySelectorAll('.ls-spot').forEach(spot => {
    spot.addEventListener('click', () => {
      const idx = parseInt(spot.getAttribute('data-l'));
      if (FOUND[idx]) return;
      FOUND[idx] = true;
      foundCountL++;
      spot.innerHTML = '💕';
      spot.style.opacity = '1';
      spot.style.transform = 'scale(1.4)';

      if (foundCountL >= 5) {
        modal.innerHTML =
          '<div class="ls-card finale-card">' +
            '<div class="ls-big">🎉</div>' +
            '<div class="ls-text" style="font-size:13px;line-height:1.6">' + FINALE_QUOTES[Math.floor(Math.random() * FINALE_QUOTES.length)] + '</div>' +
            '<div class="ls-sign" style="color:var(--pink-dark)">all months found</div>' +
            '<button class="ls-close" id="lsFinaleOk">start over</button>' +
          '</div>';
        modal.style.display = 'flex';
        body.querySelector('#lsFinaleOk').addEventListener('click', () => {
          closeWindow(body.closest('.window'));
          setTimeout(() => openApp('letters'), 200);
        });
      } else {
        lsText.textContent = LETTERS[idx].text;
        lsSig.textContent = '— ' + LETTERS[idx].sig;
        modal.style.display = 'flex';
      }
    });
  });

  body.querySelector('#lsClose').addEventListener('click', () => {
    modal.style.display = 'none';
    body.querySelector('#lsFound').textContent = foundCountL;
  });
}

function buildSunny(body) {
  body.innerHTML =
    '<div style="text-align:center;padding:18px">' +
      '<div style="font-size:60px">🌸</div>' +
      '<div style="font-size:14px;line-height:1.5;margin-top:10px">vibe hari ini:<br><b>grateful for us</b><br>every month with you 💕</div>' +
    '</div>';
}

function buildMusic(body) {
  body.innerHTML =
    '<div style="text-align:center;padding:12px">' +
      '<div style="font-size:48px">🎵</div>' +
      '<div style="font-family:VT323,monospace;font-size:20px;color:var(--pink-dark);margin:10px 0">Our Song</div>' +
      '<div style="font-size:14px;line-height:1.5;color:#666;margin-bottom:16px">Backsound bulan ini</div>' +
      '<iframe width="100%" height="80" src="https://www.youtube.com/embed/jStNaVCW838?autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3" ' +
      'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius:10px;border:2px solid var(--pink-light)"></iframe>' +
      '<div style="font-size:12px;color:#888;margin-top:8px">Klik play jika tidak auto</div>' +
    '</div>';
}

function buildTime(body) {
  body.innerHTML =
    '<div style="text-align:center;padding:18px">' +
      '<div id="bigTime" style="font-family:VT323,monospace;font-size:48px;color:var(--pink-dark);line-height:1">00:00</div>' +
      '<div id="bigDate" style="font-size:12px;margin-top:6px;color:#888">memuat</div>' +
    '</div>';
  function tick() {
    const now = new Date();
    const t = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const d = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const tt = document.getElementById('bigTime');
    const dd = document.getElementById('bigDate');
    if (tt) tt.textContent = t;
    if (dd) dd.textContent = d;
  }
  tick();
  setInterval(tick, 1000);
}

function buildChanteii(body) {
  body.innerHTML =
    '<div style="text-align:center;padding:14px">' +
      '<div style="font-size:42px">💕</div>' +
      '<div style="font-family:VT323,monospace;font-size:22px;color:var(--pink-dark);margin-top:8px">for you</div>' +
      '<div style="font-size:13px;line-height:1.5;margin-top:8px;color:#666">' +
        'every month, every moment<br><b>for you</b><br><br>' +
        'happy mensiversary sayang<br>month by month, forever 💕' +
      '</div>' +
      '<div style="font-size:24px;margin-top:10px">💕🌸💕</div>' +
    '</div>';
}

// ===== SIDEBAR, DOCK & MOBILE TABS =====
document.querySelectorAll('.sidebar-icon, .dock-item, .mobile-tab').forEach(icon => {
  icon.addEventListener('click', () => {
    openApp(icon.getAttribute('data-app'));
  });
});

// ===== CLOCK =====
setInterval(() => {
  const now = new Date();
  const t = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const el = document.getElementById('dockTime');
  if (el) el.textContent = t;
}, 1000);

// ===== BOOT =====
fetch('config.json')
  .then(r => r.json())
  .then(cfg => { window.__imgCfg = cfg; })
  .catch(() => { window.__imgCfg = { catsGrid: [] }; })
  .finally(() => setTimeout(() => openApp('cats'), 100));