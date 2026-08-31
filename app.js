/* All document handling in this file runs inside the visitor's browser. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { record: {}, pendingZip: null, sourceFile: null };
  const supportUrl = ''; // Optional: set to a Buy Me a Coffee URL before publishing.
  const el = { file: $('file'), dropzone: $('dropzone'), unlockPanel: $('unlock-panel'), share: $('share'), status: $('status'), loading: $('loading'), loadingText: $('loading-text'), result: $('result'), photo: $('photo'), avatar: $('avatar') };

  const clean = (value) => String(value ?? '').trim();
  const value = (node, ...names) => { for (const name of names) { const found = node?.getAttribute?.(name); if (clean(found)) return clean(found); } return ''; };
  const setStatus = (message, type = '') => { el.status.textContent = message; el.status.className = `status-line ${type}`; };
  const setLoading = (visible, message = 'Preparing your file…') => { el.loading.hidden = !visible; el.loadingText.textContent = message; };
  const display = (id, text, fallback = 'Not found') => { $(id).textContent = text || fallback; };
  const formatAddress = (poa) => ['house', 'street', 'lm', 'loc', 'vtc', 'subdist', 'dist', 'state', 'pc', 'po'].map((key) => clean(poa?.getAttribute(key))).filter(Boolean).join(', ');
  const isZip = (file) => file && (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed');

  function resetRecord() {
    state.record = {}; state.pendingZip = null; state.sourceFile = null;
    el.file.value = ''; el.share.value = ''; el.unlockPanel.hidden = true; el.result.hidden = true;
    el.photo.hidden = true; el.photo.removeAttribute('src'); el.avatar.hidden = false;
    document.querySelectorAll('[data-toggle]').forEach((button) => { button.textContent = 'Reveal'; });
  }

  function showRecord(xml, fileName) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('This does not appear to be a valid XML file.');
    const root = doc.documentElement;
    const poi = root.querySelector('Poi'); const poa = root.querySelector('Poa'); const pht = root.querySelector('Pht'); const uidData = root.querySelector('UidData');
    const modern = Boolean(uidData || poi || poa || pht);
    const rootAttr = (...names) => value(root, ...names);
    const photoData = modern ? clean(pht?.textContent).replace(/\s/g, '') : rootAttr('i');
    state.record = {
      name: modern ? value(poi, 'name') : rootAttr('n', 'name'),
      dob: modern ? value(poi, 'dob') : rootAttr('d', 'dob'),
      gender: modern ? value(poi, 'gender') : rootAttr('g', 'gender'),
      uid: modern ? (rootAttr('referenceId', 'ref', 'uid', 'eKycId', 'ekycId') || value(uidData, 'referenceId')) : rootAttr('r', 'ref', 'uid', 'eKycId', 'ekycId'),
      address: modern ? formatAddress(poa) : rootAttr('a', 'address'),
      mobile: modern ? value(poi, 'm', 'mobile') : rootAttr('m', 'mobile'),
      email: modern ? value(poi, 'e', 'email') : rootAttr('e', 'email')
    };
    const r = state.record;
    display('f-name', r.name); display('f-dob', r.dob); display('f-gender', r.gender); display('f-uid', r.uid); display('f-address', r.address);
    $('name').textContent = r.name || 'Identity details'; $('gender-pill').textContent = `Gender ${r.gender || '—'}`; $('dob-pill').textContent = `Date of birth ${r.dob || '—'}`;
    $('f-mobile').textContent = '••••••••••••••••'; $('f-email').textContent = '••••••••••••••••';
    $('file-name').textContent = fileName;
    $('metadata').textContent = JSON.stringify({ file: fileName, root: root.tagName, format: modern ? 'OfflinePaperlessKyc' : 'OKY', photo: photoData ? 'Detected' : 'Not detected', mobileHash: r.mobile ? 'Detected' : 'Not detected', emailHash: r.email ? 'Detected' : 'Not detected' }, null, 2);
    el.photo.hidden = true; el.avatar.hidden = false;
    if (photoData) {
      el.photo.onload = () => { el.photo.hidden = false; el.avatar.hidden = true; };
      el.photo.onerror = () => { el.photo.onerror = null; el.photo.src = `data:image/jp2;base64,${photoData}`; };
      el.photo.src = `data:image/jpeg;base64,${photoData}`;
    }
    el.result.hidden = false; setStatus(`Opened locally · ${fileName}`, 'success');
    window.setTimeout(() => el.result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 50);
  }

  function u16(bytes, offset) { return bytes[offset] | (bytes[offset + 1] << 8); }
  function u32(bytes, offset) { return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0; }
  function crc32Byte(crc, byte) { crc ^= byte; for (let index = 0; index < 8; index += 1) crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) : (crc >>> 1); return crc >>> 0; }
  function decryptZipCrypto(data, password) {
    const passwordBytes = new TextEncoder().encode(password); let k0 = 0x12345678 >>> 0; let k1 = 0x23456789 >>> 0; let k2 = 0x34567890 >>> 0;
    const update = (byte) => { k0 = crc32Byte(k0, byte); k1 = (Math.imul((k1 + (k0 & 255)) >>> 0, 134775813) + 1) >>> 0; k2 = crc32Byte(k2, (k1 >>> 24) & 255); };
    passwordBytes.forEach(update); const output = new Uint8Array(data.length);
    for (let index = 0; index < data.length; index += 1) { const temp = (k2 | 2) >>> 0; const key = (Math.imul(temp, (temp ^ 1) >>> 0) >>> 8) & 255; const plain = data[index] ^ key; output[index] = plain; update(plain); }
    return output;
  }
  async function inflate(raw) {
    if (!('DecompressionStream' in window)) throw new Error('This browser cannot decompress this ZIP locally. Please import the XML instead or update your browser.');
    const stream = new DecompressionStream('deflate-raw');
    return new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(stream)).arrayBuffer());
  }
  async function unzipXml(file, password) {
    const bytes = new Uint8Array(await file.arrayBuffer()); let eocd = -1;
    for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) if (u32(bytes, index) === 0x06054b50) { eocd = index; break; }
    if (eocd < 0) throw new Error('That ZIP file is incomplete or invalid.');
    const centralSize = u32(bytes, eocd + 12); const centralOffset = u32(bytes, eocd + 16); let position = centralOffset;
    while (position < centralOffset + centralSize) {
      if (u32(bytes, position) !== 0x02014b50) break;
      const flags = u16(bytes, position + 8); const method = u16(bytes, position + 10); const crc = u32(bytes, position + 16); const compressedSize = u32(bytes, position + 20); const nameLength = u16(bytes, position + 28); const extraLength = u16(bytes, position + 30); const localOffset = u32(bytes, position + 42); const name = new TextDecoder().decode(bytes.slice(position + 46, position + 46 + nameLength));
      if (!name.endsWith('/') && name.toLowerCase().endsWith('.xml')) {
        if (![0, 8].includes(method)) throw new Error('This ZIP uses an unsupported compression method.');
        if (u32(bytes, localOffset) !== 0x04034b50) throw new Error('This ZIP entry is invalid.');
        const localNameLength = u16(bytes, localOffset + 26); const localExtraLength = u16(bytes, localOffset + 28); let raw = bytes.slice(localOffset + 30 + localNameLength + localExtraLength, localOffset + 30 + localNameLength + localExtraLength + compressedSize);
        if (flags & 1) { if (!password) throw new Error('Enter the Share Code to unlock this ZIP.'); const decrypted = decryptZipCrypto(raw, password); if (decrypted.length < 12) throw new Error('Incorrect Share Code or unsupported ZIP encryption.'); const check = decrypted[11]; const expected = (flags & 8) ? ((u16(bytes, localOffset + 10) >>> 8) & 255) : ((crc >>> 24) & 255); if (check !== expected) throw new Error('Incorrect Share Code or unsupported ZIP encryption.'); raw = decrypted.slice(12); }
        const output = method === 0 ? raw : await inflate(raw); return [new TextDecoder('utf-8').decode(output), name];
      }
      position += 46 + nameLength + extraLength + u16(bytes, position + 32);
    }
    throw new Error('No XML record was found inside this ZIP.');
  }

  async function loadFile(file) {
    if (!file) return; resetRecord(); state.sourceFile = file;
    try {
      if (isZip(file)) { state.pendingZip = file; $('pending-file').textContent = file.name; el.unlockPanel.hidden = false; el.share.focus(); setStatus('ZIP selected · enter the Share Code to unlock it locally.'); return; }
      if (!file.name.toLowerCase().endsWith('.xml') && !/xml/.test(file.type)) throw new Error('Choose an Aadhaar Offline eKYC ZIP or XML file.');
      setLoading(true, 'Reading XML on this device…'); showRecord(await file.text(), file.name);
    } catch (error) { setStatus(error.message || 'Unable to open this file.', 'error'); }
    finally { setLoading(false); }
  }
  async function unlock() {
    if (!state.pendingZip) return;
    try { setLoading(true, 'Decrypting ZIP on this device…'); $('unlock').disabled = true; const [xml, name] = await unzipXml(state.pendingZip, el.share.value.trim()); el.unlockPanel.hidden = true; showRecord(xml, name); }
    catch (error) { setStatus(error.message || 'Unable to unlock this ZIP.', 'error'); }
    finally { $('unlock').disabled = false; setLoading(false); }
  }
  async function copy(text, button) { if (!text) return; try { await navigator.clipboard.writeText(text); const original = button?.textContent; if (button) { button.textContent = 'Copied'; setTimeout(() => { button.textContent = original; }, 1300); } } catch { setStatus('Copy is unavailable in this browser.', 'error'); } }

  el.file.addEventListener('change', (event) => loadFile(event.target.files[0]));
  $('unlock').addEventListener('click', unlock); el.share.addEventListener('keydown', (event) => { if (event.key === 'Enter') unlock(); });
  $('change-file').addEventListener('click', () => { resetRecord(); el.file.click(); });
  ['dragenter', 'dragover'].forEach((eventName) => el.dropzone.addEventListener(eventName, (event) => { event.preventDefault(); el.dropzone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((eventName) => el.dropzone.addEventListener(eventName, (event) => { event.preventDefault(); el.dropzone.classList.remove('drag'); }));
  el.dropzone.addEventListener('drop', (event) => loadFile(event.dataTransfer.files[0]));
  el.dropzone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); el.file.click(); } });
  document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', () => copy(state.record[button.dataset.copy], button)));
  $('copy-all').addEventListener('click', (event) => copy(['Name', 'Date of birth', 'Gender', 'Reference ID', 'Address', 'Mobile hash', 'Email hash'].map((label, index) => `${label}: ${state.record[['name', 'dob', 'gender', 'uid', 'address', 'mobile', 'email'][index]] || ''}`).join('\n'), event.currentTarget));
  document.querySelectorAll('[data-toggle]').forEach((button) => button.addEventListener('click', () => { const key = button.dataset.toggle; const field = $(`f-${key}`); const revealed = !field.classList.contains('masked'); field.textContent = revealed ? '••••••••••••••••' : (state.record[key] || 'Not detected'); field.classList.toggle('masked', !revealed); button.textContent = revealed ? 'Reveal' : 'Hide'; }));
  $('clear').addEventListener('click', () => { resetRecord(); setStatus('Session cleared. Nothing was stored.'); window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  $('how-button').addEventListener('click', (event) => { const panel = $('how-panel'); panel.hidden = !panel.hidden; event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden)); });
  if (supportUrl) { const link = $('support-link'); link.href = supportUrl; link.hidden = false; }
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
