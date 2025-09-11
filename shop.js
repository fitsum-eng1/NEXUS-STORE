// Shop Page JavaScript
class ShopPage {
  constructor() {
    this.currentPage = 1
    this.itemsPerPage = 24
    this.currentFilters = {}
    this.currentSort = "featured"
    this.currentView = "grid"
    this.products = []
    this.totalPages = 1

    this.init()
  }

  async init() {
    this.parseURLParams()
    this.bindEvents()
    this.initAOS()
    await this.loadProducts()
    this.updateFiltersFromURL()
  }

  // Parse URL parameters
  parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search)

    // Search query
    const search = urlParams.get("search")
    if (search) {
      const searchInput = document.getElementById("search-input")
      if (searchInput) {
        searchInput.value = search
      }
      this.currentFilters.search = search
    }

    // Category filter
    const category = urlParams.get("category")
    if (category) {
      this.currentFilters.categories = [category]
    }

    // Page
    const page = urlParams.get("page")
    if (page) {
      this.currentPage = Number.parseInt(page)
    }

    // Sort
    const sort = urlParams.get("sort")
    if (sort) {
      this.currentSort = sort
      const sortSelect = document.getElementById("sort-select")
      if (sortSelect) {
        sortSelect.value = sort
      }
    }
  }

  // Update filters from URL
  updateFiltersFromURL() {
    // Update category checkboxes
    if (this.currentFilters.categories) {
      this.currentFilters.categories.forEach((category) => {
        const checkbox = document.querySelector(`input[name="category"][value="${category}"]`)
        if (checkbox) {
          checkbox.checked = true
        }
      })
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
    // Filter controls
    this.bindFilterEvents()

    // Sort dropdown
    const sortSelect = document.getElementById("sort-select")
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value
        this.currentPage = 1
        this.loadProducts()
        this.updateURL()
      })
    }

    // View toggle
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.toggleView(e.target.dataset.view)
      })
    })

    // Filters toggle (mobile)
    const filtersToggle = document.getElementById("filters-toggle")
    const filtersSidebar = document.getElementById("filters-sidebar")

    if (filtersToggle && filtersSidebar) {
      filtersToggle.addEventListener("click", () => {
        filtersSidebar.classList.toggle("active")
      })
    }

    // Clear filters
    const clearFilters = document.getElementById("clear-filters")
    if (clearFilters) {
      clearFilters.addEventListener("click", () => {
        this.clearAllFilters()
      })
    }

    // Search
    const searchInput = document.getElementById("search-input")
    const searchBtn = document.querySelector(".search-btn")

    if (searchInput && searchBtn) {
      searchBtn.addEventListener("click", () => this.handleSearch())
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleSearch()
        }
      })
    }

    // Pagination
    this.bindPaginationEvents()
  }

  // Bind filter events
  bindFilterEvents() {
    const filtersSidebar = document.getElementById("filters-sidebar")
    if (!filtersSidebar) return

    // Category filters
    filtersSidebar.addEventListener("change", (e) => {
      if (e.target.name === "category") {
        this.updateCategoryFilters()
      } else if (e.target.name === "brand") {
        this.updateBrandFilters()
      } else if (e.target.name === "rating") {
        this.updateRatingFilter(e.target.value)
      }
    })

    // Price range
    const priceMin = document.getElementById("price-min")
    const priceMax = document.getElementById("price-max")
    const priceRange = document.getElementById("price-range")

    if (priceMin && priceMax) {
      const updatePriceFilter = () => {
        const min = Number.parseFloat(priceMin.value) || 0
        const max = Number.parseFloat(priceMax.value) || Number.POSITIVE_INFINITY
        this.updatePriceFilter(min, max)
      }

      priceMin.addEventListener("change", updatePriceFilter)
      priceMax.addEventListener("change", updatePriceFilter)
    }

    if (priceRange) {
      priceRange.addEventListener("input", (e) => {
        const max = Number.parseFloat(e.target.value)
        if (priceMax) priceMax.value = max
        this.updatePriceFilter(0, max)
      })
    }
  }

  // Update category filters
  updateCategoryFilters() {
    const checkboxes = document.querySelectorAll('input[name="category"]:checked')
    this.currentFilters.categories = Array.from(checkboxes).map((cb) => cb.value)
    this.currentPage = 1
    this.loadProducts()
    this.updateURL()
  }

  // Update brand filters
  updateBrandFilters() {
    const checkboxes = document.querySelectorAll('input[name="brand"]:checked')
    this.currentFilters.brands = Array.from(checkboxes).map((cb) => cb.value)
    this.currentPage = 1
    this.loadProducts()
    this.updateURL()
  }

  // Update rating filter
  updateRatingFilter(rating) {
    this.currentFilters.minRating = Number.parseFloat(rating)
    this.currentPage = 1
    this.loadProducts()
    this.updateURL()
  }

  // Update price filter
  updatePriceFilter(min, max) {
    this.currentFilters.minPrice = min
    this.currentFilters.maxPrice = max === Number.POSITIVE_INFINITY ? undefined : max
    this.currentPage = 1
    this.loadProducts()
    this.updateURL()
  }

  // Clear all filters
  clearAllFilters() {
    // Reset filter object
    this.currentFilters = {}
    this.currentPage = 1

    // Reset form elements
    document.querySelectorAll('#filters-sidebar input[type="checkbox"]').forEach((cb) => {
      cb.checked = false
    })

    document.querySelectorAll('#filters-sidebar input[type="radio"]').forEach((radio) => {
      radio.checked = false
    })

    const priceMin = document.getElementById("price-min")
    const priceMax = document.getElementById("price-max")
    const priceRange = document.getElementById("price-range")

    if (priceMin) priceMin.value = ""
    if (priceMax) priceMax.value = ""
    if (priceRange) priceRange.value = priceRange.max

    // Reload products
    this.loadProducts()
    this.updateURL()
  }

  // Handle search
  handleSearch() {
    const searchInput = document.getElementById("search-input")
    if (!searchInput) return

    const query = searchInput.value.trim()
    if (query) {
      this.currentFilters.search = query
    } else {
      delete this.currentFilters.search
    }

    this.currentPage = 1
    this.loadProducts()
    this.updateURL()
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
    const productsGrid = document.getElementById("products-grid")
    if (productsGrid) {
      productsGrid.className = view === "list" ? "products-grid list-view" : "products-grid"
    }
  }

  // Load products
  async loadProducts() {
    try {
      this.showLoading()

      const result = await window.productData.getProductsPaginated(
        this.currentPage,
        this.itemsPerPage,
        this.currentFilters,
        this.currentSort,
      )

      this.products = result.products
      this.totalPages = result.pagination.totalPages

      this.renderProducts()
      this.updateResultsInfo(result.pagination)
      this.updatePagination(result.pagination)

      this.hideLoading()
    } catch (error) {
      console.error("Error loading products:", error)
      this.showError("Failed to load products. Please try again.")
    }
  }

  // Show loading state
  showLoading() {
    const productsGrid = document.getElementById("products-grid")
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="loading-products">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      `
    }
  }

  // Hide loading state
  hideLoading() {
    // Loading is hidden when products are rendered
  }

  // Show error
  showError(message) {
    const productsGrid = document.getElementById("products-grid")
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>
      `
    }
  }

  // Render products
  renderProducts() {
    const productsGrid = document.getElementById("products-grid")
    if (!productsGrid) return

    if (this.products.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <i class="fas fa-search"></i>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button class="btn btn-primary" onclick="window.shopPage.clearAllFilters()">Clear Filters</button>
        </div>
      `
      return
    }

    productsGrid.innerHTML = this.products
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

    // Bind product events
    this.bindProductEvents()

    // Refresh AOS
    const AOS = window.AOS // Declare AOS variable
    if (AOS) {
      AOS.refresh()
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

  // Bind product events
  bindProductEvents() {
    const productsGrid = document.getElementById("products-grid")
    if (!productsGrid) return

    productsGrid.addEventListener("click", (e) => {
      // Quick view
      if (e.target.matches(".quick-view-btn, .quick-view-btn *")) {
        const btn = e.target.closest(".quick-view-btn")
        const productId = btn.dataset.productId
        this.showQuickView(productId)
      }

      // Wishlist
      if (e.target.matches(".wishlist-btn, .wishlist-btn *")) {
        const btn = e.target.closest(".wishlist-btn")
        const productId = btn.dataset.productId
        this.toggleWishlist(productId, btn)
      }
    })
  }

  // Show quick view modal
  showQuickView(productId) {
    const product = window.productData.getProductById(Number.parseInt(productId))
    if (!product) return

    const modal = document.getElementById("quick-view-modal")
    const overlay = document.getElementById("quick-view-overlay")

    if (!modal || !overlay) return

    // Populate modal content
    this.populateQuickView(product)

    // Show modal
    overlay.classList.add("active")
    document.body.style.overflow = "hidden"

    // Bind close events
    this.bindQuickViewEvents()
  }

  // Populate quick view modal
  populateQuickView(product) {
    // Update main image
    const mainImage = document.getElementById("quick-view-main-image")
    if (mainImage) {
      mainImage.src = product.images[0] || product.image
      mainImage.alt = product.name
    }

    // Update thumbnails
    const thumbnails = document.getElementById("quick-view-thumbnails")
    if (thumbnails && product.images) {
      thumbnails.innerHTML = product.images
        .map(
          (image, index) => `
        <div class="thumbnail ${index === 0 ? "active" : ""}" data-image="${image}">
          <img src="${image}" alt="${product.name}">
        </div>
      `,
        )
        .join("")
    }

    // Update product details
    document.getElementById("quick-view-title").textContent = product.name
    document.getElementById("quick-view-price").innerHTML = `
      <span class="price-current">$${product.price.toFixed(2)}</span>
      ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ""}
    `
    document.getElementById("quick-view-description").textContent = product.description

    // Update rating
    const ratingContainer = document.getElementById("quick-view-rating")
    if (ratingContainer) {
      ratingContainer.innerHTML = `
        <div class="stars">${this.generateStars(product.rating)}</div>
        <span class="rating-text">(${product.reviews} reviews)</span>
      `
    }

    // Update options
    this.updateQuickViewOptions(product)

    // Update add to cart button
    const addToCartBtn = document.getElementById("quick-view-add-cart")
    if (addToCartBtn) {
      addToCartBtn.dataset.productId = product.id
    }
  }

  // Update quick view options
  updateQuickViewOptions(product) {
    // Sizes
    const sizesContainer = document.getElementById("quick-view-sizes")
    if (sizesContainer && product.sizes && product.sizes.length > 0) {
      sizesContainer.innerHTML = product.sizes
        .map(
          (size) => `
        <div class="size-option" data-size="${size}">${size}</div>
      `,
        )
        .join("")
      sizesContainer.parentElement.style.display = "block"
    } else if (sizesContainer) {
      sizesContainer.parentElement.style.display = "none"
    }

    // Colors
    const colorsContainer = document.getElementById("quick-view-colors")
    if (colorsContainer && product.colors && product.colors.length > 0) {
      colorsContainer.innerHTML = product.colors
        .map(
          (color) => `
        <div class="color-option" data-color="${color}" style="background-color: ${color}" title="${color}"></div>
      `,
        )
        .join("")
      colorsContainer.parentElement.style.display = "block"
    } else if (colorsContainer) {
      colorsContainer.parentElement.style.display = "none"
    }
  }

  // Bind quick view events
  bindQuickViewEvents() {
    const modal = document.getElementById("quick-view-modal")
    const overlay = document.getElementById("quick-view-overlay")
    const closeBtn = document.getElementById("quick-view-close")

    // Close events
    const closeModal = () => {
      overlay.classList.remove("active")
      document.body.style.overflow = ""
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal)
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal()
      }
    })

    // Thumbnail clicks
    const thumbnails = document.getElementById("quick-view-thumbnails")
    if (thumbnails) {
      thumbnails.addEventListener("click", (e) => {
        const thumbnail = e.target.closest(".thumbnail")
        if (thumbnail) {
          const image = thumbnail.dataset.image
          const mainImage = document.getElementById("quick-view-main-image")
          if (mainImage) {
            mainImage.src = image
          }

          // Update active thumbnail
          thumbnails.querySelectorAll(".thumbnail").forEach((t) => t.classList.remove("active"))
          thumbnail.classList.add("active")
        }
      })
    }

    // Option selections
    modal.addEventListener("click", (e) => {
      if (e.target.matches(".size-option")) {
        modal.querySelectorAll(".size-option").forEach((opt) => opt.classList.remove("active"))
        e.target.classList.add("active")
      }

      if (e.target.matches(".color-option")) {
        modal.querySelectorAll(".color-option").forEach((opt) => opt.classList.remove("active"))
        e.target.classList.add("active")
      }
    })

    // Quantity controls
    const qtyBtns = modal.querySelectorAll(".qty-btn")
    const qtyInput = modal.querySelector(".qty-input")

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
      })
    })
  }

  // Toggle wishlist
  toggleWishlist(productId, btn) {
    const isActive = btn.classList.contains("active")
    const icon = btn.querySelector("i")

    if (isActive) {
      btn.classList.remove("active")
      icon.className = "far fa-heart"
      this.showNotification("Removed from wishlist", "success")
    } else {
      btn.classList.add("active")
      icon.className = "fas fa-heart"
      this.showNotification("Added to wishlist", "success")
    }
  }

  // Update results info
  updateResultsInfo(pagination) {
    const resultsCount = document.getElementById("results-count")
    if (resultsCount) {
      const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1
      const end = Math.min(start + pagination.itemsPerPage - 1, pagination.totalItems)
      resultsCount.textContent = `Showing ${start}-${end} of ${pagination.totalItems} products`
    }
  }

  // Update pagination
  updatePagination(pagination) {
    const paginationContainer = document.getElementById("pagination")
    if (!paginationContainer) return

    const prevBtn = document.getElementById("prev-page")
    const nextBtn = document.getElementById("next-page")
    const pageNumbers = document.getElementById("page-numbers")

    // Update prev/next buttons
    if (prevBtn) {
      prevBtn.disabled = !pagination.hasPrevPage
    }

    if (nextBtn) {
      nextBtn.disabled = !pagination.hasNextPage
    }

    // Update page numbers
    if (pageNumbers) {
      pageNumbers.innerHTML = this.generatePageNumbers(pagination)
    }
  }

  // Generate page numbers
  generatePageNumbers(pagination) {
    const { currentPage, totalPages } = pagination
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    let html = ""

    // First page
    if (startPage > 1) {
      html += `<button class="page-number" data-page="1">1</button>`
      if (startPage > 2) {
        html += `<span class="page-ellipsis">...</span>`
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-number ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<span class="page-ellipsis">...</span>`
      }
      html += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`
    }

    return html
  }

  // Bind pagination events
  bindPaginationEvents() {
    const pagination = document.getElementById("pagination")
    if (!pagination) return

    pagination.addEventListener("click", (e) => {
      if (e.target.matches("#prev-page")) {
        if (this.currentPage > 1) {
          this.currentPage--
          this.loadProducts()
          this.updateURL()
          this.scrollToTop()
        }
      }

      if (e.target.matches("#next-page")) {
        if (this.currentPage < this.totalPages) {
          this.currentPage++
          this.loadProducts()
          this.updateURL()
          this.scrollToTop()
        }
      }

      if (e.target.matches(".page-number")) {
        const page = Number.parseInt(e.target.dataset.page)
        if (page !== this.currentPage) {
          this.currentPage = page
          this.loadProducts()
          this.updateURL()
          this.scrollToTop()
        }
      }
    })
  }

  // Scroll to top of products
  scrollToTop() {
    const productsArea = document.querySelector(".products-area")
    if (productsArea) {
      productsArea.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Update URL with current state
  updateURL() {
    const params = new URLSearchParams()

    // Add filters
    if (this.currentFilters.search) {
      params.set("search", this.currentFilters.search)
    }

    if (this.currentFilters.categories && this.currentFilters.categories.length > 0) {
      params.set("category", this.currentFilters.categories.join(","))
    }

    if (this.currentFilters.brands && this.currentFilters.brands.length > 0) {
      params.set("brand", this.currentFilters.brands.join(","))
    }

    if (this.currentFilters.minPrice !== undefined) {
      params.set("min_price", this.currentFilters.minPrice)
    }

    if (this.currentFilters.maxPrice !== undefined) {
      params.set("max_price", this.currentFilters.maxPrice)
    }

    if (this.currentFilters.minRating) {
      params.set("rating", this.currentFilters.minRating)
    }

    // Add pagination
    if (this.currentPage > 1) {
      params.set("page", this.currentPage)
    }

    // Add sort
    if (this.currentSort !== "featured") {
      params.set("sort", this.currentSort)
    }

    // Update URL without reload
    const newURL = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`
    window.history.replaceState({}, "", newURL)
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
  window.shopPage = new ShopPage()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShopPage
}
