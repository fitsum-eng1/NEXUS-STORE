// Product Page JavaScript
class ProductPage {
  constructor() {
    this.productId = null
    this.product = null
    this.selectedOptions = {
      size: null,
      color: null,
      quantity: 1,
    }
    this.currentImageIndex = 0
    this.reviews = []
    this.relatedProducts = []

    this.init()
  }

  async init() {
    this.parseURL()
    this.bindEvents()
    this.initAOS()
    await this.loadProduct()
    await this.loadReviews()
    await this.loadRelatedProducts()
  }

  // Parse URL to get product ID
  parseURL() {
    const urlParams = new URLSearchParams(window.location.search)
    this.productId = urlParams.get("id")

    if (!this.productId) {
      this.showError("Product not found")
      return
    }
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
    // Tab navigation
    this.bindTabEvents()

    // Image gallery
    this.bindGalleryEvents()

    // Product options
    this.bindOptionEvents()

    // Quantity controls
    this.bindQuantityEvents()

    // Action buttons
    this.bindActionEvents()

    // 3D view
    this.bind3DViewEvents()

    // Review interactions
    this.bindReviewEvents()
  }

  // Bind tab events
  bindTabEvents() {
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabPanels = document.querySelectorAll(".tab-panel")

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab

        // Update buttons
        tabBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        // Update panels
        tabPanels.forEach((panel) => {
          panel.classList.remove("active")
          if (panel.id === `${targetTab}-tab`) {
            panel.classList.add("active")
          }
        })
      })
    })
  }

  // Bind gallery events
  bindGalleryEvents() {
    const thumbnails = document.getElementById("product-thumbnails")
    const mainImage = document.getElementById("main-product-image")
    const zoomOverlay = document.getElementById("zoom-overlay")

    // Thumbnail clicks
    if (thumbnails) {
      thumbnails.addEventListener("click", (e) => {
        const thumbnail = e.target.closest(".thumbnail")
        if (thumbnail) {
          const index = Number.parseInt(thumbnail.dataset.index)
          this.changeMainImage(index)
        }
      })
    }

    // Image zoom
    if (mainImage && zoomOverlay) {
      mainImage.addEventListener("mouseenter", () => {
        zoomOverlay.style.display = "flex"
      })

      mainImage.addEventListener("mouseleave", () => {
        zoomOverlay.style.display = "none"
      })

      mainImage.addEventListener("click", () => {
        this.openImageLightbox()
      })
    }
  }

  // Bind option events
  bindOptionEvents() {
    // Size options
    const sizeOptions = document.getElementById("size-options")
    if (sizeOptions) {
      sizeOptions.addEventListener("click", (e) => {
        if (e.target.matches(".size-option")) {
          sizeOptions.querySelectorAll(".size-option").forEach((opt) => opt.classList.remove("active"))
          e.target.classList.add("active")
          this.selectedOptions.size = e.target.dataset.size
        }
      })
    }

    // Color options
    const colorOptions = document.getElementById("color-options")
    if (colorOptions) {
      colorOptions.addEventListener("click", (e) => {
        if (e.target.matches(".color-option")) {
          colorOptions.querySelectorAll(".color-option").forEach((opt) => opt.classList.remove("active"))
          e.target.classList.add("active")
          this.selectedOptions.color = e.target.dataset.color
        }
      })
    }
  }

  // Bind quantity events
  bindQuantityEvents() {
    const qtyBtns = document.querySelectorAll(".qty-btn")
    const qtyInput = document.getElementById("quantity-input")

    qtyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action
        let quantity = Number.parseInt(qtyInput.value)

        if (action === "increase") {
          quantity++
        } else if (action === "decrease" && quantity > 1) {
          quantity--
        }

        qtyInput.value = quantity
        this.selectedOptions.quantity = quantity
      })
    })

    if (qtyInput) {
      qtyInput.addEventListener("change", (e) => {
        const quantity = Number.parseInt(e.target.value)
        if (quantity > 0) {
          this.selectedOptions.quantity = quantity
        } else {
          e.target.value = 1
          this.selectedOptions.quantity = 1
        }
      })
    }
  }

  // Bind action events
  bindActionEvents() {
    // Add to cart
    const addToCartBtn = document.getElementById("add-to-cart")
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        this.addToCart()
      })
    }

    // Add to wishlist
    const wishlistBtn = document.getElementById("add-to-wishlist")
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        this.toggleWishlist()
      })
    }

    // Buy now
    const buyNowBtn = document.getElementById("buy-now")
    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        this.buyNow()
      })
    }
  }

  // Bind 3D view events
  bind3DViewEvents() {
    const view3DBtn = document.getElementById("view-3d-btn")
    const modal3D = document.getElementById("3d-view-modal")
    const overlay3D = document.getElementById("3d-view-overlay")
    const close3D = document.getElementById("3d-view-close")

    if (view3DBtn) {
      view3DBtn.addEventListener("click", () => {
        this.open3DView()
      })
    }

    if (close3D) {
      close3D.addEventListener("click", () => {
        this.close3DView()
      })
    }

    if (overlay3D) {
      overlay3D.addEventListener("click", (e) => {
        if (e.target === overlay3D) {
          this.close3DView()
        }
      })
    }

    // 3D controls
    const controls3D = document.querySelectorAll(".3d-control-btn")
    controls3D.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action
        this.handle3DControl(action)
      })
    })
  }

  // Bind review events
  bindReviewEvents() {
    const writeReviewBtn = document.getElementById("write-review-btn")
    if (writeReviewBtn) {
      writeReviewBtn.addEventListener("click", () => {
        this.openReviewForm()
      })
    }

    // Helpful buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".helpful-btn, .helpful-btn *")) {
        const btn = e.target.closest(".helpful-btn")
        this.markReviewHelpful(btn)
      }
    })
  }

  // Load product data
  async loadProduct() {
    try {
      this.product = window.productData.getProductById(Number.parseInt(this.productId))

      if (!this.product) {
        this.showError("Product not found")
        return
      }

      this.renderProduct()
      this.updateBreadcrumb()
    } catch (error) {
      console.error("Error loading product:", error)
      this.showError("Failed to load product")
    }
  }

  // Render product
  renderProduct() {
    if (!this.product) return

    // Update page title
    document.title = `${this.product.name} - NEXUS STORE`

    // Update product info
    document.getElementById("product-title").textContent = this.product.name
    document.getElementById("product-price").textContent = `$${this.product.price.toFixed(2)}`

    if (this.product.originalPrice) {
      const originalPriceEl = document.getElementById("product-original-price")
      const discountEl = document.getElementById("product-discount")

      originalPriceEl.textContent = `$${this.product.originalPrice.toFixed(2)}`
      originalPriceEl.style.display = "inline"

      discountEl.textContent = `${this.product.discount}% OFF`
      discountEl.style.display = "inline"
    }

    document.getElementById("product-description").textContent = this.product.description

    // Update rating
    this.updateRating()

    // Update images
    this.updateImages()

    // Update options
    this.updateOptions()

    // Update tabs content
    this.updateTabsContent()
  }

  // Update rating display
  updateRating() {
    const ratingContainer = document.getElementById("product-rating")
    const reviewCount = document.getElementById("review-count")

    if (ratingContainer) {
      ratingContainer.innerHTML = `
        <div class="stars">${this.generateStars(this.product.rating)}</div>
      `
    }

    if (reviewCount) {
      reviewCount.textContent = `${this.product.reviews} reviews`
    }
  }

  // Update product images
  updateImages() {
    const mainImage = document.getElementById("main-product-image")
    const thumbnails = document.getElementById("product-thumbnails")

    if (mainImage) {
      mainImage.src = this.product.images[0] || this.product.image
      mainImage.alt = this.product.name
    }

    if (thumbnails && this.product.images) {
      thumbnails.innerHTML = this.product.images
        .map(
          (image, index) => `
        <div class="thumbnail ${index === 0 ? "active" : ""}" data-index="${index}">
          <img src="${image}" alt="${this.product.name}">
        </div>
      `,
        )
        .join("")
    }
  }

  // Update product options
  updateOptions() {
    // Sizes
    const sizeGroup = document.getElementById("size-group")
    const sizeOptions = document.getElementById("size-options")

    if (this.product.sizes && this.product.sizes.length > 0) {
      sizeGroup.style.display = "block"
      sizeOptions.innerHTML = this.product.sizes
        .map(
          (size) => `
        <div class="size-option" data-size="${size}">${size}</div>
      `,
        )
        .join("")
    } else {
      sizeGroup.style.display = "none"
    }

    // Colors
    const colorGroup = document.getElementById("color-group")
    const colorOptions = document.getElementById("color-options")

    if (this.product.colors && this.product.colors.length > 0) {
      colorGroup.style.display = "block"
      colorOptions.innerHTML = this.product.colors
        .map(
          (color) => `
        <div class="color-option" data-color="${color}" style="background-color: ${color}" title="${color}"></div>
      `,
        )
        .join("")
    } else {
      colorGroup.style.display = "none"
    }
  }

  // Update tabs content
  updateTabsContent() {
    // Detailed description
    const detailedDesc = document.getElementById("detailed-description")
    if (detailedDesc) {
      detailedDesc.innerHTML = this.product.detailedDescription || this.product.description
    }

    // Specifications
    this.updateSpecifications()
  }

  // Update specifications
  updateSpecifications() {
    const specsContainer = document.getElementById("specifications-content")
    if (!specsContainer || !this.product.specifications) return

    specsContainer.innerHTML = Object.entries(this.product.specifications)
      .map(
        ([category, specs]) => `
      <div class="spec-group">
        <h4>${category}</h4>
        ${Object.entries(specs)
          .map(
            ([label, value]) => `
          <div class="spec-item">
            <span class="spec-label">${label}:</span>
            <span class="spec-value">${value}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `,
      )
      .join("")
  }

  // Change main image
  changeMainImage(index) {
    if (!this.product.images || index >= this.product.images.length) return

    const mainImage = document.getElementById("main-product-image")
    const thumbnails = document.querySelectorAll(".thumbnail")

    if (mainImage) {
      mainImage.src = this.product.images[index]
    }

    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index)
    })

    this.currentImageIndex = index
  }

  // Open image lightbox
  openImageLightbox() {
    this.showNotification("Image lightbox feature coming soon!", "info")
  }

  // Add to cart
  addToCart() {
    if (!this.product) return

    // Validate required options
    if (this.product.sizes && this.product.sizes.length > 0 && !this.selectedOptions.size) {
      this.showNotification("Please select a size", "warning")
      return
    }

    if (this.product.colors && this.product.colors.length > 0 && !this.selectedOptions.color) {
      this.showNotification("Please select a color", "warning")
      return
    }

    // Add to cart
    const success = window.cart.addToCart(this.product.id, this.selectedOptions.quantity, {
      size: this.selectedOptions.size,
      color: this.selectedOptions.color,
    })

    if (success) {
      this.animateAddToCart()
    }
  }

  // Animate add to cart button
  animateAddToCart() {
    const btn = document.getElementById("add-to-cart")
    const gsap = window.gsap // Declare gsap variable
    if (btn && gsap) {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }
  }

  // Toggle wishlist
  toggleWishlist() {
    const btn = document.getElementById("add-to-wishlist")
    const icon = btn.querySelector("i")
    const text = btn.querySelector("span")

    const isActive = btn.classList.contains("active")

    if (isActive) {
      btn.classList.remove("active")
      icon.className = "far fa-heart"
      text.textContent = "Add to Wishlist"
      this.showNotification("Removed from wishlist", "success")
    } else {
      btn.classList.add("active")
      icon.className = "fas fa-heart"
      text.textContent = "Remove from Wishlist"
      this.showNotification("Added to wishlist", "success")
    }
  }

  // Buy now
  buyNow() {
    // Add to cart first
    this.addToCart()

    // Redirect to checkout
    setTimeout(() => {
      window.location.href = "checkout.html"
    }, 500)
  }

  // Open 3D view
  open3DView() {
    const overlay = document.getElementById("3d-view-overlay")
    if (overlay) {
      overlay.classList.add("active")
      document.body.style.overflow = "hidden"
      this.init3DViewer()
    }
  }

  // Close 3D view
  close3DView() {
    const overlay = document.getElementById("3d-view-overlay")
    if (overlay) {
      overlay.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Initialize 3D viewer
  init3DViewer() {
    const container = document.getElementById("3d-viewer")
    if (container) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
          <div style="text-align: center;">
            <i class="fas fa-cube" style="font-size: 4rem; margin-bottom: 1rem;"></i>
            <p>3D viewer will be implemented here</p>
            <p style="font-size: 0.9rem; opacity: 0.7;">Interactive 3D model of ${this.product.name}</p>
          </div>
        </div>
      `
    }
  }

  // Handle 3D controls
  handle3DControl(action) {
    switch (action) {
      case "rotate":
        this.showNotification("Auto-rotate toggled", "info")
        break
      case "reset":
        this.showNotification("View reset", "info")
        break
      case "fullscreen":
        this.showNotification("Fullscreen mode", "info")
        break
    }
  }

  // Load reviews
  async loadReviews() {
    try {
      this.reviews = window.productData.getProductReviews(Number.parseInt(this.productId))
      this.renderReviews()
      this.updateReviewsSummary()
    } catch (error) {
      console.error("Error loading reviews:", error)
    }
  }

  // Render reviews
  renderReviews() {
    const reviewsList = document.getElementById("reviews-list")
    if (!reviewsList) return

    if (this.reviews.length === 0) {
      reviewsList.innerHTML = `
        <div class="no-reviews">
          <i class="fas fa-star"></i>
          <h3>No reviews yet</h3>
          <p>Be the first to review this product!</p>
          <button class="btn btn-primary" id="first-review-btn">Write First Review</button>
        </div>
      `
      return
    }

    reviewsList.innerHTML = this.reviews
      .map(
        (review) => `
      <div class="review-item">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">${review.user.charAt(0)}</div>
            <div class="reviewer-details">
              <div class="reviewer-name">${review.user}</div>
              <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="review-rating">
            ${this.generateStars(review.rating)}
          </div>
        </div>
        <div class="review-content">
          <h4>${review.title}</h4>
          <p>${review.content}</p>
        </div>
        <div class="review-helpful">
          <button class="helpful-btn" data-review-id="${review.id}">
            <i class="fas fa-thumbs-up"></i>
            Helpful (${review.helpful})
          </button>
        </div>
      </div>
    `,
      )
      .join("")
  }

  // Update reviews summary
  updateReviewsSummary() {
    const overallRating = document.getElementById("overall-rating")
    const overallStars = document.getElementById("overall-stars")
    const totalReviews = document.getElementById("total-reviews")
    const ratingBreakdown = document.getElementById("rating-breakdown")

    if (overallRating) {
      overallRating.textContent = this.product.rating.toFixed(1)
    }

    if (overallStars) {
      overallStars.innerHTML = this.generateStars(this.product.rating)
    }

    if (totalReviews) {
      totalReviews.textContent = this.reviews.length
    }

    // Rating breakdown
    if (ratingBreakdown) {
      const breakdown = this.calculateRatingBreakdown()
      ratingBreakdown.innerHTML = Object.entries(breakdown)
        .reverse()
        .map(
          ([rating, count]) => `
        <div class="rating-bar">
          <span class="bar-label">${rating} stars</span>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${(count / this.reviews.length) * 100}%"></div>
          </div>
          <span class="bar-count">${count}</span>
        </div>
      `,
        )
        .join("")
    }
  }

  // Calculate rating breakdown
  calculateRatingBreakdown() {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    this.reviews.forEach((review) => {
      const rating = Math.floor(review.rating)
      breakdown[rating]++
    })

    return breakdown
  }

  // Open review form
  openReviewForm() {
    this.showNotification("Review form feature coming soon!", "info")
  }

  // Mark review as helpful
  markReviewHelpful(btn) {
    const reviewId = btn.dataset.reviewId
    const countSpan = btn.querySelector(".fas + text()")

    // Simulate marking as helpful
    btn.style.color = "var(--primary-color)"
    this.showNotification("Thank you for your feedback!", "success")
  }

  // Load related products
  async loadRelatedProducts() {
    try {
      this.relatedProducts = window.productData.getRelatedProducts(Number.parseInt(this.productId), 4)
      this.renderRelatedProducts()
    } catch (error) {
      console.error("Error loading related products:", error)
    }
  }

  // Render related products
  renderRelatedProducts() {
    const container = document.getElementById("related-products-grid")
    if (!container) return

    container.innerHTML = this.relatedProducts
      .map(
        (product) => `
      <div class="product-card" data-aos="fade-up">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<div class="product-badge ${product.badge}">${product.badge}</div>` : ""}
          <div class="product-actions">
            <button class="action-btn quick-view-btn" data-product-id="${product.id}" title="Quick View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn wishlist-btn" data-product-id="${product.id}" title="Add to Wishlist">
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
  }

  // Update breadcrumb
  updateBreadcrumb() {
    const breadcrumb = document.getElementById("product-breadcrumb")
    if (breadcrumb && this.product) {
      breadcrumb.textContent = this.product.name
    }
  }

  // Generate star rating HTML
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

  // Show error
  showError(message) {
    const container = document.querySelector(".container")
    if (container) {
      container.innerHTML = `
        <div class="error-page">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>Error</h2>
          <p>${message}</p>
          <a href="shop.html" class="btn btn-primary">Back to Shop</a>
        </div>
      `
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
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.productPage = new ProductPage()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ProductPage
}
