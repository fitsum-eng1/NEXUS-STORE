// Cart Page JavaScript


class CartPage {
  constructor() {
    this.appliedPromos = []
    this.recommendations = []
    this.recentlyViewed = []
    this.init()
  }

  async init() {
    this.bindEvents()
    this.initAOS()
    await this.loadCartItems()
    await this.loadRecommendations()
    await this.loadRecentlyViewed()
    this.updateSummary()
  }

  // Initialize AOS
  initAOS() {
    if (window.AOS) {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 50,
      })
    }
  }

  // Bind event listeners
  bindEvents() {
    // Promo code application
    const applyPromoBtn = document.getElementById("apply-promo-btn")
    const promoInput = document.getElementById("promo-input")

    if (applyPromoBtn && promoInput) {
      applyPromoBtn.addEventListener("click", () => this.applyPromoCode())
      promoInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.applyPromoCode()
        }
      })
    }

    // Promo suggestions
    document.addEventListener("click", (e) => {
      if (e.target.matches(".promo-suggestion")) {
        const code = e.target.dataset.code
        this.applyPromoCode(code)
      }
    })

    // Clear cart
    const clearCartBtn = document.getElementById("clear-cart-btn")
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => this.clearCart())
    }

    // Save for later
    const saveForLaterBtn = document.getElementById("save-for-later-btn")
    if (saveForLaterBtn) {
      saveForLaterBtn.addEventListener("click", () => this.saveForLater())
    }

    // Listen to cart changes
    if (window.cart) {
      window.cart.addListener(() => {
        this.loadCartItems()
        this.updateSummary()
      })
    }
  }

  // Load cart items
  async loadCartItems() {
    const container = document.getElementById("cart-items-container")
    if (!container) return

    const cartItems = window.cart ? window.cart.getItems() : []

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-full">
          <i class="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <a href="shop.html" class="btn btn-primary btn-large">
            <i class="fas fa-shopping-bag"></i>
            Start Shopping
          </a>
        </div>
      `
      return
    }

    container.innerHTML = cartItems
      .map(
        (item, index) => `
      <div class="cart-item-full" data-product-id="${item.id}" data-index="${index}">
        <div class="item-image-full">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          ${item.originalPrice && item.originalPrice > item.price ? `<div class="item-sale-badge">SALE</div>` : ""}
        </div>
        
        <div class="item-details-full">
          <h3 class="item-title-full">
            <a href="product.html?id=${item.id}">${item.name}</a>
          </h3>
          <div class="item-meta-full">
            <div class="item-brand-full">${item.brand || ""}</div>
            ${
              Object.keys(item.options).length > 0
                ? `
              <div class="item-options-full">
                ${Object.entries(item.options)
                  .map(([key, value]) => (value ? `<span class="option-full">${key}: ${value}</span>` : ""))
                  .join("")}
              </div>
            `
                : ""
            }
          </div>
          <div class="item-price-full">
            $${item.price.toFixed(2)}
            ${
              item.originalPrice && item.originalPrice > item.price
                ? `<span class="item-original-price-full">$${item.originalPrice.toFixed(2)}</span>`
                : ""
            }
          </div>
          <div class="item-stock-status">
            <i class="fas fa-circle stock-in"></i>
            <span>In Stock</span>
          </div>
        </div>
        
        <div class="item-quantity-full">
          <div class="quantity-controls-full">
            <button class="qty-btn-full" data-action="decrease" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
            <input type="number" class="qty-input-full" value="${item.quantity}" min="1" max="99">
            <button class="qty-btn-full" data-action="increase">+</button>
          </div>
          <div class="item-total-full">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        
        <div class="item-actions-full">
          <button class="item-action-btn-full wishlist" data-product-id="${item.id}">
            <i class="far fa-heart"></i>
            Save for Later
          </button>
          <button class="item-action-btn-full remove" data-product-id="${item.id}">
            <i class="fas fa-trash"></i>
            Remove
          </button>
        </div>
      </div>
    `,
      )
      .join("")

    this.bindCartItemEvents()
  }

  // Bind cart item events
  bindCartItemEvents() {
    const container = document.getElementById("cart-items-container")
    if (!container) return

    container.addEventListener("click", (e) => {
      const item = e.target.closest(".cart-item-full")
      if (!item) return

      const productId = Number.parseInt(item.dataset.productId)
      const index = Number.parseInt(item.dataset.index)
      const cartItem = window.cart ? window.cart.getItems()[index] : null

      if (e.target.matches(".qty-btn-full")) {
        const action = e.target.dataset.action
        const qtyInput = item.querySelector(".qty-input-full")
        let quantity = Number.parseInt(qtyInput.value)

        if (action === "increase") {
          quantity++
        } else if (action === "decrease" && quantity > 1) {
          quantity--
        }

        qtyInput.value = quantity
        if (window.cart && cartItem) {
          window.cart.updateQuantity(productId, quantity, cartItem.options)
        }
      }

      if (e.target.matches(".remove, .remove *")) {
        if (window.cart && cartItem) {
          window.cart.removeFromCart(productId, cartItem.options)
        }
      }

      if (e.target.matches(".wishlist, .wishlist *")) {
        if (window.cart && cartItem) {
          window.cart.moveToWishlist(productId, cartItem.options)
        }
      }
    })

    container.addEventListener("change", (e) => {
      if (e.target.matches(".qty-input-full")) {
        const item = e.target.closest(".cart-item-full")
        const productId = Number.parseInt(item.dataset.productId)
        const index = Number.parseInt(item.dataset.index)
        const cartItem = window.cart ? window.cart.getItems()[index] : null
        const quantity = Number.parseInt(e.target.value)

        if (quantity > 0 && quantity <= 99 && window.cart && cartItem) {
          window.cart.updateQuantity(productId, quantity, cartItem.options)
        } else if (cartItem) {
          e.target.value = cartItem.quantity
        }
      }
    })
  }

  // Update summary
  updateSummary() {
    const summaryDetails = document.getElementById("summary-details")
    if (!summaryDetails || !window.cart) return

    const subtotal = window.cart.getSubtotal()
    const discount = window.cart.getDiscount()
    const tax = window.cart.getTax()
    const shipping = window.cart.getShipping()
    const total = window.cart.getFinalTotal()
    const savings = window.cart.getSavings()
    const itemCount = window.cart.getItemCount()

    // Calculate shipping progress
    const shippingThreshold = window.cart.settings?.shippingThreshold || 50
    const shippingProgress = Math.min((subtotal / shippingThreshold) * 100, 100)
    const remainingForFreeShipping = Math.max(shippingThreshold - subtotal, 0)

    summaryDetails.innerHTML = `
      <div class="summary-row">
        <span>Subtotal (${itemCount} items):</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      
      ${
        discount > 0
          ? `
        <div class="summary-row discount">
          <span>Discount:</span>
          <span>-$${discount.toFixed(2)}</span>
        </div>
      `
          : ""
      }
      
      ${
        this.appliedPromos.length > 0
          ? this.appliedPromos
              .map(
                (promo) => `
          <div class="summary-row discount">
            <span>${promo.code} (${promo.description}):</span>
            <span>-$${promo.amount.toFixed(2)}</span>
          </div>
        `,
              )
              .join("")
          : ""
      }
      
      ${
        savings > 0
          ? `
        <div class="summary-row savings">
          <span>You Save:</span>
          <span>$${savings.toFixed(2)}</span>
        </div>
      `
          : ""
      }
      
      <div class="summary-row">
        <span>Tax:</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      
      <div class="summary-row">
        <span>Shipping:</span>
        <span>${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
      </div>
      
      ${
        remainingForFreeShipping > 0
          ? `
        <div class="shipping-progress">
          <div class="progress-text">
            Add $${remainingForFreeShipping.toFixed(2)} more for free shipping
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${shippingProgress}%"></div>
          </div>
        </div>
      `
          : `
        <div class="shipping-progress">
          <div class="progress-text" style="color: var(--success-color);">
            <i class="fas fa-check"></i> You qualify for free shipping!
          </div>
        </div>
      `
      }
      
      <div class="summary-row total">
        <span>Total:</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    `

    // Update checkout button
    const checkoutBtn = document.getElementById("checkout-btn")
    if (checkoutBtn) {
      checkoutBtn.style.display = itemCount > 0 ? "flex" : "none"
    }
  }

  // Apply promo code
  applyPromoCode(code = null) {
    const promoInput = document.getElementById("promo-input")
    const promoCode = code || (promoInput ? promoInput.value.trim().toUpperCase() : "")

    if (!promoCode) {
      this.showNotification("Please enter a promo code", "warning")
      return
    }

    // Check if already applied
    if (this.appliedPromos.some((promo) => promo.code === promoCode)) {
      this.showNotification("Promo code already applied", "warning")
      return
    }

    // Validate promo code
    const promo = this.validatePromoCode(promoCode)
    if (!promo) {
      this.showNotification("Invalid promo code", "error")
      return
    }

    // Apply promo
    this.appliedPromos.push(promo)
    this.updateSummary()
    this.showNotification(`Promo code ${promoCode} applied successfully!`, "success")

    if (promoInput) {
      promoInput.value = ""
    }
  }

  // Validate promo code
  validatePromoCode(code) {
    const promoCodes = {
      SAVE10: {
        code: "SAVE10",
        description: "10% off",
        type: "percentage",
        value: 0.1,
        minOrder: 50,
      },
      SAVE20: {
        code: "SAVE20",
        description: "20% off",
        type: "percentage",
        value: 0.2,
        minOrder: 100,
      },
      FREESHIP: {
        code: "FREESHIP",
        description: "Free shipping",
        type: "shipping",
        value: 0,
        minOrder: 0,
      },
      WELCOME15: {
        code: "WELCOME15",
        description: "$15 off",
        type: "fixed",
        value: 15,
        minOrder: 75,
      },
    }

    const promo = promoCodes[code]
    if (!promo) return null

    const subtotal = window.cart ? window.cart.getSubtotal() : 0
    if (subtotal < promo.minOrder) {
      this.showNotification(`Minimum order of $${promo.minOrder} required for this promo`, "warning")
      return null
    }

    // Calculate discount amount
    let amount = 0
    switch (promo.type) {
      case "percentage":
        amount = subtotal * promo.value
        break
      case "fixed":
        amount = promo.value
        break
      case "shipping":
        amount = window.cart ? window.cart.getShipping() : 0
        break
    }

    return {
      ...promo,
      amount,
    }
  }

  // Clear cart
  clearCart() {
    if (!window.cart) return

    const itemCount = window.cart.getItemCount()
    if (itemCount === 0) {
      this.showNotification("Cart is already empty", "info")
      return
    }

    if (confirm(`Are you sure you want to remove all ${itemCount} items from your cart?`)) {
      window.cart.clearCart()
      this.appliedPromos = []
    }
  }

  // Save for later
  saveForLater() {
    this.showNotification("Save for later feature coming soon!", "info")
  }

  // Load recommendations
  async loadRecommendations() {
    try {
      // Get cart items to base recommendations on
      const cartItems = window.cart ? window.cart.getItems() : []
      if (cartItems.length === 0) return

      // Get related products based on cart items
      const categories = [...new Set(cartItems.map((item) => item.category))]
      let recommendations = []

      for (const category of categories) {
        const categoryProducts = window.productData ? window.productData.getProductsByCategory(category, 3) : []
        recommendations = recommendations.concat(
          categoryProducts.filter((product) => !cartItems.some((item) => item.id === product.id)),
        )
      }

      this.recommendations = recommendations.slice(0, 6)
      this.renderRecommendations()
    } catch (error) {
      console.error("Error loading recommendations:", error)
    }
  }

  // Render recommendations
  renderRecommendations() {
    const container = document.getElementById("recommendations-grid")
    if (!container || this.recommendations.length === 0) {
      const recommendationsSection = document.getElementById("cart-recommendations")
      if (recommendationsSection) {
        recommendationsSection.style.display = "none"
      }
      return
    }

    container.innerHTML = this.recommendations
      .map(
        (product) => `
      <div class="recommendation-item" data-product-id="${product.id}">
        <div class="recommendation-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="recommendation-title">${product.name}</div>
        <div class="recommendation-price">$${product.price.toFixed(2)}</div>
        <button class="recommendation-btn" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `,
      )
      .join("")

    // Bind recommendation events
    container.addEventListener("click", (e) => {
      if (e.target.matches(".recommendation-btn")) {
        const productId = Number.parseInt(e.target.dataset.productId)
        if (window.cart) {
          window.cart.addToCart(productId)
        }
      }

      if (e.target.matches(".recommendation-item, .recommendation-item *:not(.recommendation-btn)")) {
        const item = e.target.closest(".recommendation-item")
        const productId = item.dataset.productId
        window.location.href = `product.html?id=${productId}`
      }
    })
  }

  // Load recently viewed
  async loadRecentlyViewed() {
    try {
      // Get recently viewed from localStorage or use sample data
      const recentlyViewed = JSON.parse(localStorage.getItem("nexus_recently_viewed") || "[]")

      if (recentlyViewed.length === 0) {
        const recentlyViewedSection = document.getElementById("recently-viewed")
        if (recentlyViewedSection) {
          recentlyViewedSection.style.display = "none"
        }
        return
      }

      this.recentlyViewed = recentlyViewed.slice(0, 4)
      this.renderRecentlyViewed()
    } catch (error) {
      console.error("Error loading recently viewed:", error)
    }
  }

  // Render recently viewed
  renderRecentlyViewed() {
    const container = document.getElementById("recently-viewed-grid")
    if (!container || this.recentlyViewed.length === 0) return

    container.innerHTML = this.recentlyViewed
      .map(
        (product) => `
      <div class="product-card" data-aos="fade-up">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-actions">
            <button class="action-btn quick-view-btn" data-product-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn wishlist-btn" data-product-id="${product.id}">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">
            <a href="product.html?id=${product.id}">${product.name}</a>
          </h3>
          <div class="product-price">
            <span class="price-current">$${product.price.toFixed(2)}</span>
          </div>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  }

  // Show notification
  showNotification(message, type = "info") {
    const container = document.getElementById("notification-container")
    if (!container) return

    const notification = document.createElement("div")
    notification.className = `notification ${type}`

    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    notification.innerHTML = `
      <div class="notification-content">
        <i class="notification-icon ${icons[type]}"></i>
        <div class="notification-text">
          <div class="notification-message">${message}</div>
        </div>
      </div>
    `

    container.appendChild(notification)

    // Show notification
    setTimeout(() => notification.classList.add("show"), 100)

    // Auto remove
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.cartPage = new CartPage()
})
