const products = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', emoji: '🎧', price: 7499, old: 8999, rating: 4.7, reviews: 386, badge: '17% OFF' },
  { id: 2, name: 'Smart Fitness Watch with Heart Rate Monitor', category: 'Sports', emoji: '⌚', price: 5299, old: 6499, rating: 4.5, reviews: 211, badge: '18% OFF' },
  { id: 3, name: 'Everyday Comfort Running Sneakers', category: 'Fashion', emoji: '👟', price: 3799, old: 4999, rating: 4.6, reviews: 143, badge: '24% OFF' },
  { id: 4, name: 'Portable Blender for Smoothies', category: 'Home', emoji: '🥤', price: 2899, old: 3499, rating: 4.4, reviews: 98, badge: '17% OFF' },
  { id: 5, name: 'Minimal Skincare Essentials Set', category: 'Beauty', emoji: '🧴', price: 2399, old: 2999, rating: 4.8, reviews: 267, badge: '20% OFF' },
  { id: 6, name: 'Compact Mechanical Keyboard', category: 'Electronics', emoji: '⌨️', price: 4599, old: 5499, rating: 4.5, reviews: 175, badge: '16% OFF' },
  { id: 7, name: 'Soft Cotton Everyday Tote Bag', category: 'Fashion', emoji: '👜', price: 1799, old: 2199, rating: 4.3, reviews: 89, badge: '18% OFF' },
  { id: 8, name: 'LED Desk Lamp with USB Charging', category: 'Home', emoji: '💡', price: 1999, old: 2699, rating: 4.6, reviews: 122, badge: '26% OFF' }
];

let cart = JSON.parse(localStorage.getItem('shopsphere-cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('shopsphere-wishlist') || '[]');
let activeCategory = 'all';
let query = '';

const money = value => `PKR ${value.toLocaleString('en-PK')}`;

function saveState() {
  localStorage.setItem('shopsphere-cart', JSON.stringify(cart));
  localStorage.setItem('shopsphere-wishlist', JSON.stringify(wishlist));
  updateCartCount();
}

function updateCartCount() {
  const count = document.getElementById('cartCount');
  if (count) count.textContent = cart.reduce((total, item) => total + item.qty, 0);
}

function renderProducts() {
  const productsContainer = document.getElementById('products');
  if (!productsContainer) return;

  let filtered = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const sort = document.getElementById('sort')?.value || 'featured';
  if (sort === 'priceLow') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'priceHigh') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  const title = document.getElementById('productsTitle');
  const info = document.getElementById('resultInfo');
  if (title) title.textContent = activeCategory === 'all' ? 'Featured products' : `${activeCategory} picks`;
  if (info) info.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'} found`;

  if (!filtered.length) {
    productsContainer.innerHTML = '<div class="empty">No products match your search. Try a different category or keyword.</div>';
    return;
  }

  productsContainer.innerHTML = filtered.map(product => {
    const saved = wishlist.includes(product.id);
    return `
      <article class="card">
        <span class="badge">${product.badge}</span>
        <button class="wish ${saved ? 'active' : ''}" onclick="toggleWish(${product.id})" aria-label="Add to wishlist">${saved ? '♥' : '♡'}</button>
        <div class="product-img">${product.emoji}</div>
        <div class="card-body">
          <p class="product-name">${product.name}</p>
          <div class="rating">${'★'.repeat(Math.round(product.rating))}<small> ${product.rating} (${product.reviews})</small></div>
          <div class="price">${money(product.price)} <span class="old">${money(product.old)}</span></div>
          <div class="stock">✓ In stock</div>
          <button class="add" onclick="addToCart(${product.id})">Add to cart</button>
        </div>
      </article>`;
  }).join('');
}

function filterCategory(category, navButton) {
  activeCategory = category;
  query = '';

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.nav button').forEach(button => button.classList.remove('active'));
  if (navButton) navButton.classList.add('active');

  renderProducts();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addToCart(id) {
  const item = cart.find(product => product.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });

  saveState();
  showToast('Added to your cart');
}

function toggleWish(id) {
  wishlist = wishlist.includes(id)
    ? wishlist.filter(productId => productId !== id)
    : [...wishlist, id];

  saveState();
  renderProducts();
  showToast(wishlist.includes(id) ? 'Saved to your wishlist' : 'Removed from wishlist');
}

function openCart() {
  renderCart();
  document.getElementById('cartModal')?.classList.add('show');
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  if (!cartItems || !cartTotal) return;

  if (!cart.length) {
    cartItems.innerHTML = '<p style="color:#677085;padding:20px 0">Your cart is empty. Add a product to begin shopping.</p>';
    cartTotal.textContent = money(0);
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(productItem => productItem.id === item.id);
    return `
      <div class="cart-row">
        <div class="cart-icon">${product.emoji}</div>
        <div>
          <b>${product.name}</b>
          <p>${money(product.price)}</p>
          <div class="qty">
            <button onclick="changeQty(${product.id}, -1)">−</button>
            <b>${item.qty}</b>
            <button onclick="changeQty(${product.id}, 1)">+</button>
            <button class="remove" onclick="removeItem(${product.id})">Remove</button>
          </div>
        </div>
        <b>${money(product.price * item.qty)}</b>
      </div>`;
  }).join('');

  const total = cart.reduce((sum, item) => {
    const product = products.find(productItem => productItem.id === item.id);
    return sum + product.price * item.qty;
  }, 0);

  cartTotal.textContent = money(total);
}

function changeQty(id, amount) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty < 1) cart = cart.filter(product => product.id !== id);

  saveState();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(product => product.id !== id);
  saveState();
  renderCart();
  showToast('Item removed from your cart');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('show');
}

function startCheckout() {
  if (!cart.length) {
    showToast('Your cart is empty');
    return;
  }

  closeModal('cartModal');
  document.getElementById('checkoutModal')?.classList.add('show');
}

function placeOrder(event) {
  event.preventDefault();
  cart = [];
  saveState();
  event.target.reset();
  closeModal('checkoutModal');
  showToast('Order placed successfully — thank you!');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function setupSearch() {
  const searchForm = document.getElementById('searchForm');
  if (!searchForm) return;

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    query = document.getElementById('searchInput')?.value.trim() || '';
    activeCategory = document.getElementById('searchCategory')?.value || 'all';
    renderProducts();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setupModalClosing() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal(modal.id);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(modal => closeModal(modal.id));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  setupSearch();
  setupModalClosing();
  renderProducts();
});
