const products = [
  {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'Electronics',
    emoji: '🎧',
    price: 7499,
    old: 8999,
    rating: 4.7,
    reviews: 386,
    badge: '17% OFF'
  },
  {
    id: 2,
    name: 'Smart Fitness Watch with Heart Rate Monitor',
    category: 'Sports',
    emoji: '⌚',
    price: 5299,
    old: 6499,
    rating: 4.5,
    reviews: 211,
    badge: '18% OFF'
  },
  {
    id: 3,
    name: 'Everyday Comfort Running Sneakers',
    category: 'Fashion',
    emoji: '👟',
    price: 3799,
    old: 4999,
    rating: 4.6,
    reviews: 143,
    badge: '24% OFF'
  },
  {
    id: 4,
    name: 'Portable Blender for Smoothies',
    category: 'Home',
    emoji: '🥤',
    price: 2899,
    old: 3499,
    rating: 4.4,
    reviews: 98,
    badge: '17% OFF'
  },
  {
    id: 5,
    name: 'Minimal Skincare Essentials Set',
    category: 'Beauty',
    emoji: '🧴',
    price: 2399,
    old: 2999,
    rating: 4.8,
    reviews: 267,
    badge: '20% OFF'
  },
  {
    id: 6,
    name: 'Compact Mechanical Keyboard',
    category: 'Electronics',
    emoji: '⌨️',
    price: 4599,
    old: 5499,
    rating: 4.5,
    reviews: 175,
    badge: '16% OFF'
  },
  {
    id: 7,
    name: 'Soft Cotton Everyday Tote Bag',
    category: 'Fashion',
    emoji: '👜',
    price: 1799,
    old: 2199,
    rating: 4.3,
    reviews: 89,
    badge: '18% OFF'
  },
  {
    id: 8,
    name: 'LED Desk Lamp with USB Charging',
    category: 'Home',
    emoji: '💡',
    price: 1999,
    old: 2699,
    rating: 4.6,
    reviews: 122,
    badge: '26% OFF'
  }
];


/* --------------------------------------------------
   CART & WISHLIST
   -------------------------------------------------- */

let cart = JSON.parse(
  localStorage.getItem('shop-at-arbash-cart') || '[]'
);

let wishlist = JSON.parse(
  localStorage.getItem('shop-at-arbash-wishlist') || '[]'
);

let activeCategory = 'all';
let query = '';


/* --------------------------------------------------
   HELPERS
   -------------------------------------------------- */

const money = (n) => 'PKR ' + n.toLocaleString('en-PK');


function save() {
  localStorage.setItem(
    'shop-at-arbash-cart',
    JSON.stringify(cart)
  );

  localStorage.setItem(
    'shop-at-arbash-wishlist',
    JSON.stringify(wishlist)
  );

  updateCartCount();
}


function updateCartCount() {
  const cartCount = document.getElementById('cartCount');

  if (cartCount) {
    cartCount.textContent = cart.reduce(
      (sum, item) => sum + item.qty,
      0
    );
  }
}


function stars(r) {
  return '★'.repeat(Math.round(r)) +
    '<small> ' + r + '</small>';
}


/* --------------------------------------------------
   PRODUCTS
   -------------------------------------------------- */

function renderProducts() {
  let filtered = products.filter(
    (p) =>
      (activeCategory === 'all' ||
        p.category === activeCategory) &&
      p.name.toLowerCase().includes(
        query.toLowerCase()
      )
  );

  const sortElement = document.getElementById('sort');

  if (sortElement) {
    const sort = sortElement.value;

    if (sort === 'priceLow') {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sort === 'priceHigh') {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }
  }

  const title = document.getElementById('productsTitle');
  const info = document.getElementById('resultInfo');
  const productsContainer = document.getElementById('products');

  if (!productsContainer) {
    return;
  }

  if (title) {
    title.textContent =
      activeCategory === 'all'
        ? 'Featured products'
        : activeCategory + ' picks';
  }

  if (info) {
    info.textContent =
      filtered.length +
      ' product' +
      (filtered.length === 1 ? '' : 's') +
      ' found';
  }

  productsContainer.innerHTML = filtered.length
    ? filtered
        .map(
          (p) => `
            <article class="card">

              <span class="badge">
                ${p.badge}
              </span>

              <button
                class="wish ${
                  wishlist.includes(p.id)
                    ? 'active'
                    : ''
                }"
                onclick="toggleWish(${p.id})"
                aria-label="Add to wishlist"
              >
                ${
                  wishlist.includes(p.id)
                    ? '♥'
                    : '♡'
                }
              </button>

              <div class="product-img">
                ${p.emoji}
              </div>

              <div class="card-body">

                <p class="product-name">
                  ${p.name}
                </p>

                <div class="rating">
                  ${'★'.repeat(
                    Math.round(p.rating)
                  )}
                  <small>
                    ${p.rating} (${p.reviews})
                  </small>
                </div>

                <div class="price">
                  ${money(p.price)}
                  <span class="old">
                    ${money(p.old)}
                  </span>
                </div>

                <div class="stock">
                  ✓ In stock
                </div>

                <button
                  class="add"
                  onclick="addToCart(${p.id})"
                >
                  Add to cart
                </button>

              </div>

            </article>
          `
        )
        .join('')
    : `
        <div class="empty">
          No products match your search.
          Try a different category or keyword.
        </div>
      `;
}


/* --------------------------------------------------
   CATEGORY FILTER
   -------------------------------------------------- */

function filterCategory(c, el) {
  activeCategory = c;
  query = '';

  const searchInput =
    document.getElementById('searchInput');

  if (searchInput) {
    searchInput.value = '';
  }

  document
    .querySelectorAll('.nav button')
    .forEach((button) => {
      button.classList.remove('active');
    });

  if (el) {
    el.classList.add('active');
  }

  renderProducts();

  const productsContainer =
    document.getElementById('products');

  if (productsContainer) {
    productsContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}


/* --------------------------------------------------
   CART
   -------------------------------------------------- */

function addToCart(id) {
  const found = cart.find(
    (item) => item.id === id
  );

  if (found) {
    found.qty++;
  } else {
    cart.push({
      id: id,
      qty: 1
    });
  }

  save();

  showToast('Added to your cart');
}


function openCart() {
  renderCart();

  const modal =
    document.getElementById('cartModal');

  if (modal) {
    modal.classList.add('show');
  }
}


function renderCart() {
  const host =
    document.getElementById('cartItems');

  const total =
    document.getElementById('cartTotal');

  if (!host) {
    return;
  }

  if (!cart.length) {
    host.innerHTML = `
      <p style="color:#677085;padding:20px 0">
        Your cart is empty.
        Add a product to begin shopping.
      </p>
    `;

    if (total) {
      total.textContent = money(0);
    }

    return;
  }

  host.innerHTML = cart
    .map((item) => {
      const product = products.find(
        (p) => p.id === item.id
      );

      if (!product) {
        return '';
      }

      return `
        <div class="cart-row">

          <div class="cart-icon">
            ${product.emoji}
          </div>

          <div>

            <b>
              ${product.name}
            </b>

            <p>
              ${money(product.price)}
            </p>

            <div class="qty">

              <button
                onclick="changeQty(
                  ${product.id},
                  -1
                )"
              >
                −
              </button>

              <b>
                ${item.qty}
              </b>

              <button
                onclick="changeQty(
                  ${product.id},
                  1
                )"
              >
                +
              </button>

              <button
                class="remove"
                onclick="removeItem(
                  ${product.id}
                )"
              >
                Remove
              </button>

            </div>

          </div>

          <b>
            ${money(
              product.price * item.qty
            )}
          </b>

        </div>
      `;
    })
    .join('');

  const cartTotal = cart.reduce(
    (sum, item) => {
      const product = products.find(
        (p) => p.id === item.id
      );

      return product
        ? sum + product.price * item.qty
        : sum;
    },
    0
  );

  if (total) {
    total.textContent = money(cartTotal);
  }
}


function changeQty(id, d) {
  const item = cart.find(
    (x) => x.id === id
  );

  if (!item) {
    return;
  }

  item.qty += d;

  if (item.qty < 1) {
    cart = cart.filter(
      (x) => x.id !== id
    );
  }

  save();
  renderCart();
}


function removeItem(id) {
  cart = cart.filter(
    (item) => item.id !== id
  );

  save();
  renderCart();
}


/* --------------------------------------------------
   WISHLIST
   -------------------------------------------------- */

function toggleWish(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(
      (x) => x !== id
    );

    showToast(
      'Removed from your wishlist'
    );
  } else {
    wishlist = [
      ...wishlist,
      id
    ];

    showToast(
      'Saved to your wishlist'
    );
  }

  save();
  renderProducts();
}


/* --------------------------------------------------
   MODALS
   -------------------------------------------------- */

function closeModal(id) {
  const modal =
    document.getElementById(id);

  if (modal) {
    modal.classList.remove('show');
  }
}


function startCheckout() {
  if (!cart.length) {
    showToast('Your cart is empty');
    return;
  }

  closeModal('cartModal');

  const checkout =
    document.getElementById(
      'checkoutModal'
    );

  if (checkout) {
    checkout.classList.add('show');
  }
}


/* --------------------------------------------------
   CHECKOUT
   -------------------------------------------------- */

function placeOrder(e) {
  e.preventDefault();

  cart = [];

  save();

  closeModal('checkoutModal');

  showToast(
    'Order placed successfully — thank you!'
  );
}


/* --------------------------------------------------
   TOAST
   -------------------------------------------------- */

function showToast(msg) {
  const toast =
    document.getElementById('toast');

  if (!toast) {
    return;
  }

  toast.textContent = msg;

  toast.classList.add('show');

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer = setTimeout(
    () => {
      toast.classList.remove('show');
    },
    2600
  );
}


/* --------------------------------------------------
   SEARCH
   -------------------------------------------------- */

const searchForm =
  document.getElementById('searchForm');

if (searchForm) {
  searchForm.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();

      const searchInput =
        document.getElementById(
          'searchInput'
        );

      const searchCategory =
        document.getElementById(
          'searchCategory'
        );

      query = searchInput
        ? searchInput.value.trim()
        : '';

      activeCategory =
        searchCategory
          ? searchCategory.value
          : 'all';

      renderProducts();

      const productsContainer =
        document.getElementById(
          'products'
        );

      if (productsContainer) {
        productsContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  );
}


/* --------------------------------------------------
   MODAL BACKDROP
   -------------------------------------------------- */

document
  .querySelectorAll('.modal')
  .forEach((modal) => {
    modal.addEventListener(
      'click',
      (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      }
    );
  });


/* --------------------------------------------------
   INITIALIZE
   -------------------------------------------------- */

updateCartCount();
renderProducts();
