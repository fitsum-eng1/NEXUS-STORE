// Main JavaScript for NEXUS Store
class NexusStore {
  constructor() {
    this.isLoaded = false
    this.currentSlide = 0
    this.slideInterval = null
    this.scene = null
    this.camera = null
    this.renderer = null
    this.particles = null

    this.init()
  }

  async init() {
    this.showLoader()
    await this.loadDependencies()
    this.initAOS()
    this.initGSAP()
    this.initThreeJS()
    this.bindEvents()
    this.loadFeaturedProducts()
    this.initHeroSlideshow()
    this.animateCounters()
    this.hideLoader()
  }

  // Show loading screen
  showLoader() {
    const loader = document.getElementById("loading-screen")
    if (loader) {
      loader.style.display = "flex"
      this.animateProgressBar()
    }
  }

  // Hide loading screen
  hideLoader() {
    const loader = document.getElementById("loading-screen")
    if (loader && window.gsap) {
      gsap.to(loader, {
        opacity: 0,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
          loader.style.display = "none"
          this.isLoaded = true
          this.startMainAnimations()
        },
      })
    } else if (loader) {
      loader.style.display = "none"
      this.isLoaded = true
    }
  }

  // Animate progress bar
  animateProgressBar() {
    const progressBar = document.querySelector(".progress-bar")
    if (progressBar && window.gsap) {
      gsap.to(progressBar, {
        width: "100%",
        duration: 2.5,
        ease: "power2.inOut",
      })
    }
  }

  // Load dependencies
  async loadDependencies() {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalDependencies = 3

      const checkLoaded = () => {
        loadedCount++
        if (loadedCount >= totalDependencies) {
          resolve()
        }
      }

      // Check if GSAP is loaded
      if (window.gsap) {
        checkLoaded()
      } else {
        setTimeout(checkLoaded, 100)
      }

      // Check if AOS is loaded
      if (window.AOS) {
        checkLoaded()
      } else {
        setTimeout(checkLoaded, 100)
      }

      // Check if Three.js is loaded
      if (window.THREE) {
        checkLoaded()
      } else {
        setTimeout(checkLoaded, 100)
      }
    })
  }

  // Initialize AOS
  initAOS() {
    if (window.AOS) {
      AOS.init({
        duration: 1000,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
        delay: 100,
      })
    }
  }

  // Initialize GSAP
  initGSAP() {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(ScrollTrigger)

      // Navbar scroll effect
      window.gsap.to(".navbar", {
        backgroundColor: "rgba(15, 15, 35, 0.98)",
        backdropFilter: "blur(20px)",
        scrollTrigger: {
          trigger: "body",
          start: "top -80px",
          end: "bottom top",
          toggleClass: { targets: ".navbar", className: "scrolled" },
        },
      })
    }
  }

  // Initialize Three.js background
  initThreeJS() {
    if (!window.THREE) return

    try {
      const canvas = document.getElementById("three-canvas")
      if (!canvas) return

      // Scene setup
      this.scene = new window.THREE.Scene()
      this.camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      this.renderer = new window.THREE.WebGLRenderer({ canvas, alpha: true })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Create particles
      this.createParticles()

      // Position camera
      this.camera.position.z = 5

      // Start animation loop
      this.animateThreeJS()

      // Handle resize
      window.addEventListener("resize", () => this.onWindowResize())
    } catch (error) {
      console.log("Three.js initialization failed:", error)
    }
  }

  // Create particle system
  createParticles() {
    if (!this.scene) return

    const particleCount = 500
    const geometry = new window.THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50

      colors[i * 3] = Math.random() * 0.5 + 0.5
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5
      colors[i * 3 + 2] = 1

      sizes[i] = Math.random() * 2 + 1
    }

    geometry.setAttribute("position", new window.THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new window.THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new window.THREE.BufferAttribute(sizes, 1))

    const material = new window.THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * (0.5 + sin(time + position.x * 0.01) * 0.3);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float r = distance(gl_PointCoord, vec2(0.5, 0.5));
          if (r > 0.5) discard;
          gl_FragColor = vec4(vColor, 0.6 - r * 1.2);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: window.THREE.AdditiveBlending,
    })

    this.particles = new window.THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  // Animate Three.js scene
  animateThreeJS() {
    if (!this.renderer || !this.scene || !this.camera) return

    requestAnimationFrame(() => this.animateThreeJS())

    if (this.particles) {
      this.particles.rotation.x += 0.0005
      this.particles.rotation.y += 0.001

      if (this.particles.material.uniforms) {
        this.particles.material.uniforms.time.value += 0.01
      }

      // Move particles
      const positions = this.particles.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.01
      }
      this.particles.geometry.attributes.position.needsUpdate = true
    }

    this.renderer.render(this.scene, this.camera)
  }

  // Handle window resize
  onWindowResize() {
    if (!this.camera || !this.renderer) return

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  // Bind event listeners
  bindEvents() {
    // Navigation toggle
    const navToggle = document.getElementById("nav-toggle")
    const navMenu = document.getElementById("nav-menu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("active")
        navMenu.classList.toggle("active")
      })
    }

    // Search functionality
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

    // Newsletter form
    const newsletterForm = document.getElementById("newsletter-form")
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => this.handleNewsletterSubmit(e))
    }

    // Hero demo button
    const heroDemo = document.getElementById("hero-demo")
    if (heroDemo) {
      heroDemo.addEventListener("click", () => this.showDemo())
    }

    // Category cards
    document.addEventListener("click", (e) => {
      if (e.target.closest(".category-card")) {
        const card = e.target.closest(".category-card")
        this.handleCategoryClick(card)
      }
    })

    // Smooth scrolling for anchor links
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault()
        const target = document.querySelector(e.target.getAttribute("href"))
        if (target) {
          target.scrollIntoView({ behavior: "smooth" })
        }
      }
    })
  }

  // Handle search
  handleSearch() {
    const searchInput = document.getElementById("search-input")
    if (!searchInput) return

    const query = searchInput.value.trim()
    if (query) {
      // Redirect to shop page with search query
      window.location.href = `shop.html?search=${encodeURIComponent(query)}`
    }
  }

  // Handle newsletter submission
  handleNewsletterSubmit(e) {
    e.preventDefault()
    const form = e.target
    const email = form.querySelector(".newsletter-input").value

    if (this.validateEmail(email)) {
      this.showNotification("Thank you for subscribing!", "success")
      form.reset()
    } else {
      this.showNotification("Please enter a valid email address", "error")
    }
  }

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Show demo
  showDemo() {
    this.showNotification("Demo feature coming soon!", "info")
  }

  // Handle category click
  handleCategoryClick(card) {
    const category = card.dataset.category
    if (category) {
      window.location.href = `shop.html?category=${category}`
    }
  }

  // Load featured products
  async loadFeaturedProducts() {
    try {
      const products = window.productData.getFeaturedProducts(6)
      this.renderProducts(products, "featured-products-grid")
    } catch (error) {
      console.error("Error loading featured products:", error)
    }
  }

  // Render products
  renderProducts(products, containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML = products
      .map(
        (product) => `
      <div class="product-card" data-aos="fade-up" data-aos-delay="${Math.random() * 200}">
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
          <h3 class="product-title">${product.name}</h3>
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
    this.bindProductEvents(container)
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
  bindProductEvents(container) {
    container.addEventListener("click", (e) => {
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

      // Product card click (go to product page)
      if (e.target.matches(".product-card, .product-card .product-image, .product-card .product-title")) {
        const card = e.target.closest(".product-card")
        const productId = card.querySelector(".add-to-cart-btn").dataset.productId
        window.location.href = `product.html?id=${productId}`
      }
    })
  }

  // Show quick view modal
  showQuickView(productId) {
    this.showNotification("Quick view feature coming soon!", "info")
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

  // Initialize hero slideshow
  initHeroSlideshow() {
    const showcase = document.getElementById("hero-showcase")
    const controls = document.querySelectorAll(".control-btn")

    if (!showcase || !controls.length) return

    // Auto-advance slides
    this.slideInterval = setInterval(() => {
      this.nextSlide()
    }, 5000)

    // Control button clicks
    controls.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        this.goToSlide(index)
      })
    })

    // Pause on hover
    showcase.addEventListener("mouseenter", () => {
      clearInterval(this.slideInterval)
    })

    showcase.addEventListener("mouseleave", () => {
      this.slideInterval = setInterval(() => {
        this.nextSlide()
      }, 5000)
    })
  }

  // Go to specific slide
  goToSlide(index) {
    const items = document.querySelectorAll(".showcase-item")
    const controls = document.querySelectorAll(".control-btn")

    if (!items.length || !controls.length) return

    // Remove active class from all
    items.forEach((item) => item.classList.remove("active"))
    controls.forEach((btn) => btn.classList.remove("active"))

    // Add active class to current
    items[index].classList.add("active")
    controls[index].classList.add("active")

    this.currentSlide = index
  }

  // Next slide
  nextSlide() {
    const items = document.querySelectorAll(".showcase-item")
    if (!items.length) return

    const nextIndex = (this.currentSlide + 1) % items.length
    this.goToSlide(nextIndex)
  }

  // Animate counters
  animateCounters() {
    const counters = document.querySelectorAll(".stat-number")

    counters.forEach((counter) => {
      const target = Number.parseInt(counter.dataset.count)
      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const updateCounter = () => {
        current += increment
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString()
          requestAnimationFrame(updateCounter)
        } else {
          counter.textContent = target.toLocaleString()
        }
      }

      // Start animation when element is in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateCounter()
            observer.unobserve(entry.target)
          }
        })
      })

      observer.observe(counter)
    })
  }

  // Start main animations
  startMainAnimations() {
    if (!window.gsap) return

    // Hero entrance animation
    const tl = window.gsap.timeline()

    tl.from(".hero-title .title-line", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    })
      .from(
        ".hero-title .title-main",
        {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5",
      )
      .from(
        ".hero-title .title-sub",
        {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.7",
      )
      .from(
        ".hero-description",
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5",
      )
      .from(
        ".hero-actions .btn",
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out",
        },
        "-=0.3",
      )
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
  window.nexusStore = new NexusStore()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = NexusStore
}
