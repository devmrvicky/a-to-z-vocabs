/* =====================================================
   MODAL SYSTEM — generic reusable modal
===================================================== */

function openModal({ title, body, footer, wide = false }) {
  let overlay = document.getElementById('genericModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id        = 'genericModal';
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeGenericModal();
    });
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
<div class="modal-box ${wide ? 'modal-box-wide' : ''}">
  <div class="modal-header">
    <h2>${title}</h2>
    <button class="modal-close" onclick="closeGenericModal()">✕</button>
  </div>
  <div class="modal-body">${body}</div>
  ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
</div>`;

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeGenericModal() {
  const overlay = document.getElementById('genericModal');
  if (overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/* ---- TOAST ---- */

function showToast(msg, duration = 2500) {
  const existing = document.getElementById('appToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'appToast';
  toast.className = 'app-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  // Trigger reflow for animation
  toast.offsetHeight;
  toast.classList.add('app-toast-visible');

  setTimeout(() => {
    toast.classList.remove('app-toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
