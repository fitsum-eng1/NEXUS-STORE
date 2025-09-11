// About Page JavaScript
import AOS from "aos" // Declare the AOS variable

class AboutPage {
  constructor() {
    this.init()
  }

  async init() {
    this.initAOS()
    this.initAnimations()
    this.bindEvents()
    this.updateCartCount()
    this.initParallax()
    this.initTypingEffect()
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

  // Initialize animations
  initAnimations() {
    // Animate statistics on scroll
    this.animateStats()

    // Animate timeline on scroll
    this.animateTimeline()
  }

  // Animate statistics
  animateStats() {
    const stats = document.querySelectorAll(".stat-number")

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateNumber(entry.target)
          observer.unobserve(entry.target)
        }
      })
    })

    stats.forEach((stat) => observer.observe(stat))
  }

  // Animate individual number
  animateNumber(element) {
    const text = element.textContent
    const hasPlus = text.includes("+")
    const hasPercent = text.includes("%")
    const hasSlash = text.includes("/")

    let finalNumber
    let suffix = ""

    if (hasSlash) {
      // Handle "24/7" case
      finalNumber = text
      element.textContent = "0/0"
    } else {
      finalNumber = Number.parseInt(text.replace(/[^\d]/g, ""))
      if (hasPlus) suffix = "+"
      if (hasPercent) suffix = "%"
      if (text.includes("K")) suffix = "K+"

      element.textContent = "0" + suffix
    }

    if (hasSlash) {
      // Special animation for "24/7"
      setTimeout(() => {
        element.textContent = finalNumber
      }, 500)
      return
    }

    const duration = 2000
    const steps = 60
    const increment = finalNumber / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= finalNumber) {
        current = finalNumber
        clearInterval(timer)
      }
      element.textContent = Math.floor(current) + suffix
    }, duration / steps)
  }

  // Animate timeline
  animateTimeline() {
    const timelineItems = document.querySelectorAll(".timeline-item")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1"
            entry.target.style.transform = "translateY(0)"
          }
        })
      },
      { threshold: 0.3 },
    )

    timelineItems.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(50px)"
      item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`
      observer.observe(item)
    })
  }

  // Bind events
  bindEvents() {
    // Team member hover effects
    this.bindTeamHoverEffects()

    // Value card interactions
    this.bindValueCardEffects()

    // Cart functionality
    if (window.cart) {
      window.cart.addListener(() => {
        this.updateCartCount()
      })
    }

    // Navigation
    this.bindNavigation()
  }

  // Bind team hover effects
  bindTeamHoverEffects() {
    const teamMembers = document.querySelectorAll(".team-member")

    teamMembers.forEach((member) => {
      member.addEventListener("mouseenter", () => {
        member.style.transform = "translateY(-10px) scale(1.02)"
      })

      member.addEventListener("mouseleave", () => {
        member.style.transform = "translateY(0) scale(1)"
      })
    })
  }

  // Bind value card effects
  bindValueCardEffects() {
    const valueCards = document.querySelectorAll(".value-card")

    valueCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        const icon = card.querySelector(".value-icon")
        if (icon) {
          icon.style.transform = "scale(1.1) rotate(5deg)"
        }
      })

      card.addEventListener("mouseleave", () => {
        const icon = card.querySelector(".value-icon")
        if (icon) {
          icon.style.transform = "scale(1) rotate(0deg)"
        }
      })
    })
  }

  // Bind navigation
  bindNavigation() {
    // Smooth scroll for anchor links
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault()
        const target = document.querySelector(e.target.getAttribute("href"))
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }
    })

    // Mobile menu toggle
    const navToggle = document.getElementById("nav-toggle")
    const navMenu = document.getElementById("nav-menu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active")
        navToggle.classList.toggle("active")
      })
    }

    // Search functionality
    const searchInput = document.getElementById("search-input")
    const searchBtn = document.querySelector(".search-btn")

    if (searchInput && searchBtn) {
      searchBtn.addEventListener("click", () => {
        this.handleSearch(searchInput.value)
      })

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleSearch(searchInput.value)
        }
      })
    }
  }

  // Handle search
  handleSearch(query) {
    if (query.trim()) {
      window.location.href = `shop.html?search=${encodeURIComponent(query.trim())}`
    }
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

  // Add parallax effect to hero section
  initParallax() {
    const hero = document.querySelector(".about-hero")
    if (!hero) return

    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset
      const rate = scrolled * -0.5
      hero.style.transform = `translateY(${rate}px)`
    })
  }

  // Add typing effect to hero title
  initTypingEffect() {
    const title = document.querySelector(".hero-title")
    if (!title) return

    const text = title.textContent
    title.textContent = ""

    let i = 0
    const typeWriter = () => {
      if (i < text.length) {
        title.textContent += text.charAt(i)
        i++
        setTimeout(typeWriter, 100)
      }
    }

    // Start typing effect after a delay
    setTimeout(typeWriter, 1000)
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.aboutPage = new AboutPage()
})
