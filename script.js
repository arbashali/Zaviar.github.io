const products = [
  { id: 1, name: 'SoundPro Wireless Headphones', category: 'Electronics', price: 8499, rating: 4.8, reviews: 124, icon: '🎧', featured: 10 },
  { id: 2, name: 'Everyday Cotton Sneakers', category: 'Fashion', price: 4999, rating: 4.6, reviews: 89, icon: '👟', featured: 9 },
  { id: 3, name: 'Minimal Ceramic Table Lamp', category: 'Home', price: 3299, rating: 4.7, reviews: 56, icon: '💡', featured: 8 },
  { id: 4, name: 'Glow Essentials Skincare Set', category: 'Beauty', price: 2799, rating: 4.9, reviews: 203, icon: '✨', featured: 10 },
  { id: 5, name: 'Smart Fitness Watch', category: 'Sports', price: 6999, rating: 4.5, reviews: 71, icon: '⌚', featured: 7 },
  { id: 6, name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 3899, rating: 4.4, reviews: 118, icon: '🔊', featured: 8 },
  { id: 7, name: 'Soft Knit Lounge Set', category: 'Fashion', price: 3599, rating: 4.6, reviews: 44, icon: '🧥', featured: 6 },
  { id: 8, name: 'Bamboo Storage Basket', category: 'Home', price: 1899, rating: 4.3, reviews: 37, icon: '🧺', featured: 5 }
];

let activeCategory = 'all';
let cart = [];
let toastTimer;

const money = value => `PKR ${value.toLocaleString('en-PK')}`;
const get = id => document.getElementById(id);

function stars(rating) {
  const filled = Math.round(rating);
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

function filteredProducts() {
  const query = get('searchInput').value.trim().toLowerCase();
  return products.filter(product => {
    const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
    const queryMatch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
}

function renderProducts() {
  const sort = get('sort').value;
  const list = filteredProducts().sort((a, b) => {
    if (sort === 'priceLow') return a.price - b.price;
    if (sort === 'priceHigh') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    return b.featured - a.featured;
  });

  get('products').innerHTML = list.length ? list.map(product => `
    <article class="product">
      <div class="product-image" aria-hidden="true">${product.icon}</div>
      <div class="product-body">
        <div class="product-category">${product.category}</div>
        <h3>${product.name}</h3>
        <div class="rating" aria-label="Rated ${product.rating} out of 5">
          ${stars(product.rating)} <span>${product.rating} (${product.reviews})</span>
        </div>
        <div class="price-row">
          <div class="price">${money(product.price)}</div>
          <button class="add-btn" onclick="addToCart(${product.id})">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('') : '<div class="empty">No products matched your search. Try another category or keyword.</div>';

  const label = activeCategory === 'all' ? 'Featured products' : `${activeCategory} products`;
  get('productsTitle').textContent = label;
  get('resultInfo').textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'} selected for you`;
}

function filterCategory(category, button) {
  activeCategory = category;
  document.querySelectorAll('.nav button').forEach(item => item.classList.remove('active'));
  if (button) button.classList.add('active');
  else {
    const navButton = [...document.querySelectorAll('.nav button')].find(item => item.textContent.toLowerCase().includes(category.toLowerCase()));
    if (navButton) navButton.classList.add('active');
  }
  renderProducts();
  get('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  updateCart();
  const product = products.find(item => item.id === id);
  showToast(`${product.name} added to your cart.`);
}

function changeQuantity(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find(productItem => productItem.id === item.id);
    return total + product.price * item.quantity;
  }, 0);
  get('cartCount').textContent = count;
  get('cartTotal').textContent = money(subtotal);
  get('cartItems').innerHTML = cart.length ? cart.map(item => {
    const product = products.find(productItem => productItem.id === item.id);
    return `<div class="cart-line">
      <div><strong>${product.icon} ${product.name}</strong><small>${money(product.price)} each</small></div>
      <div class="qty"><button aria-label="Decrease quantity" onclick="changeQuantity(${item.id}, -1)">−</button><span>${item.quantity}</span><button aria-label="Increase quantity" onclick="changeQuantity(${item.id}, 1)">+</button></div>
    </div>`;
  }).join('') : '<p style="color:#677085">Your cart is empty. Add something you love!</p>';
}

function openCart() {
  updateCart();
  openModal('cartModal');
}

function openModal(id) {
  get(id).classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal(id) {
  get(id).classList.remove('open');
  if (!document.querySelector('.modal.open')) document.body.classList.remove('modal-open');
}

function startCheckout() {
  if (!cart.length) return showToast('Your cart is empty. Add a product before checkout.');
  closeModal('cartModal');
  openModal('checkoutModal');
}

function placeOrder(event) {
  event.preventDefault();
  closeModal('checkoutModal');
  cart = [];
  updateCart();
  showToast('Thank you! Your order has been placed successfully.');
  event.target.reset();
}

function showToast(message) {
  const toast = get('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCart();
  get('searchForm').addEventListener('submit', event => {
    event.preventDefault();
    renderProducts();
    get('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  get('searchInput').addEventListener('input', renderProducts);
  document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal.id);
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.modal.open').forEach(modal => closeModal(modal.id));
  });
});
