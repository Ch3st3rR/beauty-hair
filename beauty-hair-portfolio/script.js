(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const currency = (value) => new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL"
  }).format(value);

  // Navegação mobile acessível
  const menuToggle = $(".menu-toggle");
  const nav = $(".main-nav");
  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
  };
  menuToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });
  $$(".main-nav a").forEach((link) => link.addEventListener("click", closeMenu));

  // Filtro de produtos + busca
  const filterButtons = $$(".filter-button");
  const searchInput = $("#product-search");
  const productCards = $$(".product-card");
  const emptyState = $("#empty-state");
  let activeFilter = "all";

  function filterProducts() {
    const term = (searchInput?.value || "").trim().toLocaleLowerCase("pt-BR");
    let visibleCount = 0;
    productCards.forEach((card) => {
      const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
      const searchMatches = (card.dataset.name || "").toLocaleLowerCase("pt-BR").includes(term);
      const visible = categoryMatches && searchMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount > 0;
  }
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      filterProducts();
    });
  });
  searchInput?.addEventListener("input", filterProducts);

  // Favoritos demonstrativos
  $$(".heart").forEach((button) => {
    button.addEventListener("click", () => {
      const active = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-favorite", active);
      button.textContent = active ? "♥" : "♡";
      showToast(active ? "Adicionado aos favoritos ✳" : "Removido dos favoritos");
    });
  });

  // Sacola de compras local: não é checkout real e não envia pagamentos.
  const cart = new Map();
  const cartDrawer = $("#cart-drawer");
  const cartOverlay = $("#cart-overlay");
  const cartItems = $("#cart-items");
  const cartTotal = $("#cart-total");
  const cartCountEls = $$(".cart-count");
  const bagButton = $(".bag-button");
  const closeCartButton = $(".close-cart");
  let lastFocusedElement = null;

  function cartQuantity() {
    return [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  }
  function renderCart() {
    const items = [...cart.values()];
    cartCountEls.forEach((el) => { el.textContent = String(cartQuantity()); });
    if (items.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Sua sacola está vazia por enquanto. ✳</p>';
    } else {
      cartItems.innerHTML = items.map((item) => `
        <article class="cart-line">
          <div><h3>${escapeHTML(item.title)}</h3><p>${currency(item.price)} · ${item.quantity} un.</p></div>
          <div class="cart-line-actions">
            <button class="qty-button" type="button" data-cart-action="decrease" data-id="${escapeHTML(item.id)}" aria-label="Diminuir quantidade de ${escapeHTML(item.title)}">−</button>
            <button class="qty-button" type="button" data-cart-action="increase" data-id="${escapeHTML(item.id)}" aria-label="Aumentar quantidade de ${escapeHTML(item.title)}">+</button>
            <button class="remove-item" type="button" data-cart-action="remove" data-id="${escapeHTML(item.id)}">REMOVER</button>
          </div>
        </article>`).join("");
    }
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = currency(total);
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
  function openCart() {
    lastFocusedElement = document.activeElement;
    cartDrawer.hidden = false;
    cartOverlay.hidden = false;
    document.body.classList.add("no-scroll");
    closeCartButton?.focus();
  }
  function closeCart() {
    cartDrawer.hidden = true;
    cartOverlay.hidden = true;
    document.body.classList.remove("no-scroll");
    lastFocusedElement?.focus?.();
  }
  bagButton?.addEventListener("click", openCart);
  closeCartButton?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);
  $$(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const { id, title, price } = button.dataset;
      if (!id || !title || !Number.isFinite(Number(price))) return;
      const existing = cart.get(id);
      if (existing) existing.quantity += 1;
      else cart.set(id, { id, title, price: Number(price), quantity: 1 });
      renderCart();
      showToast(`${title} adicionado à sacola`);
    });
  });
  cartItems?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const item = cart.get(button.dataset.id);
    if (!item) return;
    if (button.dataset.cartAction === "increase") item.quantity += 1;
    if (button.dataset.cartAction === "decrease") item.quantity -= 1;
    if (button.dataset.cartAction === "remove" || item.quantity <= 0) cart.delete(item.id);
    renderCart();
  });
  $(".checkout-button")?.addEventListener("click", () => {
    showToast("Checkout demonstrativo: nenhuma compra ou cobrança foi realizada.");
  });

  // Formulário de agendamento: prepara e-mail via mailto; sem backend/agenda conectada.
  const bookingModal = $("#booking-modal");
  const bookingForm = $("#booking-form");
  const bookingService = $("#booking-service");
  const bookingDate = $("#booking-date");
  const formFeedback = $("#form-feedback");
  const closeBookingButton = $(".close-booking");
  let bookingReturnFocus = null;

  if (bookingDate) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    bookingDate.min = localDate;
  }
  function openBooking(service = "") {
    bookingReturnFocus = document.activeElement;
    if (service && bookingService) bookingService.value = service;
    bookingModal.hidden = false;
    document.body.classList.add("no-scroll");
    $("#booking-name")?.focus();
  }
  function closeBooking() {
    bookingModal.hidden = true;
    document.body.classList.remove("no-scroll");
    bookingReturnFocus?.focus?.();
  }
  $$(".booking-trigger").forEach((button) => {
    button.addEventListener("click", () => openBooking(button.dataset.service || ""));
  });
  closeBookingButton?.addEventListener("click", closeBooking);
  bookingModal?.addEventListener("click", (event) => {
    if (event.target === bookingModal) closeBooking();
  });
  bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    const data = new FormData(bookingForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const service = String(data.get("service") || "");
    const date = String(data.get("date") || "A combinar");
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`Solicitação de agendamento — ${service}`);
    const body = encodeURIComponent(
      `Olá, Beauty Hair!\n\nGostaria de solicitar um agendamento.\n\nNome: ${name}\nE-mail: ${email}\nServiço: ${service}\nData preferida: ${date}\nObservações: ${message || "Nenhuma"}\n\nEnviado pelo protótipo de portfólio.`
    );
    if (formFeedback) formFeedback.textContent = "Sua solicitação está preparada. Ao abrir o aplicativo de e-mail, revise e envie a mensagem.";
    window.location.href = `mailto:hello@beautyhair.example?subject=${subject}&body=${body}`;
  });

  // Fechar painéis com Escape e manter comportamento previsível.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (cartDrawer && !cartDrawer.hidden) closeCart();
    if (bookingModal && !bookingModal.hidden) closeBooking();
    closeMenu();
  });

  // Toasts sem dependências externas.
  let toastTimer;
  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  renderCart();
})();
