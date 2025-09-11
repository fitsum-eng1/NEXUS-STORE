// Order Success Page JavaScript
class OrderSuccessPage {
  constructor() {
    this.orderId = null
    this.init()
  }

  async init() {
    this.parseURL()
    this.initAOS()
    this.loadOrderDetails()
    this.loadRecommendedProducts()
    this.bindEvents()
    this.startConfetti()
  }

  // Parse URL parameters
  parseURL() {
    const urlParams = new URLSearchParams(window.location.search)
    this.orderId = urlParams.get("order")

    if (!this.orderId) {
      // Generate a sample order ID if none provided
      this.orderId = `NX${Date.now()}${Math.floor(Math.random() * 1000)}`
    }
  }

  // Initialize AOS
  initAOS() {
    const AOS = window.AOS // Declare the AOS variable
    if (AOS) {
      AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 50,
      })
    }
  }

  // Load order details
  loadOrderDetails() {
    const orderNumber = document.getElementById("order-number")
    const orderDate = document.getElementById("order-date")
    const estimatedDelivery = document.getElementById("estimated-delivery")

    if (orderNumber) {
      orderNumber.textContent = this.orderId
    }

    if (orderDate) {
      const now = new Date()
      orderDate.textContent = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    if (estimatedDelivery) {
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + 5) // 5 days from now
      estimatedDelivery.textContent = deliveryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // Load recommended products
  async loadRecommendedProducts() {
    try {
      const products = window.productData ? window.productData.getFeaturedProducts(4) : []
      this.renderRecommendedProducts(products)
    } catch (error) {
      console.error("Error loading recommended products:", error)
    }
  }

  // Render recommended products
  renderRecommendedProducts(products) {
    const container = document.getElementById("recommended-products-grid")
    if (!container || products.length === 0) return

    container.innerHTML = products
      .map(
        (product) => `
      <div class="product-card" data-aos="fade-up">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<div class="product-badge ${product.badge}">${product.badge}</div>` : ""}
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
          <div class="product-rating">
            <div class="stars">
              ${this.generateStars(product.rating)}
            </div>
            <span class="rating-text">(${product.reviews})</span>
          </div>
          <div class="product-price">
            <span class="price-current">$${product.price.toFixed(2)}</span>
            ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ""}
            ${product.discount > 0 ? `<span class="price-discount">${product.discount}% OFF</span>` : ""}
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

    this.bindProductEvents()
  }

  // Generate star rating HTML
  generateStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    let starsHTML = ""

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>'
    }

    // Half star
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>'
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>'
    }

    return starsHTML
  }

  // Bind product events
  bindProductEvents() {
    const container = document.getElementById("recommended-products-grid")
    if (!container) return

    container.addEventListener("click", (e) => {
      if (e.target.matches(".add-to-cart-btn, .add-to-cart-btn *")) {
        const btn = e.target.closest(".add-to-cart-btn")
        const productId = Number.parseInt(btn.dataset.productId)

        if (window.cart) {
          window.cart.addToCart(productId)
        }
      }

      if (e.target.matches(".quick-view-btn, .quick-view-btn *")) {
        const btn = e.target.closest(".quick-view-btn")
        const productId = btn.dataset.productId
        // Quick view functionality would go here
        console.log("Quick view product:", productId)
      }

      if (e.target.matches(".wishlist-btn, .wishlist-btn *")) {
        const btn = e.target.closest(".wishlist-btn")
        const productId = Number.parseInt(btn.dataset.productId)

        if (window.cart) {
          window.cart.addToWishlist(productId)
        }
      }
    })
  }

  // Bind events
  bindEvents() {
    const trackOrderBtn = document.getElementById("track-order")
    if (trackOrderBtn) {
      trackOrderBtn.addEventListener("click", () => {
        this.trackOrder()
      })
    }

    // Update cart count
    if (window.cart) {
      this.updateCartCount()
      window.cart.addListener(() => {
        this.updateCartCount()
      })
    }
  }

  // Track order
  trackOrder() {
    // In a real application, this would redirect to a tracking page
    alert(
      `Tracking information for order ${this.orderId} will be available once your order ships. You'll receive an email with tracking details.`,
    )
  }

  // Update cart count
  updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    if (cartCount && window.cart) {
      const count = window.cart.getItemCount()
      cartCount.textContent = count
      cartCount.style.display = count > 0 ? "flex" : "none"
    }
  }

  // Start confetti animation
  startConfetti() {
    // Simple confetti effect using CSS animations
    this.createConfetti()
  }

  // Create confetti elements
  createConfetti() {
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
    const confettiCount = 50

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)])
      }, i * 50)
    }
  }

  // Create individual confetti piece
  createConfettiPiece(color) {
    const confetti = document.createElement("div")
    confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${Math.random() * 100}%;
      width: 10px;
      height: 10px;
      background: ${color};
      pointer-events: none;
      z-index: 10000;
      animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
    `

    document.body.appendChild(confetti)

    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove()
    }, 5000)
  }
}

// Add confetti animation CSS
const confettiStyles = document.createElement("style")
confettiStyles.textContent = `
  @keyframes confettiFall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`
document.head.appendChild(confettiStyles)

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.orderSuccessPage = new OrderSuccessPage()
})
