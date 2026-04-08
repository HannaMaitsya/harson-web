class HarMintyChatBot {
  constructor(options = {}) {
    this.config = {
      companyName: options.companyName || 'PT. Harson Multiline Machinery',
      assistantName: options.assistantName || 'HarMinty',
      mascotSrc: options.mascotSrc || 'img/harson.png',
      maxHistory: typeof options.maxHistory === 'number' ? options.maxHistory : 24,
      accent: options.accent || '#b91c1c',
      accent2: options.accent2 || '#ef4444',
      surface: options.surface || 'rgba(255,255,255,0.78)',
      ...options,
    };

    this.state = {
      isOpen: false,
      isLoading: false,
      messages: [],
      unread: 0,
    };

    this.knowledgeBase = [
      {
        category: 'services',
        keywords: [
          'service',
          'services',
          'what do you do',
          'what services do you offer',
          'what services',
          'offer',
          'offering',
          'company services',
          'our services',
        ],
        response: `<strong>Our Services</strong><br><br>
PT. Harson Multiline Machinery provides high-quality industrial solutions:<br>
• Industrial Roller Manufacturing — custom rollers for industrial applications<br>
• Engineering & Design — technical consultation and design support<br>
• Maintenance & Repair — preventive maintenance and machine repair<br>
• Spare Parts Supply — original and compatible replacement parts<br>
• Export & Distribution — safe and efficient delivery to regional markets<br><br>
Need a quotation or technical consultation? Our team is ready to help!`,
      },
      {
        category: 'pricing',
        keywords: [
          'price',
          'pricing',
          'cost',
          'biaya',
          'harga',
          'quote',
          'quotation',
          'how much',
          'estimate',
          'estimation',
        ],
        response: `<strong>Pricing Information</strong><br><br>
Pricing depends on the product type, specifications, quantity, and delivery requirements.<br><br>
<strong>How to request a quotation:</strong><br>
• Send your requirements and technical details<br>
• Include dimensions, material preferences, and quantity<br>
• Our team will review the request and prepare a quotation<br><br>
A typical quotation includes:<br>
• Product specification summary<br>
• Estimated production time<br>
• Unit price and total cost<br>
• Delivery notes and service details<br><br>
The more detailed your information, the faster we can respond.`,
      },
      {
        category: 'hours',
        keywords: [
          'hours',
          'open',
          'opening hours',
          'business hours',
          'operating hours',
          'working hours',
          'schedule',
          'when are you open',
        ],
        response: `<strong>Business Hours</strong><br><br>
• Monday - Friday: 08:00 - 17:00 WIB<br>
• Saturday: 08:00 - 12:00 WIB<br>
• Sunday & Public Holidays: Closed<br><br>
For urgent inquiries outside business hours, please use the support channel available on our contact page.`,
      },
      {
        category: 'contact',
        keywords: [
          'contact',
          'address',
          'location',
          'office',
          'where are you located',
          'where is your office',
          'head office',
          'workshop',
          'map',
        ],
        response: `<strong>Our Locations</strong><br><br>
<strong>Head Office — Jakarta</strong><br>
Tempo Scan Tower 32nd Floor<br>
Jln. HR Rasuna Said, South Jakarta<br>
<a href="https://www.google.com/maps/place/Tempo+Scan+Tower" target="_blank" rel="noopener noreferrer" style="color: #b91c1c;">📍 Open in Google Maps</a><br><br>

<strong>Workshop — Cileungsi</strong><br>
Kawasan Kirana Uttama Blok D-23<br>
Cileungsi, Bogor Regency<br>
<a href="https://www.google.com/maps/search/PT.Harson+Multiline+Machinery" target="_blank" rel="noopener noreferrer" style="color: #b91c1c;">📍 Open Workshop Location</a>`,
      },
      {
        category: 'technical',
        keywords: [
          'technical',
          'support',
          'help',
          'assistance',
          'troubleshooting',
          'maintenance help',
          'repair help',
          'problem',
          'issue',
          'machine issue',
        ],
        response: `<strong>Technical Support</strong><br><br>
Need help with machinery, troubleshooting, or maintenance?<br>
Our technical team is ready to assist you.<br><br>
💬 Please contact our support team through the phone or email listed on the contact page.`,
      },
      {
        category: 'products',
        keywords: [
          'product',
          'products',
          'catalog',
          'catalogue',
          'equipment',
          'item',
          'items',
          'spare part',
          'spare parts',
          'roller',
          'rollers',
        ],
        response: `<strong>Our Products</strong><br><br>
• Industrial Rollers — high-precision rollers for manufacturing systems<br>
• Drive Systems — transmission and motion components<br>
• Custom Parts — products made to your specific requirements<br>
• Spare Parts — replacement components with technical support<br><br>
All products are designed with durability, precision, and operational efficiency in mind.`,
      },
      {
        category: 'company',
        keywords: [
          'about',
          'company',
          'profile',
          'vision',
          'mission',
          'who are you',
          'who is harson',
          'about company',
          'about us',
        ],
        response: `<strong>About PT. Harson Multiline Machinery</strong><br><br>
We are an industrial company focused on precision manufacturing, technical support, and custom industrial solutions.<br><br>
<strong>Our Priorities:</strong><br>
• High product quality<br>
• Clear communication<br>
• Reliable delivery<br>
• Professional after-sales support<br>
• Practical and efficient solutions for production needs`,
      },
    ];

    this.dom = {};
    this.typingId = 'harminty-typing-indicator';
    this.styleId = 'harminty-style';
    this.containerId = 'harminty-chat-container';

    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount(), { once: true });
    } else {
      this.mount();
    }
  }

  mount() {
    this.injectWidget();
    this.cacheDom();
    this.bindEvents();
    this.pushWelcomeMessage();
  }

  escapeHTML(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  applyInlineFormatting(text) {
    return String(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  formatMessage(text) {
    const safe = this.escapeHTML(text);
    const lines = safe.split('\n');
    const out = [];
    let listItems = [];
    let inList = false;

    const flushList = () => {
      if (!inList) return;
      out.push(`<ul class="harminty-list">${listItems.join('')}</ul>`);
      listItems = [];
      inList = false;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        out.push('<div class="harminty-gap"></div>');
        continue;
      }

      const isBullet = /^[-•*]\s+/.test(line);
      const isNumbered = /^\d+[\).\]]\s+/.test(line);
      const isEmojiNumber = /^\d️⃣\s+/.test(line);

      if (isBullet || isNumbered || isEmojiNumber) {
        const cleaned = line
          .replace(/^[-•*]\s+/, '')
          .replace(/^\d+[\).\]]\s+/, '')
          .replace(/^\d️⃣\s+/, '');

        inList = true;
        listItems.push(`<li>${this.applyInlineFormatting(cleaned)}</li>`);
        continue;
      }

      flushList();
      out.push(`<div class="harminty-paragraph">${this.applyInlineFormatting(line)}</div>`);
    }

    flushList();
    return out.join('');
  }

  injectStyles() {
    if (document.getElementById(this.styleId)) return;

    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = `
      :root {
        --harminty-accent: ${this.config.accent};
        --harminty-accent2: ${this.config.accent2};
        --harminty-surface: ${this.config.surface};
      }

      #${this.containerId} {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 999999;
        font-family: Inter, "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #0f172a;
      }

      #${this.containerId} * {
        box-sizing: border-box;
      }

      .harminty-shell {
        position: relative;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
      }

      .harminty-fab {
        width: 72px;
        height: 72px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 30% 25%, rgba(255,255,255,.42), transparent 34%),
          linear-gradient(135deg, var(--harminty-accent2) 0%, var(--harminty-accent) 55%, #7f1d1d 100%);
        box-shadow:
          0 18px 38px rgba(127, 29, 29, 0.34),
          inset 0 1px 0 rgba(255,255,255,.24);
        transition: transform .22s ease, box-shadow .22s ease, filter .22s ease;
        outline: none;
      }

      .harminty-fab::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent 15%, rgba(255,255,255,.20) 30%, transparent 55%);
        transform: translateX(-120%);
        transition: transform .7s ease;
      }

      .harminty-fab:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow:
          0 22px 45px rgba(127, 29, 29, 0.38),
          inset 0 1px 0 rgba(255,255,255,.3);
      }

      .harminty-fab:hover::after {
        transform: translateX(120%);
      }

      .harminty-fab img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 999px;
        position: relative;
        z-index: 1;
      }

      .harminty-badge {
        position: absolute;
        top: -4px;
        right: -2px;
        min-width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #f43f5e;
        color: #fff;
        font-size: 11px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        border: 2px solid #fff;
        box-shadow: 0 8px 18px rgba(244, 63, 94, .35);
        z-index: 2;
      }

      .harminty-window {
        position: absolute;
        right: 0;
        bottom: 92px;
        width: 420px;
        max-width: min(92vw, 420px);
        height: 680px;
        max-height: calc(100vh - 120px);
        background:
          radial-gradient(circle at top left, rgba(239,68,68,.10), transparent 28%),
          radial-gradient(circle at top right, rgba(255,255,255,.8), transparent 24%),
          var(--harminty-surface);
        backdrop-filter: blur(24px) saturate(165%);
        -webkit-backdrop-filter: blur(24px) saturate(165%);
        border-radius: 30px;
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
        border: 1px solid rgba(255,255,255,.24);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        opacity: 0;
        transform: translateY(18px) scale(.96);
        pointer-events: none;
        transition: opacity .26s ease, transform .26s ease;
      }

      .harminty-window.active {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .harminty-window::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(255,255,255,.36), transparent 18%);
        opacity: .65;
      }

      .harminty-header {
        position: relative;
        padding: 18px 18px 16px;
        color: #fff;
        background:
          linear-gradient(135deg, rgba(127,29,29,.96) 0%, rgba(185,28,28,.96) 52%, rgba(239,68,68,.92) 100%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border-bottom: 1px solid rgba(255,255,255,.15);
      }

      .harminty-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .harminty-avatar-wrap {
        position: relative;
        width: 48px;
        height: 48px;
        flex: 0 0 auto;
      }

      .harminty-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255,255,255,.34);
        box-shadow: 0 8px 24px rgba(0,0,0,.18);
        background: rgba(255,255,255,.18);
      }

      .harminty-online-dot {
        position: absolute;
        right: -1px;
        bottom: -1px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #22c55e;
        border: 2px solid rgba(255,255,255,.92);
        box-shadow: 0 0 0 4px rgba(34,197,94,.18);
      }

      .harminty-headline {
        min-width: 0;
      }

      .harminty-headline h3 {
        margin: 0;
        font-size: 15px;
        line-height: 1.1;
        letter-spacing: .2px;
        font-weight: 800;
      }

      .harminty-headline p {
        margin: 4px 0 0;
        font-size: 11px;
        opacity: .92;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .harminty-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 9px;
        border-radius: 999px;
        background: rgba(255,255,255,.14);
        backdrop-filter: blur(8px);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .2px;
      }

      .harminty-header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }

      .harminty-icon-btn {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.16);
        background: rgba(255,255,255,.10);
        color: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: transform .18s ease, background .18s ease;
      }

      .harminty-icon-btn:hover {
        transform: translateY(-1px);
        background: rgba(255,255,255,.16);
      }

      .harminty-body {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 14px;
        gap: 12px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,.56)),
          linear-gradient(180deg, #f8fafc 0%, #f8fafc 100%);
      }

      .harminty-banner {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px;
        background:
          linear-gradient(135deg, rgba(185,28,28,.08), rgba(239,68,68,.04)),
          rgba(255,255,255,.84);
        border: 1px solid rgba(185,28,28,.10);
        border-radius: 22px;
      }

      .harminty-banner-mark {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        color: #fff;
        background: linear-gradient(135deg, var(--harminty-accent2), var(--harminty-accent));
        box-shadow: 0 12px 24px rgba(185,28,28,.22);
        flex: 0 0 auto;
        font-size: 18px;
      }

      .harminty-banner-title {
        font-size: 13px;
        font-weight: 800;
        margin: 0;
        color: #0f172a;
      }

      .harminty-banner-text {
        margin: 4px 0 0;
        font-size: 12px;
        color: #64748b;
        line-height: 1.45;
      }

      .harminty-panel {
        background: rgba(255,255,255,.80);
        border: 1px solid rgba(15,23,42,.06);
        border-radius: 20px;
        padding: 12px;
        box-shadow: 0 12px 30px rgba(15,23,42,.04);
      }

      .harminty-quickrow {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 2px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .harminty-quickrow::-webkit-scrollbar {
        display: none;
      }

      .harminty-chip {
        flex: 0 0 auto;
        border: 1px solid rgba(148,163,184,.24);
        background: rgba(255,255,255,.94);
        color: #0f172a;
        padding: 9px 13px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all .18s ease;
        box-shadow: 0 10px 22px rgba(15,23,42,.04);
        white-space: nowrap;
      }

      .harminty-chip:hover {
        border-color: rgba(185,28,28,.28);
        color: var(--harminty-accent);
        transform: translateY(-1px);
        background: rgba(255,245,245,.98);
      }

      .harminty-messages-wrap {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .harminty-messages {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-right: 4px;
        scrollbar-width: thin;
        scrollbar-color: rgba(148,163,184,.6) transparent;
      }

      .harminty-messages::-webkit-scrollbar {
        width: 8px;
      }

      .harminty-messages::-webkit-scrollbar-thumb {
        background: rgba(148,163,184,.45);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .harminty-bubble {
        position: relative;
        padding: 13px 16px;
        border-radius: 18px;
        font-size: 13.5px;
        line-height: 1.55;
        max-width: 86%;
        word-wrap: break-word;
        overflow-wrap: anywhere;
        white-space: normal;
        box-shadow: 0 12px 28px rgba(15,23,42,.06);
        animation: harminty-pop .18s ease-out;
      }

      @keyframes harminty-pop {
        from { transform: translateY(6px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .harminty-bubble.user {
        align-self: flex-end;
        color: #fff;
        background: linear-gradient(135deg, var(--harminty-accent2), var(--harminty-accent));
        border-bottom-right-radius: 6px;
      }

      .harminty-bubble.bot {
        align-self: flex-start;
        color: #0f172a;
        background: rgba(255,255,255,.94);
        border: 1px solid rgba(148,163,184,.16);
        border-bottom-left-radius: 6px;
      }

      .harminty-paragraph {
        margin: 0 0 8px 0;
      }

      .harminty-paragraph:last-child {
        margin-bottom: 0;
      }

      .harminty-gap {
        height: 8px;
      }

      .harminty-list {
        margin: 8px 0 0 0;
        padding-left: 18px;
      }

      .harminty-list li {
        margin-bottom: 6px;
      }

      .harminty-bubble strong {
        font-weight: 800;
      }

      .harminty-bubble code {
        padding: 2px 6px;
        border-radius: 8px;
        background: rgba(15,23,42,.06);
        font-size: 12px;
      }

      .harminty-meta {
        margin-top: 6px;
        font-size: 10px;
        opacity: .72;
      }

      .harminty-typing {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .harminty-typing span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        opacity: .45;
        animation: harminty-bounce 1.15s infinite ease-in-out;
      }

      .harminty-typing span:nth-child(2) { animation-delay: .12s; }
      .harminty-typing span:nth-child(3) { animation-delay: .24s; }

      @keyframes harminty-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: .35; }
        40% { transform: translateY(-4px); opacity: .9; }
      }

      .harminty-footer {
        padding: 14px;
        background: rgba(255,255,255,.9);
        border-top: 1px solid rgba(148,163,184,.16);
        backdrop-filter: blur(12px);
      }

      .harminty-input-shell {
        display: flex;
        align-items: flex-end;
        gap: 10px;
        background: #fff;
        border: 1px solid rgba(148,163,184,.20);
        border-radius: 24px;
        padding: 10px 10px 10px 14px;
        box-shadow: 0 14px 30px rgba(15,23,42,.05);
      }

      .harminty-input {
        flex: 1;
        border: 0;
        outline: none;
        resize: none;
        background: transparent;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.45;
        min-height: 24px;
        max-height: 104px;
        color: #0f172a;
      }

      .harminty-input::placeholder {
        color: #94a3b8;
      }

      .harminty-send {
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 50%;
        display: grid;
        place-items: center;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(135deg, var(--harminty-accent2), var(--harminty-accent));
        box-shadow: 0 14px 26px rgba(185,28,28,.22);
        transition: transform .18s ease, filter .18s ease, opacity .18s ease;
        flex: 0 0 auto;
      }

      .harminty-send:hover {
        transform: translateY(-1px);
        filter: brightness(1.02);
      }

      .harminty-send:disabled,
      .harminty-icon-btn:disabled,
      .harminty-chip:disabled {
        opacity: .55;
        cursor: not-allowed;
        transform: none;
      }

      .harminty-error {
        background: linear-gradient(135deg, rgba(254,242,242,.95), rgba(255,255,255,.9));
        color: #991b1b;
        border: 1px solid rgba(220,38,38,.14);
        border-left: 4px solid #dc2626;
        padding: 12px 13px;
        border-radius: 14px;
        font-size: 12px;
        line-height: 1.45;
        box-shadow: 0 12px 28px rgba(220,38,38,.06);
      }

      .harminty-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .harminty-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 0 4px rgba(34,197,94,.16);
      }

      .harminty-dot.limited {
        background: #f59e0b;
        box-shadow: 0 0 0 4px rgba(245,158,11,.16);
      }

      @media (max-width: 480px) {
        #${this.containerId} {
          right: 14px;
          bottom: 14px;
        }

        .harminty-window {
          width: min(94vw, 420px);
          height: min(78vh, 700px);
          bottom: 86px;
          border-radius: 24px;
        }

        .harminty-fab {
          width: 66px;
          height: 66px;
        }

        .harminty-bubble {
          max-width: 92%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  injectWidget() {
    const existing = document.getElementById(this.containerId);
    if (existing) existing.remove();

    this.injectStyles();

    const container = document.createElement('div');
    container.id = this.containerId;
    container.setAttribute('aria-live', 'polite');

    container.innerHTML = `
      <div class="harminty-shell">
        <button class="harminty-fab" aria-label="Open HarMinty Chat" type="button">
          <img src="${this.config.mascotSrc}" alt="${this.config.assistantName}" loading="lazy">
          <span class="harminty-badge" id="harminty-badge" style="display:none;">0</span>
        </button>

        <div class="harminty-window" aria-hidden="true">
          <div class="harminty-header">
            <div class="harminty-header-left">
              <div class="harminty-avatar-wrap">
                <img class="harminty-avatar" src="${this.config.mascotSrc}" alt="Avatar">
                <span class="harminty-online-dot"></span>
              </div>
              <div class="harminty-headline">
                <h3>${this.config.assistantName}</h3>
                <p>
                  <span class="harminty-status" id="harminty-status">
                    <span class="harminty-dot" id="harminty-dot"></span>
                    <span id="harminty-status-text">Online</span>
                  </span>
                  <span class="harminty-pill">${this.config.companyName}</span>
                </p>
              </div>
            </div>

            <div class="harminty-header-actions">
              <button class="harminty-icon-btn" type="button" id="harminty-minimize" aria-label="Minimize chat">—</button>
              <button class="harminty-icon-btn harminty-close" type="button" aria-label="Close chat">✕</button>
            </div>
          </div>

          <div class="harminty-body">
            <div class="harminty-banner">
              <div class="harminty-banner-mark">✦</div>
              <div>
                <p class="harminty-banner-title">How can we help today?</p>
                <p class="harminty-banner-text">Ask about products, machinery services, spare parts, or technical support. Quick replies are available below.</p>
              </div>
            </div>

            <div class="harminty-panel">
              <div class="harminty-quickrow" id="harminty-suggestions">
                <button class="harminty-chip" data-text="What services do you provide?">Our Services</button>
                <button class="harminty-chip" data-text="How can I request a quote?">Get a Quote</button>
                <button class="harminty-chip" data-text="Where is your office located?">Location</button>
                <button class="harminty-chip" data-text="Can you help with technical support?">Technical Support</button>
              </div>
            </div>

            <div class="harminty-messages-wrap">
              <div class="harminty-messages" id="harminty-messages"></div>
            </div>
          </div>

          <div class="harminty-footer">
            <div class="harminty-input-shell">
              <textarea class="harminty-input" id="harminty-input" placeholder="Type your message..." rows="1"></textarea>
              <button class="harminty-send" type="button" aria-label="Send message">➤</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  cacheDom() {
    const container = document.getElementById(this.containerId);

    this.dom = {
      container,
      fab: container.querySelector('.harminty-fab'),
      badge: container.querySelector('#harminty-badge'),
      window: container.querySelector('.harminty-window'),
      close: container.querySelector('.harminty-close'),
      minimize: container.querySelector('#harminty-minimize'),
      messages: container.querySelector('#harminty-messages'),
      input: container.querySelector('#harminty-input'),
      send: container.querySelector('.harminty-send'),
      suggestions: container.querySelectorAll('.harminty-chip'),
      statusText: container.querySelector('#harminty-status-text'),
      statusDot: container.querySelector('#harminty-dot'),
    };
  }

  bindEvents() {
    this.dom.fab.addEventListener('click', () => this.toggle());
    this.dom.close.addEventListener('click', () => this.close());
    this.dom.minimize.addEventListener('click', () => this.close());
    this.dom.send.addEventListener('click', () => this.submit());

    this.dom.input.addEventListener('input', () => this.autoGrowInput());
    this.dom.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.submit();
      }
    });

    this.dom.suggestions.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.dataset.text || '';
        this.dom.input.value = text;
        this.dom.input.focus();
        this.autoGrowInput();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isOpen) this.close();
    });

    document.addEventListener('click', (e) => {
      if (!this.state.isOpen) return;
      if (!this.dom.container.contains(e.target)) this.close();
    });
  }

  updateStatus(text) {
    if (!this.dom.statusText || !this.dom.statusDot) return;
    this.dom.statusText.textContent = text;
    this.dom.statusDot.classList.toggle('limited', text !== 'Online');
  }

  updateBadge() {
    if (!this.dom.badge) return;

    if (this.state.unread > 0 && !this.state.isOpen) {
      this.dom.badge.style.display = 'inline-flex';
      this.dom.badge.textContent = this.state.unread > 9 ? '9+' : String(this.state.unread);
    } else {
      this.dom.badge.style.display = 'none';
    }
  }

  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.state.isOpen = true;
    this.state.unread = 0;
    this.updateBadge();
    this.dom.window.classList.add('active');
    this.dom.window.setAttribute('aria-hidden', 'false');
    setTimeout(() => this.dom.input.focus(), 180);
  }

  close() {
    this.state.isOpen = false;
    this.dom.window.classList.remove('active');
    this.dom.window.setAttribute('aria-hidden', 'true');
  }

  autoGrowInput() {
    const el = this.dom.input;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 104) + 'px';
  }

  pushWelcomeMessage() {
    this.addMessage(
      {
        type: 'bot',
        text: `Hi there! I’m ${this.config.assistantName}, your assistant for ${this.config.companyName}. What can I help you with today?`,
      },
      false
    );
  }

  addMessage(msg, countUnread = true) {
    this.state.messages.push(msg);
    if (this.state.messages.length > this.config.maxHistory) {
      this.state.messages.shift();
    }

    this.renderMessage(msg);

    if (countUnread && !this.state.isOpen && msg.type === 'bot') {
      this.state.unread += 1;
      this.updateBadge();
    }
  }

  renderMessage(msg) {
    const bubble = document.createElement('div');
    bubble.className = `harminty-bubble ${msg.type}`;

    const text = document.createElement('div');
    if (msg.type === 'bot') {
      if (/<[^>]+>/.test(msg.text)) {
        text.innerHTML = msg.text;
      } else {
        text.innerHTML = this.formatMessage(msg.text);
      }
    } else {
      text.textContent = msg.text;
    }

    bubble.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'harminty-meta';
    meta.textContent = msg.type === 'user' ? 'You' : this.config.assistantName;
    bubble.appendChild(meta);

    this.dom.messages.appendChild(bubble);
    this.scrollToBottom();
  }

  renderError(text) {
    const div = document.createElement('div');
    div.className = 'harminty-error';
    div.textContent = text;
    this.dom.messages.appendChild(div);
    this.scrollToBottom();
  }

  showTyping() {
    if (document.getElementById(this.typingId)) return;

    const typing = document.createElement('div');
    typing.id = this.typingId;
    typing.className = 'harminty-bubble bot';
    typing.innerHTML = `
      <div class="harminty-typing" aria-label="${this.config.assistantName} is typing">
        <span></span><span></span><span></span>
      </div>
      <div class="harminty-meta">${this.config.assistantName} is thinking...</div>
    `;

    this.dom.messages.appendChild(typing);
    this.scrollToBottom();
  }

  removeTyping() {
    const elem = document.getElementById(this.typingId);
    if (elem) elem.remove();
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.dom.messages.scrollTop = this.dom.messages.scrollHeight;
    });
  }

  findResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();

    for (const item of this.knowledgeBase) {
      for (const keyword of item.keywords) {
        if (message.includes(keyword)) {
          return item.response;
        }
      }
    }

    return `<strong>Happy to help</strong><br><br>
I am not fully sure what you are asking yet. You can ask about:<br>
• <strong>Services</strong> — What we offer<br>
• <strong>Products</strong> — Our rollers and industrial products<br>
• <strong>Pricing</strong> — Quotes and cost information<br>
• <strong>Business Hours</strong> — Our operating schedule<br>
• <strong>Location</strong> — Office and workshop address<br>
• <strong>Company Info</strong> — About our business<br><br>
You can also contact our team directly for more specific assistance! 📞`;
  }

  async submit() {
    if (this.state.isLoading) return;

    const text = this.dom.input.value.trim();
    if (!text) return;

    this.state.isLoading = true;
    this.dom.input.disabled = true;
    this.dom.send.disabled = true;

    this.addMessage({ type: 'user', text }, false);
    this.dom.input.value = '';
    this.autoGrowInput();

    this.showTyping();

    setTimeout(() => {
      this.removeTyping();

      try {
        const response = this.findResponse(text);
        this.addMessage({ type: 'bot', text: response });
      } catch (error) {
        this.removeTyping();
        console.error('[HarMinty]', error);
        this.renderError('An error occurred. Please try again.');
      } finally {
        this.state.isLoading = false;
        this.dom.input.disabled = false;
        this.dom.send.disabled = false;
        this.dom.input.focus();
        this.autoGrowInput();
      }
    }, 600);
  }
}

(function () {
  const initBot = () => {
    if (!window.harmintyBot) window.harmintyBot = new HarMintyChatBot();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBot, { once: true });
  } else {
    initBot();
  }
})();