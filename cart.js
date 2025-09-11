// Shopping Cart Management - Complete Implementation
class ShoppingCart {
  constructor() {
    this.items = this.loadCart()
    this.listeners = []
    this.wishlist = this.loadWishlist()
    this.cartHistory = this.loadCartHistory()
    this.settings = this.loadSettings()
    this.init()
  }

  init() {
    this.updateCartUI()
    this.bindEvents()
    this.initCartAnimations()
    this.setupAutoSave()
  }

  // Load cart from localStorage
  loadCart() {
    try {
      const saved = localStorage.getItem("nexus_cart")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading cart:", error)
      return []
    }
  }

  // Load wishlist from localStorage
  loadWishlist() {
    try {
      const saved = localStorage.getItem("nexus_wishlist")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading wishlist:", error)
      return []
    }
  }

  // Load cart history
  loadCartHistory() {
    try {
      const saved = localStorage.getItem("nexus_cart_history")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading cart history:", error)
      return []
    }
  }

  // Load settings
  loadSettings() {
    try {
      const saved = localStorage.getItem("nexus_cart_settings")
      return saved
        ? JSON.parse(saved)
        : {
            currency: "USD",
            taxRate: 0.08,
            shippingThreshold: 50,
            autoSave: true,
            notifications: true,
          }
    } catch (error) {
      console.error("Error loading settings:", error)
      return {
        currency: "USD",
        taxRate: 0.08,
        shippingThreshold: 50,
        autoSave: true,
        notifications: true,
      }
    }
  }

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem("nexus_cart", JSON.stringify(this.items))
      this.saveCartHistory()
      this.notifyListeners()

      if (this.settings.notifications) {
        this.updateCartBadge()
      }
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  // Save wishlist
  saveWishlist() {
    try {
      localStorage.setItem("nexus_wishlist", JSON.stringify(this.wishlist))
    } catch (error) {
      console.error("Error saving wishlist:", error)
    }
  }

  // Save cart history
  saveCartHistory() {
    try {
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: "cart_updated",
        itemCount: this.getItemCount(),
        total: this.getTotal(),
      }

      this.cartHistory.unshift(historyEntry)

      // Keep only last 50 entries
      if (this.cartHistory.length > 50) {
        this.cartHistory = this.cartHistory.slice(0, 50)
      }

      localStorage.setItem("nexus_cart_history", JSON.stringify(this.cartHistory))
    } catch (error) {
      console.error("Error saving cart history:", error)
    }
  }

  // Save settings
  saveSettings() {
    try {
      localStorage.setItem("nexus_cart_settings", JSON.stringify(this.settings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  // Setup auto-save
  setupAutoSave() {
    if (this.settings.autoSave) {
      setInterval(() => {
        this.saveCart()
      }, 30000) // Auto-save every 30 seconds
    }
  }

  // Initialize cart animations
  initCartAnimations() {
    // Add CSS for cart animations
    const style = document.createElement("style")
    style.textContent = `
      .cart-item-enter {
        animation: cartItemEnter 0.5s ease-out;
      }
      
      .cart-item-exit {
        animation: cartItemExit 0.3s ease-in;
      }
      
      @keyframes cartItemEnter {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes cartItemExit {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(20px);
        }
      }
      
      .cart-bounce {
        animation: cartBounce 0.6s ease;
      }
      
      @keyframes cartBounce {
        0%, 20%, 53%, 80%, 100% {
          transform: translate3d(0,0,0);
        }
        40%, 43% {
          transform: translate3d(0,-30px,0);
        }
        70% {
          transform: translate3d(0,-15px,0);
        }
        90% {
          transform: translate3d(0,-4px,0);
        }
      }
      
      .cart-shake {
        animation: cartShake 0.5s ease-in-out;
      }
      
      @keyframes cartShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      }
    `
    document.head.appendChild(style)
  }

  // Add event listeners
  bindEvents() {
    // Cart button click
    const cartBtn = document.getElementById("cart-btn")
    if (cartBtn) {
      cartBtn.addEventListener("click", () => this.toggleCart())
    }

    // Cart close button
    const cartClose = document.getElementById("cart-close")
    if (cartClose) {
      cartClose.addEventListener("click", () => this.closeCart())
    }

    // Cart overlay
    const cartOverlay = document.getElementById("cart-overlay")
    if (cartOverlay) {
      cartOverlay.addEventListener("click", () => this.closeCart())
    }

    // Add to cart buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".add-to-cart-btn, .add-to-cart-btn *")) {
        const btn = e.target.closest(".add-to-cart-btn")
        const productId = btn.dataset.productId
        if (productId) {
          this.addToCart(Number.parseInt(productId))
        }
      }
    })

    // Wishlist buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".wishlist-btn, .wishlist-btn *")) {
        const btn = e.target.closest(".wishlist-btn")
        const productId = btn.dataset.productId
        if (productId) {
          this.toggleWishlist(Number.parseInt(productId), btn)
        }
      }
    })

    // Quick add buttons (for quantity)
    document.addEventListener("click", (e) => {
      if (e.target.matches(".quick-add-btn")) {
        const productId = Number.parseInt(e.target.dataset.productId)
        const quantity = Number.parseInt(e.target.dataset.quantity) || 1
        this.addToCart(productId, quantity)
      }
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault()
            this.toggleCart()
            break
          case "Escape":
            this.closeCart()
            break
        }
      }
    })

    // Window beforeunload (save cart before leaving)
    window.addEventListener("beforeunload", () => {
      this.saveCart()
    })
  }

  // Add item to cart
  addToCart(productId, quantity = 1, options = {}) {
    const product = window.productData?.getProductById(productId)
    if (!product) {
      this.showNotification("Product not found", "error")
      return false
    }

    // Check stock availability
    if (!product.inStock) {
      this.showNotification("Product is out of stock", "error")
      return false
    }

    // Validate quantity
    if (quantity <= 0) {
      this.showNotification("Invalid quantity", "error")
      return false
    }

    const existingItem = this.items.find(
      (item) => item.id === productId && JSON.stringify(item.options) === JSON.stringify(options),
    )

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.updatedAt = new Date().toISOString()
    } else {
      this.items.push({
        id: productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        brand: product.brand,
        quantity: quantity,
        options: options,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    this.saveCart()
    this.updateCartUI()
    this.showNotification(`${product.name} added to cart`, "success")
    this.animateCartButton()
    this.trackEvent("add_to_cart", { productId, quantity, price: product.price })

    return true
  }

  // Remove item from cart
  removeFromCart(productId, options = {}) {
    const index = this.items.findIndex(
      (item) => item.id === productId && JSON.stringify(item.options) === JSON.stringify(options),
    )

    if (index > -1) {
      const item = this.items[index]
      this.items.splice(index, 1)
      this.saveCart()
      this.updateCartUI()
      this.showNotification(`${item.name} removed from cart`, "success")
      this.trackEvent("remove_from_cart", { productId, price: item.price })
      return true
    }
    return false
  }

  // Update item quantity
  updateQuantity(productId, quantity, options = {}) {
    const item = this.items.find(
      (item) => item.id === productId && JSON.stringify(item.options) === JSON.stringify(options),
    )

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId, options)
      } else {
        const oldQuantity = item.quantity
        item.quantity = quantity
        item.updatedAt = new Date().toISOString()
        this.saveCart()
        this.updateCartUI()
        this.trackEvent("update_quantity", {
          productId,
          oldQuantity,
          newQuantity: quantity,
        })
      }
      return true
    }
    return false
  }

  // Clear cart
  clearCart() {
    const itemCount = this.getItemCount()
    this.items = []
    this.saveCart()
    this.updateCartUI()
    this.showNotification("Cart cleared", "success")
    this.trackEvent("clear_cart", { itemCount })
  }

  // Move item to wishlist
  moveToWishlist(productId, options = {}) {
    const item = this.items.find(
      (item) => item.id === productId && JSON.stringify(item.options) === JSON.stringify(options),
    )

    if (item) {
      this.addToWishlist(productId)
      this.removeFromCart(productId, options)
      this.showNotification(`${item.name} moved to wishlist`, "success")
      return true
    }
    return false
  }

  // Add to wishlist
  addToWishlist(productId) {
    const product = window.productData?.getProductById(productId)
    if (!product) {
      this.showNotification("Product not found", "error")
      return false
    }

    const existingItem = this.wishlist.find((item) => item.id === productId)
    if (existingItem) {
      this.showNotification("Product already in wishlist", "warning")
      return false
    }

    this.wishlist.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      addedAt: new Date().toISOString(),
    })

    this.saveWishlist()
    this.showNotification(`${product.name} added to wishlist`, "success")
    this.trackEvent("add_to_wishlist", { productId })
    return true
  }

  // Remove from wishlist
  removeFromWishlist(productId) {
    const index = this.wishlist.findIndex((item) => item.id === productId)
    if (index > -1) {
      const item = this.wishlist[index]
      this.wishlist.splice(index, 1)
      this.saveWishlist()
      this.showNotification(`${item.name} removed from wishlist`, "success")
      this.trackEvent("remove_from_wishlist", { productId })
      return true
    }
    return false
  }

  // Toggle wishlist
  toggleWishlist(productId, btn = null) {
    const isInWishlist = this.wishlist.some((item) => item.id === productId)

    if (isInWishlist) {
      this.removeFromWishlist(productId)
      if (btn) {
        btn.classList.remove("active")
        const icon = btn.querySelector("i")
        if (icon) icon.className = "far fa-heart"
      }
    } else {
      this.addToWishlist(productId)
      if (btn) {
        btn.classList.add("active")
        const icon = btn.querySelector("i")
        if (icon) icon.className = "fas fa-heart"
      }
    }
  }

  // Get cart items
  getItems() {
    return this.items
  }

  // Get cart count
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Get unique items count
  getUniqueItemCount() {
    return this.items.length
  }

  // Get cart total
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Get subtotal
  getSubtotal() {
    return this.getTotal()
  }

  // Get discount amount
  getDiscount() {
    let discount = 0
    const subtotal = this.getSubtotal()

    // Apply quantity discounts
    if (this.getItemCount() >= 10) {
      discount += subtotal * 0.1 // 10% discount for 10+ items
    } else if (this.getItemCount() >= 5) {
      discount += subtotal * 0.05 // 5% discount for 5+ items
    }

    // Apply category discounts
    const electronicsItems = this.items.filter((item) => item.category === "electronics")
    if (electronicsItems.length >= 2) {
      const electronicsTotal = electronicsItems.reduce((total, item) => total + item.price * item.quantity, 0)
      discount += electronicsTotal * 0.15 // 15% discount on electronics
    }

    return discount
  }

  // Get tax amount
  getTax() {
    const taxableAmount = this.getSubtotal() - this.getDiscount()
    return taxableAmount * this.settings.taxRate
  }

  // Get shipping cost
  getShipping() {
    const subtotal = this.getSubtotal()
    const freeShippingThreshold = this.settings.shippingThreshold

    if (subtotal >= freeShippingThreshold) {
      return 0
    }

    // Calculate shipping based on weight/size
    let shippingCost = 9.99
    const itemCount = this.getItemCount()

    if (itemCount > 5) {
      shippingCost += (itemCount - 5) * 2.99
    }

    return Math.min(shippingCost, 29.99) // Cap at $29.99
  }

  // Get final total including tax and shipping
  getFinalTotal() {
    return this.getSubtotal() - this.getDiscount() + this.getTax() + this.getShipping()
  }

  // Get savings amount
  getSavings() {
    return (
      this.items.reduce((savings, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
          return savings + (item.originalPrice - item.price) * item.quantity
        }
        return savings
      }, 0) + this.getDiscount()
    )
  }

  // Toggle cart sidebar
  toggleCart() {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartOverlay = document.getElementById("cart-overlay")

    if (cartSidebar && cartOverlay) {
      const isOpen = cartSidebar.classList.contains("open")

      if (isOpen) {
        this.closeCart()
      } else {
        this.openCart()
      }
    }
  }

  // Open cart sidebar
  openCart() {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartOverlay = document.getElementById("cart-overlay")

    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.add("open")
      cartOverlay.classList.add("active")
      document.body.style.overflow = "hidden"

      // Focus management for accessibility
      const firstFocusable = cartSidebar.querySelector(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (firstFocusable) {
        firstFocusable.focus()
      }

      this.trackEvent("cart_opened")
    }
  }

  // Close cart sidebar
  closeCart() {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartOverlay = document.getElementById("cart-overlay")

    if (cartSidebar && cartOverlay) {
      cartSidebar.classList.remove("open")
      cartOverlay.classList.remove("active")
      document.body.style.overflow = ""
      this.trackEvent("cart_closed")
    }
  }

  // Update cart UI
  updateCartUI() {
    this.updateCartCount()
    this.updateCartContent()
    this.updateCartFooter()
    this.updateCartBadge()
  }

  // Update cart count badge
  updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    if (cartCount) {
      const count = this.getItemCount()
      cartCount.textContent = count
      cartCount.style.display = count > 0 ? "block" : "none"

      // Animate count change
      if (count > 0) {
        cartCount.classList.remove("cart-bounce")
        cartCount.offsetHeight // Trigger reflow
        cartCount.classList.add("cart-bounce")
      }
    }
  }

  // Update cart badge with additional info
  updateCartBadge() {
    const cartBtn = document.getElementById("cart-btn")
    if (cartBtn) {
      const count = this.getItemCount()
      const total = this.getTotal()

      cartBtn.title = count > 0 ? `${count} items - $${total.toFixed(2)}` : "Your cart is empty"
    }
  }

  // Update cart content
  updateCartContent() {
    const cartContent = document.getElementById("cart-content")
    if (!cartContent) return

    if (this.items.length === 0) {
      cartContent.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-cart"></i>
          <p>Your cart is empty</p>
          <p class="cart-empty-subtitle">Discover amazing products in our store</p>
          <a href="shop.html" class="btn btn-primary">Start Shopping</a>
          ${
            this.wishlist.length > 0
              ? `
            <button class="btn btn-outline" onclick="window.cart.showWishlist()">
              View Wishlist (${this.wishlist.length})
            </button>
          `
              : ""
          }
        </div>
      `
    } else {
      cartContent.innerHTML = this.items
        .map(
          (item, index) => `
        <div class="cart-item cart-item-enter" data-product-id="${item.id}" data-index="${index}">
          <div class="item-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            ${item.originalPrice && item.originalPrice > item.price ? `<div class="item-sale-badge">SALE</div>` : ""}
          </div>
          <div class="item-details">
            <div class="item-title">${item.name}</div>
            <div class="item-meta">
              <span class="item-brand">${item.brand || ""}</span>
              ${
                Object.keys(item.options).length > 0
                  ? `
                <div class="item-options">
                  ${Object.entries(item.options)
                    .map(([key, value]) => (value ? `<span class="option">${key}: ${value}</span>` : ""))
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
            <div class="item-price-section">
              <div class="item-price">$${item.price.toFixed(2)}</div>
              ${
                item.originalPrice && item.originalPrice > item.price
                  ? `<div class="item-original-price">$${item.originalPrice.toFixed(2)}</div>`
                  : ""
              }
              <div class="item-total">Total: $${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="item-quantity">
              <button class="qty-btn" data-action="decrease" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99">
              <button class="qty-btn" data-action="increase">+</button>
            </div>
          </div>
          <div class="item-actions">
            <button class="item-action-btn item-wishlist" data-product-id="${item.id}" title="Move to Wishlist">
              <i class="far fa-heart"></i>
            </button>
            <button class="item-action-btn item-remove" data-product-id="${item.id}" title="Remove from Cart">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `,
        )
        .join("")

      // Bind quantity controls
      this.bindQuantityControls()
    }
  }

  // Update cart footer
  updateCartFooter() {
    const cartFooter = document.getElementById("cart-footer")
    if (!cartFooter) return

    if (this.items.length === 0) {
      cartFooter.style.display = "none"
    } else {
      cartFooter.style.display = "block"

      const subtotal = this.getSubtotal()
      const discount = this.getDiscount()
      const tax = this.getTax()
      const shipping = this.getShipping()
      const total = this.getFinalTotal()
      const savings = this.getSavings()

      cartFooter.innerHTML = `
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal (${this.getItemCount()} items):</span>
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
            shipping > 0 && subtotal < this.settings.shippingThreshold
              ? `
            <div class="shipping-notice">
              <i class="fas fa-truck"></i>
              Add $${(this.settings.shippingThreshold - subtotal).toFixed(2)} more for free shipping
            </div>
          `
              : ""
          }
          <div class="summary-row total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
        <div class="cart-actions">
          <button class="btn btn-outline" onclick="window.cart.clearCart()">
            <i class="fas fa-trash"></i> Clear Cart
          </button>
          <a href="cart.html" class="btn btn-secondary">
            <i class="fas fa-shopping-cart"></i> View Cart
          </a>
          <a href="checkout.html" class="btn btn-primary">
            <i class="fas fa-credit-card"></i> Checkout
          </a>
        </div>
        <div class="cart-footer-info">
          <div class="security-badges">
            <i class="fas fa-shield-alt"></i> Secure Checkout
            <i class="fas fa-lock"></i> SSL Protected
          </div>
        </div>
      `
    }
  }

  // Bind quantity control events
  bindQuantityControls() {
    const cartContent = document.getElementById("cart-content")
    if (!cartContent) return

    cartContent.addEventListener("click", (e) => {
      const item = e.target.closest(".cart-item")
      if (!item) return

      const productId = Number.parseInt(item.dataset.productId)
      const index = Number.parseInt(item.dataset.index)
      const cartItem = this.items[index]

      if (e.target.matches(".qty-btn")) {
        const action = e.target.dataset.action
        const qtyInput = item.querySelector(".qty-input")
        let quantity = Number.parseInt(qtyInput.value)

        if (action === "increase") {
          quantity++
        } else if (action === "decrease" && quantity > 1) {
          quantity--
        }

        qtyInput.value = quantity
        this.updateQuantity(productId, quantity, cartItem.options)
      }

      if (e.target.matches(".item-remove, .item-remove *")) {
        // Add exit animation
        item.classList.add("cart-item-exit")
        setTimeout(() => {
          this.removeFromCart(productId, cartItem.options)
        }, 300)
      }

      if (e.target.matches(".item-wishlist, .item-wishlist *")) {
        this.moveToWishlist(productId, cartItem.options)
      }
    })

    cartContent.addEventListener("change", (e) => {
      if (e.target.matches(".qty-input")) {
        const item = e.target.closest(".cart-item")
        const productId = Number.parseInt(item.dataset.productId)
        const index = Number.parseInt(item.dataset.index)
        const cartItem = this.items[index]
        const quantity = Number.parseInt(e.target.value)

        if (quantity > 0 && quantity <= 99) {
          this.updateQuantity(productId, quantity, cartItem.options)
        } else {
          e.target.value = cartItem.quantity
        }
      }
    })
  }

  // Show wishlist
  showWishlist() {
    if (this.wishlist.length === 0) {
      this.showNotification("Your wishlist is empty", "info")
      return
    }

    // Create wishlist modal or redirect to wishlist page
    this.showNotification("Wishlist feature coming soon!", "info")
  }

  // Animate cart button
  animateCartButton() {
    const cartBtn = document.getElementById("cart-btn")
    if (cartBtn) {
      cartBtn.classList.remove("cart-bounce")
      cartBtn.offsetHeight // Trigger reflow
      cartBtn.classList.add("cart-bounce")

      // GSAP animation if available
      if (window.gsap) {
        window.gsap.to(cartBtn, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      }
    }
  }

  // Track events for analytics
  trackEvent(eventName, data = {}) {
    try {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", eventName, {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }

      // Custom analytics
      if (window.analytics) {
        window.analytics.track(eventName, data)
      }

      // Console log for development
      console.log(`Cart Event: ${eventName}`, data)
    } catch (error) {
      console.error("Error tracking event:", error)
    }
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

  // Export cart data
  exportCart(format = "json") {
    const cartData = {
      items: this.items,
      summary: {
        itemCount: this.getItemCount(),
        subtotal: this.getSubtotal(),
        discount: this.getDiscount(),
        tax: this.getTax(),
        shipping: this.getShipping(),
        total: this.getFinalTotal(),
        savings: this.getSavings(),
      },
      exportDate: new Date().toISOString(),
    }

    let content = ""
    let filename = ""
    let mimeType = ""

    switch (format) {
      case "json":
        content = JSON.stringify(cartData, null, 2)
        filename = `cart-${new Date().toISOString().split("T")[0]}.json`
        mimeType = "application/json"
        break
      case "csv":
        content = this.convertToCSV(this.items)
        filename = `cart-${new Date().toISOString().split("T")[0]}.csv`
        mimeType = "text/csv"
        break
    }

    this.downloadFile(content, filename, mimeType)
  }

  // Convert items to CSV
  convertToCSV(items) {
    const headers = ["Name", "Price", "Quantity", "Total", "Category", "Brand"]
    const rows = items.map((item) => [
      item.name,
      item.price,
      item.quantity,
      (item.price * item.quantity).toFixed(2),
      item.category || "",
      item.brand || "",
    ])

    return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
  }

  // Download file
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import cart data
  importCart(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.items && Array.isArray(data.items)) {
          this.items = data.items
          this.saveCart()
          this.updateCartUI()
          this.showNotification("Cart imported successfully", "success")
        }
      } catch (error) {
        this.showNotification("Invalid cart file", "error")
      }
    }
    reader.readAsText(file)
  }

  // Get cart statistics
  getCartStatistics() {
    return {
      totalItems: this.getItemCount(),
      uniqueItems: this.getUniqueItemCount(),
      totalValue: this.getTotal(),
      averageItemPrice: this.items.length > 0 ? this.getTotal() / this.getItemCount() : 0,
      categories: [...new Set(this.items.map((item) => item.category))],
      brands: [...new Set(this.items.map((item) => item.brand))],
      addedToday: this.items.filter((item) => {
        const today = new Date().toDateString()
        return new Date(item.addedAt).toDateString() === today
      }).length,
    }
  }

  // Add change listener
  addListener(callback) {
    this.listeners.push(callback)
  }

  // Remove change listener
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Notify listeners of changes
  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.items)
      } catch (error) {
        console.error("Error in cart listener:", error)
      }
    })
  }

  // Validate cart integrity
  validateCart() {
    let isValid = true
    const errors = []

    this.items.forEach((item, index) => {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        errors.push(`Item ${index + 1}: Missing required fields`)
        isValid = false
      }

      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Invalid quantity`)
        isValid = false
      }

      if (item.price < 0) {
        errors.push(`Item ${index + 1}: Invalid price`)
        isValid = false
      }
    })

    return { isValid, errors }
  }

  // Cleanup old cart data
  cleanup() {
    // Remove items older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    this.items = this.items.filter((item) => {
      return new Date(item.addedAt) > thirtyDaysAgo
    })

    // Cleanup history
    this.cartHistory = this.cartHistory.filter((entry) => {
      return new Date(entry.timestamp) > thirtyDaysAgo
    })

    this.saveCart()
  }
}

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.cart = new ShoppingCart()

  // Cleanup old data on initialization
  window.cart.cleanup()

  // Setup periodic cleanup
  setInterval(
    () => {
      window.cart.cleanup()
    },
    24 * 60 * 60 * 1000,
  ) // Daily cleanup
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShoppingCart
}
