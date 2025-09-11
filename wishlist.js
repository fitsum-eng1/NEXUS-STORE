// Wishlist Page JavaScript
class WishlistPage {
  constructor() {
    this.wishlistItems = []
    this.currentView = "grid"
    this.currentSort = "newest"
    this.recommendations = []
    this.init()
  }

  async init() {
    this.bindEvents()
    this.initAOS()
    await this.loadWishlistItems()
    await this.loadRecommendations()
    this.updateStats()
    this.updateControls()
  }

  // Initialize AOS
  initAOS() {
    const AOS = window.AOS // Declare AOS variable
    if (AOS) {
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
    // View toggle
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.toggleView(e.target.dataset.view)
      })
    })

    // Sort change
    const sortSelect = document.getElementById("wishlist-sort")
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value
        this.sortWishlist()
        this.renderWishlistItems()
      })
    }

    // Action buttons
    const shareBtn = document.getElementById("share-wishlist-btn")
    const addAllBtn = document.getElementById("add-all-to-cart-btn")
    const clearBtn = document.getElementById("clear-wishlist-btn")
    const setupAlertsBtn = document.getElementById("setup-alerts-btn")

    if (shareBtn) {
      shareBtn.addEventListener("click", () => this.openShareModal())
    }

    if (addAllBtn) {
      addAllBtn.addEventListener("click", () => this.addAllToCart())
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearWishlist())
    }

    if (setupAlertsBtn) {
      setupAlertsBtn.addEventListener("click", () => this.setupPriceAlerts())
    }

    // Share modal events
    this.bindShareModalEvents()

    // Listen to wishlist changes from cart.js
    if (window.cart) {
      // Check if wishlist is updated from other pages
      setInterval(() => {
        this.checkWishlistUpdates()
      }, 1000)
    }
  }

  // Bind share modal events
  bindShareModalEvents() {
    const shareModal = document.getElementById("share-modal-overlay")
    const closeBtn = document.getElementById("share-modal-close")
    const copyBtn = document.getElementById("copy-link-btn")

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeShareModal())
    }

    if (shareModal) {
      shareModal.addEventListener("click", (e) => {
        if (e.target === shareModal) {
          this.closeShareModal()
        }
      })
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.copyShareLink())
    }

    // Share platform buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".share-option, .share-option *")) {
        const option = e.target.closest(".share-option")
        const platform = option.dataset.platform
        this.shareOnPlatform(platform)
      }
    })
  }

  // Load wishlist items
  async loadWishlistItems() {
    try {
      // Get wishlist from cart.js or localStorage
      const wishlist = window.cart ? window.cart.wishlist : this.loadWishlistFromStorage()

      // Enhance wishlist items with full product data
      this.wishlistItems = await Promise.all(
        wishlist.map(async (item) => {
          const product = window.productData ? window.productData.getProductById(item.id) : null
          return {
            ...item,
            ...product,
            addedAt: item.addedAt || new Date().toISOString(),
            isOnSale: product && product.originalPrice && product.originalPrice > product.price,
            isInStock: product ? product.inStock !== false : true,
            stockLevel: product ? product.stock || 10 : 10,
          }
        }),
      )

      this.sortWishlist()
      this.renderWishlistItems()
    } catch (error) {
      console.error("Error loading wishlist items:", error)
      this.showError("Failed to load wishlist items")
    }
  }

  // Load wishlist from localStorage fallback
  loadWishlistFromStorage() {
    try {
      const saved = localStorage.getItem("nexus_wishlist")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading wishlist from storage:", error)
      return []
    }
  }

  // Check for wishlist updates
  checkWishlistUpdates() {
    if (window.cart && window.cart.wishlist) {
      const currentWishlistIds = this.wishlistItems.map((item) => item.id)
      const newWishlistIds = window.cart.wishlist.map((item) => item.id)

      // Check if wishlist has changed
      if (JSON.stringify(currentWishlistIds.sort()) !== JSON.stringify(newWishlistIds.sort())) {
        this.loadWishlistItems()
        this.updateStats()
      }
    }
  }

  // Sort wishlist items
  sortWishlist() {
    switch (this.currentSort) {
      case "newest":
        this.wishlistItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        break
      case "oldest":
        this.wishlistItems.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
        break
      case "price-low":
        this.wishlistItems.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        this.wishlistItems.sort((a, b) => b.price - a.price)
        break
      case "name":
        this.wishlistItems.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "availability":
        this.wishlistItems.sort((a, b) => {
          if (a.isInStock && !b.isInStock) return -1
          if (!a.isInStock && b.isInStock) return 1
          return 0
        })
        break
    }
  }

  // Render wishlist items
  renderWishlistItems() {
    const container = document.getElementById("wishlist-grid")
    if (!container) return

    if (this.wishlistItems.length === 0) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <i class="fas fa-heart-broken"></i>
          <h2>Your wishlist is empty</h2>
          <p>Start adding products you love to your wishlist</p>
          <a href="shop.html" class="btn btn-primary btn-large">
            <i class="fas fa-shopping-bag"></i>
            Discover Products
          </a>
        </div>
      `
      return
    }

    container.innerHTML = this.wishlistItems
      .map(
        (item, index) => `
      <div class="wishlist-item wishlist-item-enter" data-product-id="${item.id}" data-index="${index}">
        <div class="wishlist-item-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          ${item.isOnSale ? `<div class="wishlist-item-badge sale">Sale</div>` : ""}
          ${this.isRecentlyAdded(item.addedAt) ? `<div class="wishlist-item-badge new">New</div>` : ""}
          <div class="wishlist-item-actions">
            <button class="wishlist-action-btn quick-view" data-product-id="${item.id}" title="Quick View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="wishlist-action-btn remove" data-product-id="${item.id}" title="Remove from Wishlist">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
        
        <div class="wishlist-item-info">
          <div class="wishlist-item-category">${item.category || ""}</div>
          <h3 class="wishlist-item-title">
            <a href="product.html?id=${item.id}">${item.name}</a>
          </h3>
          
          <div class="wishlist-item-rating">
            <div class="wishlist-stars">
              ${this.generateStars(item.rating || 4.5)}
            </div>
            <span class="wishlist-rating-text">(${item.reviews || 0})</span>
          </div>
          
          <div class="wishlist-item-price">
            <span class="wishlist-price-current">$${item.price.toFixed(2)}</span>
            ${
              item.originalPrice && item.originalPrice > item.price
                ? `<span class="wishlist-price-original">$${item.originalPrice.toFixed(2)}</span>`
                : ""
            }
            ${
              item.isOnSale
                ? `<span class="wishlist-price-discount">${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF</span>`
                : ""
            }
          </div>
          
          <div class="wishlist-item-meta">
            <div class="wishlist-added-date">
              <i class="fas fa-calendar-plus"></i>
              <span>Added ${this.formatDate(item.addedAt)}</span>
            </div>
            <div class="wishlist-stock-status">
              <div class="stock-indicator ${this.getStockClass(item)}"></div>
              <span>${this.getStockText(item)}</span>
            </div>
          </div>
          
          <div class="wishlist-item-buttons">
            <button class="wishlist-add-cart-btn" data-product-id="${item.id}" ${!item.isInStock ? "disabled" : ""}>
              <i class="fas fa-shopping-cart"></i>
              ${item.isInStock ? "Add to Cart" : "Out of Stock"}
            </button>
            <button class="wishlist-remove-btn" data-product-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `,
      )
      .join("")

    this.bindWishlistItemEvents()
  }

  // Bind wishlist item events
  bindWishlistItemEvents() {
    const container = document.getElementById("wishlist-grid")
    if (!container) return

    container.addEventListener("click", (e) => {
      const productId = Number.parseInt(e.target.dataset.productId)

      if (e.target.matches(".wishlist-add-cart-btn")) {
        this.addToCart(productId)
      }

      if (e.target.matches(".wishlist-remove-btn, .remove")) {
        this.removeFromWishlist(productId)
      }

      if (e.target.matches(".quick-view")) {
        this.showQuickView(productId)
      }
    })
  }

  // Toggle view (grid/list)
  toggleView(view) {
    this.currentView = view

    // Update buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-view="${view}"]`).classList.add("active")

    // Update grid
    const grid = document.getElementById("wishlist-grid")
    if (grid) {
      grid.className = view === "list" ? "wishlist-grid list-view" : "wishlist-grid"
    }
  }

  // Update stats
  updateStats() {
    const totalItems = this.wishlistItems.length
    const totalValue = this.wishlistItems.reduce((sum, item) => sum + item.price, 0)
    const onSaleItems = this.wishlistItems.filter((item) => item.isOnSale).length
    const recentlyAdded = this.wishlistItems.filter((item) => this.isRecentlyAdded(item.addedAt)).length

    document.getElementById("total-items").textContent = totalItems
    document.getElementById("total-value").textContent = `$${totalValue.toFixed(0)}`
    document.getElementById("on-sale").textContent = onSaleItems
    document.getElementById("recently-added").textContent = recentlyAdded
  }

  // Update controls
  updateControls() {
    const addAllBtn = document.getElementById("add-all-to-cart-btn")
    const clearBtn = document.getElementById("clear-wishlist-btn")

    if (addAllBtn) {
      addAllBtn.style.display = this.wishlistItems.length > 0 ? "flex" : "none"
    }

    if (clearBtn) {
      clearBtn.style.display = this.wishlistItems.length > 0 ? "flex" : "none"
    }
  }

  // Add item to cart
  addToCart(productId) {
    if (window.cart) {
      const success = window.cart.addToCart(productId)
      if (success) {
        this.showNotification("Item added to cart!", "success")
      }
    } else {
      this.showNotification("Cart functionality not available", "error")
    }
  }

  // Remove from wishlist
  removeFromWishlist(productId) {
    if (window.cart) {
      const success = window.cart.removeFromWishlist(productId)
      if (success) {
        // Remove from local array
        this.wishlistItems = this.wishlistItems.filter((item) => item.id !== productId)
        this.renderWishlistItems()
        this.updateStats()
        this.updateControls()
      }
    } else {
      // Fallback for direct removal
      this.wishlistItems = this.wishlistItems.filter((item) => item.id !== productId)
      this.renderWishlistItems()
      this.updateStats()
      this.updateControls()
      this.showNotification("Item removed from wishlist", "success")
    }
  }

  // Add all to cart
  addAllToCart() {
    if (this.wishlistItems.length === 0) {
      this.showNotification("No items in wishlist", "warning")
      return
    }

    const availableItems = this.wishlistItems.filter((item) => item.isInStock)

    if (availableItems.length === 0) {
      this.showNotification("No available items to add to cart", "warning")
      return
    }

    if (confirm(`Add ${availableItems.length} available items to cart?`)) {
      let addedCount = 0

      availableItems.forEach((item) => {
        if (window.cart && window.cart.addToCart(item.id)) {
          addedCount++
        }
      })

      if (addedCount > 0) {
        this.showNotification(`${addedCount} items added to cart!`, "success")
      }
    }
  }

  // Clear wishlist
  clearWishlist() {
    if (this.wishlistItems.length === 0) {
      this.showNotification("Wishlist is already empty", "info")
      return
    }

    if (confirm(`Remove all ${this.wishlistItems.length} items from your wishlist?`)) {
      if (window.cart) {
        // Clear through cart system
        this.wishlistItems.forEach((item) => {
          window.cart.removeFromWishlist(item.id)
        })
      }

      this.wishlistItems = []
      this.renderWishlistItems()
      this.updateStats()
      this.updateControls()
      this.showNotification("Wishlist cleared", "success")
    }
  }

  // Open share modal
  openShareModal() {
    const modal = document.getElementById("share-modal-overlay")
    const shareLink = document.getElementById("share-link-input")

    if (modal) {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
    }

    if (shareLink) {
      const url = `${window.location.origin}/wishlist.html?shared=true`
      shareLink.value = url
    }
  }

  // Close share modal
  closeShareModal() {
    const modal = document.getElementById("share-modal-overlay")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Copy share link
  copyShareLink() {
    const shareLink = document.getElementById("share-link-input")
    if (shareLink) {
      shareLink.select()
      document.execCommand("copy")
      this.showNotification("Link copied to clipboard!", "success")
    }
  }

  // Share on platform
  shareOnPlatform(platform) {
    const url = encodeURIComponent(`${window.location.origin}/wishlist.html?shared=true`)
    const text = encodeURIComponent("Check out my wishlist on NEXUS STORE!")

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        break
      case "pinterest":
        shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`
        break
      case "email":
        shareUrl = `mailto:?subject=${text}&body=Check out my wishlist: ${decodeURIComponent(url)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  // Setup price alerts
  setupPriceAlerts() {
    this.showNotification("Price alerts feature coming soon!", "info")
  }

  // Show quick view
  showQuickView(productId) {
    this.showNotification("Quick view feature coming soon!", "info")
  }

  // Load recommendations
  async loadRecommendations() {
    try {
      if (this.wishlistItems.length === 0) {
        const recommendedSection = document.getElementById("recommended-section")
        if (recommendedSection) {
          recommendedSection.style.display = "none"
        }
        return
      }

      // Get categories from wishlist items
      const categories = [...new Set(this.wishlistItems.map((item) => item.category))]
      let recommendations = []

      for (const category of categories) {
        const categoryProducts = window.productData ? window.productData.getProductsByCategory(category, 3) : []
        recommendations = recommendations.concat(
          categoryProducts.filter((product) => !this.wishlistItems.some((item) => item.id === product.id)),
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
    const container = document.getElementById("recommended-grid")
    if (!container || this.recommendations.length === 0) return

    container.innerHTML = this.recommendations
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

  // Utility functions
  generateStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    let stars = ""

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>'
    }

    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>'
    }

    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>'
    }

    return stars
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "today"
    if (diffDays === 2) return "yesterday"
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`

    return date.toLocaleDateString()
  }

  isRecentlyAdded(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  getStockClass(item) {
    if (!item.isInStock) return "out-of-stock"
    if (item.stockLevel <= 5) return "low-stock"
    return "in-stock"
  }

  getStockText(item) {
    if (!item.isInStock) return "Out of Stock"
    if (item.stockLevel <= 5) return `Only ${item.stockLevel} left`
    return "In Stock"
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

  // Show error
  showError(message) {
    const container = document.getElementById("wishlist-grid")
    if (container) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Error</h2>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>
      `
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.wishlistPage = new WishlistPage()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = WishlistPage
}
