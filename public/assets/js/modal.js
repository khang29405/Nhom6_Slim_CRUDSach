// modal.js - Hộp thoại (modal) xác nhận và thông báo dùng chung
//
// Cách dùng (nạp file này sau api.js và trước file JS của trang):
//
//   const answer = await Modal.confirm({
//       title: 'Xóa sách này?',
//       message: 'Nội dung giải thích...',
//       confirmText: 'Xóa sách',      // chữ trên nút đồng ý
//       cancelText: 'Hủy',            // chữ trên nút hủy
//       danger: true,                 // true: nút đồng ý màu đỏ, nút Hủy được chọn sẵn
//       onConfirm: function () { return deleteBook(5); }   // (tùy chọn) chạy khi bấm đồng ý,
//   });                                                    // modal giữ nguyên và hiện "Đang xử lý..." cho đến khi xong
//   // answer = { confirmed: true | false, result: giá trị onConfirm trả về }
//
//   await Modal.notice({
//       type: 'success',              // 'success' | 'error' | 'info'
//       title: 'Đã xóa sách',
//       message: 'Xóa sách thành công',
//       buttonText: 'Đóng',           // (tùy chọn)
//       autoClose: 2000               // (tùy chọn) tự đóng sau số mili giây này
//   });
//
// Đóng modal: bấm nút, nhấn phím Esc hoặc bấm ra ngoài hộp thoại.
// CSS của modal nằm ngay trong file này (tự thêm vào trang) nên không phải sửa style.css dùng chung.
// Toàn bộ code nằm trong một hàm bọc, chỉ đưa ra ngoài đúng một tên: Modal.
(function () {
    const STYLE_ID = 'app-modal-style';
    const FADE_MS  = 180;

    const CSS = `
.app-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(15, 23, 42, 0.55);
    opacity: 0;
    transition: opacity ${FADE_MS}ms ease;
}
.app-modal-overlay.is-open {
    opacity: 1;
}
.app-modal {
    width: 100%;
    max-width: 440px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    padding: 28px 28px 22px;
    border-radius: 12px;
    background: var(--color-surface, #ffffff);
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.35);
    text-align: center;
    transform: translateY(12px) scale(0.97);
    transition: transform ${FADE_MS}ms ease;
}
.app-modal-overlay.is-open .app-modal {
    transform: none;
}
.app-modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 50%;
}
.app-modal-icon svg {
    width: 28px;
    height: 28px;
}
.app-modal-icon.is-danger,
.app-modal-icon.is-error {
    background: #fee2e2;
    color: var(--color-danger, #dc2626);
}
.app-modal-icon.is-success {
    background: #dcfce7;
    color: var(--color-success, #15803d);
}
.app-modal-icon.is-info {
    background: #dbeafe;
    color: var(--color-primary, #2563eb);
}
.app-modal-title {
    margin: 0 0 8px;
    font-size: 1.25rem;
}
.app-modal-message {
    margin: 0 0 22px;
    color: var(--color-muted, #6b7785);
    overflow-wrap: anywhere;
    white-space: pre-line;
}
.app-modal-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
}
.app-modal-actions .btn {
    min-width: 110px;
}
body.app-modal-open {
    overflow: hidden;
}
@media (prefers-reduced-motion: reduce) {
    .app-modal-overlay,
    .app-modal {
        transition: none;
    }
}
`;

    // Biểu tượng (SVG tĩnh, không chứa dữ liệu người dùng)
    const SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
                     'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    const ICONS = {
        danger:  SVG_OPEN + '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
                 '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>' +
                 '<line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
        success: SVG_OPEN + '<polyline points="20 6 9 17 4 12"/></svg>',
        error:   SVG_OPEN + '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>' +
                 '<line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info:    SVG_OPEN + '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>' +
                 '<line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    let counter = 0;   // để mỗi modal có id riêng cho aria-labelledby

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function makeButton(text, className) {
        const btn = el('button', 'btn ' + className, text);
        btn.type = 'button';
        return btn;
    }

    // Dựng và hiện một modal.
    // cfg: { kind, role, title, message, buttons: [{ text, className, onClick }], focusIndex, autoClose, onCancel }
    // Trả về { close(value), promise }
    function show(cfg, resolve) {
        ensureStyle();
        const id = ++counter;
        const previousFocus = document.activeElement;

        const overlay = el('div', 'app-modal-overlay');
        const dialog  = el('div', 'app-modal');
        dialog.setAttribute('role', cfg.role);
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'app-modal-title-' + id);
        dialog.setAttribute('aria-describedby', 'app-modal-message-' + id);

        const icon = el('div', 'app-modal-icon is-' + cfg.kind);
        icon.innerHTML = ICONS[cfg.kind] || ICONS.info;

        const title = el('h2', 'app-modal-title', cfg.title);
        title.id = 'app-modal-title-' + id;

        const message = el('p', 'app-modal-message', cfg.message);
        message.id = 'app-modal-message-' + id;

        const actions = el('div', 'app-modal-actions');
        const buttons = cfg.buttons.map(function (b) {
            const btn = makeButton(b.text, b.className);
            btn.addEventListener('click', function () { b.onClick(btn); });
            actions.appendChild(btn);
            return btn;
        });

        dialog.append(icon, title, message, actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        document.body.classList.add('app-modal-open');
        requestAnimationFrame(function () { overlay.classList.add('is-open'); });

        let closed = false;
        let timer = null;

        function close(value) {
            if (closed) return;
            closed = true;
            clearTimeout(timer);
            document.removeEventListener('keydown', onKeydown, true);
            overlay.classList.remove('is-open');
            setTimeout(function () {
                overlay.remove();
                // Chỉ trả lại trạng thái trang khi không còn modal nào khác đang mở
                if (!document.querySelector('.app-modal-overlay')) {
                    document.body.classList.remove('app-modal-open');
                    if (previousFocus && document.contains(previousFocus) && previousFocus.focus) {
                        previousFocus.focus();
                    }
                }
            }, FADE_MS);
            resolve(value);
        }

        // Esc hoặc bấm ra ngoài = hủy (không làm được khi đang xử lý)
        function cancel() {
            if (cfg.isBusy && cfg.isBusy()) return;
            cfg.onCancel(close);
        }

        function onKeydown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancel();
                return;
            }
            // Giữ phím Tab xoay vòng trong modal
            if (e.key === 'Tab') {
                const enabled = buttons.filter(function (b) { return !b.disabled; });
                if (enabled.length === 0) { e.preventDefault(); return; }
                const first = enabled[0];
                const last  = enabled[enabled.length - 1];
                if (!dialog.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        document.addEventListener('keydown', onKeydown, true);

        overlay.addEventListener('mousedown', function (e) {
            if (e.target === overlay) cancel();
        });

        buttons[cfg.focusIndex || 0].focus();

        if (cfg.autoClose > 0) {
            timer = setTimeout(function () { cfg.onCancel(close); }, cfg.autoClose);
        }

        return { close: close, buttons: buttons };
    }

    // ===== Hộp thoại xác nhận =====
    function confirmDialog(opts) {
        opts = opts || {};
        return new Promise(function (resolve, reject) {
            let busy = false;
            let handle = null;

            async function onConfirm(confirmBtn) {
                if (busy) return;
                if (typeof opts.onConfirm !== 'function') {
                    handle.close({ confirmed: true });
                    return;
                }
                busy = true;
                handle.buttons.forEach(function (b) { b.disabled = true; });
                confirmBtn.textContent = 'Đang xử lý...';
                let result;
                try {
                    result = await opts.onConfirm();
                } catch (err) {
                    handle.close({ confirmed: false });
                    reject(err);
                    return;
                }
                handle.close({ confirmed: true, result: result });
            }

            handle = show({
                kind: opts.danger ? 'danger' : 'info',
                role: 'alertdialog',
                title: opts.title || 'Xác nhận',
                message: opts.message || '',
                focusIndex: opts.danger ? 0 : 1,   // việc nguy hiểm: chọn sẵn nút Hủy cho an toàn
                isBusy: function () { return busy; },
                onCancel: function (close) { close({ confirmed: false }); },
                buttons: [
                    { text: opts.cancelText || 'Hủy', className: 'btn-secondary',
                      onClick: function () { handle.close({ confirmed: false }); } },
                    { text: opts.confirmText || 'Đồng ý', className: opts.danger ? 'btn-danger' : 'btn-primary',
                      onClick: onConfirm },
                ],
            }, resolve);
        });
    }

    // ===== Hộp thoại thông báo =====
    function noticeDialog(opts) {
        opts = opts || {};
        const kind = ['success', 'error', 'info'].indexOf(opts.type) === -1 ? 'info' : opts.type;
        return new Promise(function (resolve) {
            let handle = null;
            handle = show({
                kind: kind,
                role: kind === 'error' ? 'alertdialog' : 'dialog',
                title: opts.title || '',
                message: opts.message || '',
                autoClose: opts.autoClose,
                onCancel: function (close) { close(); },
                buttons: [
                    { text: opts.buttonText || 'Đóng', className: 'btn-primary',
                      onClick: function () { handle.close(); } },
                ],
            }, resolve);
        });
    }

    window.Modal = { confirm: confirmDialog, notice: noticeDialog };
})();