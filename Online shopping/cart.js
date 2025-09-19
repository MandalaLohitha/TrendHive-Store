// cart.js - TrendHive persistent cart
(function(){
  const STORAGE_KEY = 'trendhive_cart_v1';
  let cart = [];

  // ---------- Utility functions ----------
  function saveCart(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
  function loadCart(){
    const raw = localStorage.getItem(STORAGE_KEY);
    cart = raw ? JSON.parse(raw) : [];
  }
  function computeTotal(){
    return cart.reduce((sum, it) => sum + (Number(it.price) * (Number(it.qty) || 1)), 0);
  }

  // ---------- Update Cart UI ----------
  function updateCartUI(){
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const countBadge = document.getElementById('cart-count-badge');

    if(cartItemsEl && cartTotalEl){
      cartItemsEl.innerHTML = '';
      cart.forEach((item, idx) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        const text = document.createElement('span');
        text.textContent = `${item.name} (₹${item.price}) x ${item.qty || 1}`;
        li.appendChild(text);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '8px';
        removeBtn.onclick = () => removeFromCart(idx);

        li.appendChild(removeBtn);
        cartItemsEl.appendChild(li);
      });
      cartTotalEl.textContent = computeTotal();
    }

    if(countBadge){
      const count = cart.reduce((n,i) => n + (Number(i.qty) || 1), 0);
      countBadge.textContent = count;
      countBadge.style.display = count ? 'inline-block' : 'none';
    }
  }

  // ---------- Cart Actions ----------
  function addToCart(name, price, qty = 1){
    price = Number(price);
    qty = Number(qty) || 1;

    const existing = cart.find(it => it.name === name && Number(it.price) === price);
    if(existing) existing.qty = (Number(existing.qty) || 1) + qty;
    else cart.push({ name, price, qty });

    saveCart();
    updateCartUI();
    showToast(`${name} added to cart`);
  }

  function removeFromCart(index){
    if(index >= 0 && index < cart.length){
      cart.splice(index, 1);
      saveCart();
      updateCartUI();
    }
  }

  function clearCart(){
    cart = [];
    saveCart();
    updateCartUI();
  }

  function toggleCart(){
    const cartDiv = document.getElementById('cart');
    if(!cartDiv){
      alert(`Cart saved (${cart.reduce((n,i)=> n + (Number(i.qty)||1), 0)} items). Go to Home to view cart.`);
      return;
    }
    cartDiv.style.display = (cartDiv.style.display === 'none') ? 'block' : 'none';
  }

  // ---------- Toast Notification ----------
  let toastTimer;
  function showToast(msg){
    let toast = document.getElementById('cart-toast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      Object.assign(toast.style, {
        position: 'fixed', right: '20px', bottom: '20px', padding: '10px 14px',
        background: '#111', color: '#fff', borderRadius: '8px', zIndex: 99999, opacity: 1
      });
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> { toast.style.opacity = '0'; }, 1800);
  }

  // ---------- Expose to HTML ----------
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.toggleCart = toggleCart;
  window.clearCart = clearCart;

  // ---------- Init on Page Load ----------
  document.addEventListener('DOMContentLoaded', function(){
    loadCart();
    updateCartUI();

    // Auto-bind buttons with class "add-cart"
    document.querySelectorAll('.add-cart').forEach(btn => {
      btn.addEventListener('click', function(){
        const name = btn.dataset.name || btn.getAttribute('data-name');
        const price = btn.dataset.price || btn.getAttribute('data-price') || 0;
        const qty = btn.dataset.qty || btn.getAttribute('data-qty') || 1;
        addToCart(name, price, qty);
      });
    });

    // ✅ Detect home page correctly
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    const isHome = (currentPage === "" || currentPage === "home.html" || currentPage === "index.html");

    // Show floating 🛒 only on sub pages
    if(!isHome){
      if(!document.getElementById('open-cart-btn')){
        const btn = document.createElement('button');
        btn.id = 'open-cart-btn';
        btn.title = 'Open Cart';
        btn.innerHTML = `🛒 <span id="cart-count-badge"></span>`;
        Object.assign(btn.style, {
          position:'fixed', right:'16px', top:'16px', zIndex:99998, padding:'8px 12px',
          borderRadius:'24px', background:'#000', color:'#fff', border:'none', cursor:'pointer'
        });
        document.body.appendChild(btn);

        btn.onclick = function(){
          window.location.href = "cart.html";
        };

        const badge = document.getElementById('cart-count-badge');
        badge.style.display = 'none';
        badge.style.marginLeft = '8px';
        badge.style.background = 'red';
        badge.style.padding = '2px 6px';
        badge.style.borderRadius = '12px';
        badge.style.fontWeight = '700';
      }
    }
  });
})();
