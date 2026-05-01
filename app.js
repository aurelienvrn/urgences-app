let data = {};
let isAdmin = false;

const GITHUB_REPO = 'aurelienvrn/urgences-app';
const GITHUB_FILE = 'data.json';
const ADMIN_USER = 'PEP76ROUENURGENCEAPP';
const ADMIN_PASS = 'ADMINPEP76ROUENURGENCEAPP';

async function init() {
  const res = await fetch('data.json?t=' + Date.now());
  data = await res.json();
  document.getElementById('app-title').textContent = data.app.nom;
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
            <button class="btn-call" onclick="appeler('${contact.telephone}')">📞</button>
            ${contact.sms ? `<button class="btn-sms" onclick="envoyerSms('${contact.telephone}', '${contact.message || ''}')">💬</button>` : ''}
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
  document.getElementById('login-screen').classList.remove('show');
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('app-title').textContent = data.app.nom;
}

function showLogin() {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('detail-screen').style.display = 'none';
  document.getElementById('login-screen').classList.add('show');
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('app-title').textContent = 'Connexion';
}

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    document.getElementById('login-screen').classList.remove('show');
    document.getElementById('login-error').style.display = 'none';
    showAdmin();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

function showModal(cat) {
  document.getElementById('modal-title').textContent = cat.icone + ' ' + cat.label;
  const content = document.getElementById('modal-content');
  content.innerHTML = '';
  cat.contacts.forEach(contact => {
    const div = document.createElement('div');
    div.className = 'modal-contact-btn';
    div.innerHTML = `
      <div class="modal-contact-info">
        <div class="modal-contact-icon">👤</div>
        <div style="flex:1">
          <div class="modal-contact-name">${contact.nom}</div>
          <div class="modal-contact-num">${contact.telephone}</div>
        </div>
      </div>
      <div class="modal-btns">
        <button class="modal-btn-call" onclick="appeler('${contact.telephone}')">📞 Appeler</button>
        ${contact.sms ? `<button class="modal-btn-sms" onclick="envoyerSms('${contact.telephone}', '${contact.message || ''}')">💬 SMS</button>` : ''}
      </div>
    `;
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

function envoyerSms(numero, message) {
  const encoded = message ? encodeURIComponent(message) : '';
  window.location.href = `sms:${numero}${encoded ? '?body=' + encoded : ''}`;
}

async function saveToGithub() {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });
  const fileInfo = await getRes.json();
  const putRes = await fetch('/.netlify/functions/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content, sha: fileInfo.sha })
  });
  return putRes.ok;
}

function showAdmin() {
  document.getElementById('app-title').textContent = '⚙️ Administration';
  document.getElementById('back-btn').style.display = 'block';
  const body = document.getElementById('detail-screen');
  body.style.display = 'block';
  body.innerHTML = `
    <div id="detail-body">
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">

        <div style="background:#fff;border-radius:12px;border:1px solid #eee;overflow:hidden;">
          <div style="background:#D32F2F;padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;" onclick="toggleSection('contacts-section')">
            <span style="color:#fff;font-weight:700;font-size:15px;">🔴 Modifier les contacts d'urgence</span>
            <span style="color:#fff;font-size:18px;" id="contacts-arrow">▼</span>
          </div>
          <div id="contacts-section" style="padding:16px;display:flex;flex-direction:column;gap:16px;">
            ${data.contacts_urgence.map((cat, ci) => `
              <div style="border:1px solid #eee;border-radius:10px;padding:14px;">
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
                  <input value="${cat.icone}" style="width:50px;padding:8px;border:1px solid #eee;border-radius:8px;font-size:18px;text-align:center;" id="cat-icone-${ci}">
                  <input value="${cat.label}" style="flex:1;padding:8px;border:1px solid #eee;border-radius:8px;font-size:14px;" id="cat-label-${ci}">
                </div>
                ${cat.contacts.map((c, cj) => `
                  <div style="background:#f9f9f9;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;flex-direction:column;gap:6px;">
                    <input value="${c.nom}" placeholder="Nom" style="padding:8px;border:1px solid #eee;border-radius:8px;font-size:13px;" id="c-nom-${ci}-${cj}">
                    <input value="${c.telephone}" placeholder="Téléphone" style="padding:8px;border:1px solid #eee;border-radius:8px;font-size:13px;" id="c-tel-${ci}-${cj}">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input type="checkbox" ${c.sms ? 'checked' : ''} id="c-sms-${ci}-${cj}">
                      <label style="font-size:13px;color:#555;">SMS activé</label>
                    </div>
                    <input value="${c.message || ''}" placeholder="Message SMS pré-rédigé (optionnel)" style="padding:8px;border:1px solid #eee;border-radius:8px;font-size:13px;" id="c-msg-${ci}-${cj}">
                  </div>
                `).join('')}
              </div>
            `).join('')}
            <button onclick="saveContacts()" style="padding:14px;background:#D32F2F;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">💾 Sauvegarder les contacts</button>
          </div>
        </div>

        <div style="background:#fff;border-radius:12px;border:1px solid #eee;overflow:hidden;">
          <div style="background:#1a1a1a;padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;" onclick="toggleSection('procs-section')">
            <span style="color:#fff;font-weight:700;font-size:15px;">📋 Gérer les procédures</span>
            <span style="color:#fff;font-size:18px;" id="procs-arrow">▼</span>
          </div>
          <div id="procs-section" style="padding:16px;display:flex;flex-direction:column;gap:10px;">
            <div id="procs-list">
              ${data.procedures.map((proc, pi) => `
                <div style="background:#f9f9f9;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;margin-bottom:8px;">
                  <div style="display:flex;gap:8px;">
                    <input value="${proc.icone}" style="width:50px;padding:8px;border:1px solid #eee;border-radius:8px;font-size:18px;text-align:center;" id="p-icone-${pi}">
                    <input value="${proc.titre}" style="flex:1;padding:8px;border:1px solid #eee;border-radius:8px;font-size:13px;" id="p-titre-${pi}">
                  </div>
                  <input value="${proc.categorie}" placeholder="Catégorie" style="padding:8px;border:1px solid #eee;border-radius:8px;font-size:13px;" id="p-cat-${pi}">
                  <input value="${proc.image || ''}" placeholder="URL de l'image (ex: images/evacuation.jpg)" style="padding:8px;border:1px solid #eee;border-radius:8px;font-size:13px;" id="p-img-${pi}">
                  <button onclick="deleteProc(${pi})" style="padding:8px;background:#fff;border:1px solid #ffcdd2;border-radius:8px;color:#D32F2F;font-size:13px;cursor:pointer;">🗑️ Supprimer cette procédure</button>
                </div>
              `).join('')}
            </div>
            <button onclick="addProc()" style="padding:12px;background:#f0f0f0;border:1px dashed #ccc;border-radius:10px;font-size:14px;cursor:pointer;">+ Ajouter une procédure</button>
            <button onclick="saveProcs()" style="padding:14px;background:#1a1a1a;border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">💾 Sauvegarder les procédures</button>
          </div>
        </div>

        <button onclick="logout()" style="padding:12px;background:none;border:1px solid #eee;border-radius:10px;color:#888;font-size:13px;cursor:pointer;">Se déconnecter</button>
      </div>
    </div>
  `;
}

function toggleSection(id) {
  const section = document.getElementById(id);
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? 'flex' : 'none';
  if (id === 'contacts-section') document.getElementById('contacts-arrow').textContent = isHidden ? '▼' : '▶';
  if (id === 'procs-section') document.getElementById('procs-arrow').textContent = isHidden ? '▼' : '▶';
}

async function saveContacts() {
  data.contacts_urgence.forEach((cat, ci) => {
    cat.icone = document.getElementById(`cat-icone-${ci}`).value;
    cat.label = document.getElementById(`cat-label-${ci}`).value;
    cat.contacts.forEach((c, cj) => {
      c.nom = document.getElementById(`c-nom-${ci}-${cj}`).value;
      c.telephone = document.getElementById(`c-tel-${ci}-${cj}`).value;
      c.sms = document.getElementById(`c-sms-${ci}-${cj}`).checked;
      c.message = document.getElementById(`c-msg-${ci}-${cj}`).value;
    });
  });
  const ok = await saveToGithub();
  alert(ok ? '✅ Contacts sauvegardés !' : '❌ Erreur de sauvegarde. Vérifiez le token GitHub.');
}

function addProc() {
  data.procedures.push({
    id: 'nouvelle-proc-' + Date.now(),
    titre: 'Nouvelle procédure',
    icone: '📄',
    categorie: 'Général',
    image: '',
    contacts_lies: []
  });
  showAdmin();
}

function deleteProc(index) {
  if (confirm('Supprimer cette procédure ?')) {
    data.procedures.splice(index, 1);
    showAdmin();
  }
}

async function saveProcs() {
  data.procedures.forEach((proc, pi) => {
    proc.icone = document.getElementById(`p-icone-${pi}`).value;
    proc.titre = document.getElementById(`p-titre-${pi}`).value;
    proc.categorie = document.getElementById(`p-cat-${pi}`).value;
    proc.image = document.getElementById(`p-img-${pi}`).value;
  });
  const ok = await saveToGithub();
  alert(ok ? '✅ Procédures sauvegardées !' : '❌ Erreur de sauvegarde. Vérifiez le token GitHub.');
}

function logout() {
  isAdmin = false;
  goHome();
  buildSosGrid();
  buildProcList();
}

init();
