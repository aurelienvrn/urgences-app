let data = {};

async function init() {
  const res = await fetch('data.json');
  data = await res.json();

  document.getElementById('app-title').textContent = data.app.nom;
  document.querySelector('meta[name="theme-color"]').content = data.app.couleur;

  buildSosGrid();
  buildProcList();
}

function buildSosGrid() {
  const grid = document.getElementById('sos-grid');
  grid.innerHTML = '';
  data.contacts_urgence.forEach(cat => {
    const nums = cat.contacts.map(c => c.telephone).join(' • ');
    const btn = document.createElement('div');
    btn.className = 'sos-btn';
    btn.innerHTML = `
      <div class="sos-icon">${cat.icone}</div>
      <div class="sos-btn-label">${cat.label}</div>
      <div class="sos-btn-sub">${nums}</div>
    `;
    btn.onclick = () => showModal(cat);
    grid.appendChild(btn);
  });
}

function buildProcList() {
  const list = document.getElementById('proc-list');
  list.innerHTML = '';
  data.procedures.forEach(proc => {
    const item = document.createElement('div');
    item.className = 'proc-item';
    item.innerHTML = `
      <div class="proc-dot">${proc.icone}</div>
      <div class="proc-info">
        <div class="proc-name">${proc.titre}</div>
        <div class="proc-tag">${proc.categorie}</div>
      </div>
      <div class="proc-arrow">›</div>
    `;
    item.onclick = () => showDetail(proc);
    list.appendChild(item);
  });
}

function showDetail(proc) {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('detail-screen').style.display = 'block';
  document.getElementById('back-btn').style.display = 'block';
  document.getElementById('app-title').textContent = proc.titre;

  const body = document.getElementById('detail-body');
  body.innerHTML = '';

  const imgDiv = document.createElement('div');
  if (proc.image) {
    imgDiv.innerHTML = `<img id="proc-image" src="${proc.image}" alt="${proc.titre}" onerror="this.parentNode.innerHTML='<div id=\\'image-placeholder\\'><span style=\\'font-size:40px\\'>🖼️</span><span style=\\'color:#aaa;font-size:13px\\'>Image à ajouter</span></div>'">`;
  } else {
    imgDiv.innerHTML = `<div id="image-placeholder"><span style="font-size:40px">🖼️</span><span style="color:#aaa;font-size:13px">Image à ajouter</span></div>`;
  }
  body.appendChild(imgDiv);

  if (proc.contacts_lies && proc.contacts_lies.length > 0) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `<div class="contact-card-title">Personnes à contacter</div>`;

    proc.contacts_lies.forEach(catId => {
      const cat = data.contacts_urgence.find(c => c.id === catId);
      if (!cat) return;
      cat.contacts.forEach(contact => {
        const initiales = contact.nom.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const item = document.createElement('div');
        item.className = 'contact-item';
        item.innerHTML = `
          <div class="contact-avatar">${initiales}</div>
          <div class="contact-info">
            <div class="contact-name">${contact.nom}</div>
            <div class="contact-num">${contact.telephone}</div>
          </div>
          <div class="contact-btns">
            <button class="btn-call" onclick="appeler('${contact.telephone}')" title="Appeler">📞</button>
            ${contact.sms ? `<button class="btn-sms" onclick="envoyerSms('${contact.telephone}')" title="SMS">💬</button>` : ''}
          </div>
        `;
        card.appendChild(item);
      });
    });
    body.appendChild(card);
  }
}

function goHome() {
  document.getElementById('home-screen').style.display = 'block';
  document.getElementById('detail-screen').style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('app-title').textContent = data.app.nom;
}

function showModal(cat) {
  document.getElementById('modal-title').textContent = cat.icone + ' ' + cat.label;
  const content = document.getElementById('modal-content');
  content.innerHTML = '';

  cat.contacts.forEach(contact => {
    const div = document.createElement('div');
    div.className = 'modal-contact-btn';
    div.innerHTML = `
      <div class="modal-contact-icon">👤</div>
      <div class="modal-contact-info" style="flex:1">
        <div class="modal-contact-name">${contact.nom}</div>
        <div class="modal-contact-num">${contact.telephone}</div>
      </div>
    `;
    const btns = document.createElement('div');
    btns.className = 'modal-btns';
    btns.innerHTML = `<button class="modal-btn-call" onclick="appeler('${contact.telephone}')">📞 Appeler</button>`;
    if (contact.sms) {
      btns.innerHTML += `<button class="modal-btn-sms" onclick="envoyerSms('${contact.telephone}')">💬 SMS</button>`;
    }
    div.appendChild(btns);
    content.appendChild(div);
  });

  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

function appeler(numero) {
  window.location.href = `tel:${numero}`;
}

function envoyerSms(numero) {
  window.location.href = `sms:${numero}`;
}

init();
