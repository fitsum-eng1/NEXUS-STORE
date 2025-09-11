// Contact Page JavaScript
class ContactPage {
  constructor() {
    this.isLoaded = false
    this.chatOpen = false
    this.currentFAQCategory = "general"

    this.init()
  }

  async init() {
    this.initAOS()
    this.bindEvents()
    this.initChat()
    this.initFAQ()
    this.initFormValidation()
    this.updateAuthUI()
    this.isLoaded = true
  }

  // Initialize AOS
  initAOS() {
    const AOS = window.AOS // Declare the AOS variable
    if (AOS) {
      AOS.init({
        duration: 1000,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
        delay: 100,
      })
    }
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

    // Contact form submission
    const contactForm = document.getElementById("contact-form")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleFormSubmit(e))
    }

    // Character counter for message textarea
    const messageTextarea = document.getElementById("message")
    const charCount = document.getElementById("char-count")

    if (messageTextarea && charCount) {
      messageTextarea.addEventListener("input", () => {
        const count = messageTextarea.value.length
        charCount.textContent = count

        if (count > 1000) {
          charCount.style.color = "#dc3545"
        } else if (count > 800) {
          charCount.style.color = "#ffc107"
        } else {
          charCount.style.color = "#666"
        }
      })
    }

    // Start chat button
    const startChatBtn = document.getElementById("start-chat-btn")
    if (startChatBtn) {
      startChatBtn.addEventListener("click", () => this.openChat())
    }

    // Account button
    const accountBtn = document.getElementById("account-btn")
    if (accountBtn) {
      accountBtn.addEventListener("click", () => this.handleAccountClick())
    }

    // Cart button
    const cartBtn = document.getElementById("cart-btn")
    if (cartBtn) {
      cartBtn.addEventListener("click", () => this.toggleCart())
    }
  }

  // Handle search
  handleSearch() {
    const searchInput = document.getElementById("search-input")
    if (!searchInput) return

    const query = searchInput.value.trim()
    if (query) {
      window.location.href = `shop.html?search=${encodeURIComponent(query)}`
    }
  }

  // Handle account button click
  handleAccountClick() {
    const user = JSON.parse(localStorage.getItem("nexus_user") || "null")
    if (user) {
      window.location.href = "account.html"
    } else {
      window.location.href = "login.html"
    }
  }

  // Toggle cart
  toggleCart() {
    if (window.cartManager) {
      window.cartManager.toggleCart()
    }
  }

  // Update auth UI
  updateAuthUI() {
    const user = JSON.parse(localStorage.getItem("nexus_user") || "null")
    const accountBtn = document.getElementById("account-btn")

    if (accountBtn && user) {
      accountBtn.innerHTML = `
                <div class="user-menu">
                    <div class="user-avatar">
                        <img src="${user.avatar || "/placeholder.svg?height=32&width=32"}" alt="${user.firstName}">
                    </div>
                    <span class="btn-text">${user.firstName}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            `
    }
  }

  // Initialize chat widget
  initChat() {
    const chatToggle = document.getElementById("chat-toggle")
    const chatWindow = document.getElementById("chat-window")
    const chatClose = document.getElementById("chat-close")
    const chatInput = document.getElementById("chat-input")
    const chatSend = document.getElementById("chat-send")
    const quickActions = document.querySelectorAll(".quick-action")

    if (chatToggle && chatWindow) {
      chatToggle.addEventListener("click", () => this.toggleChat())
    }

    if (chatClose) {
      chatClose.addEventListener("click", () => this.closeChat())
    }

    if (chatSend && chatInput) {
      chatSend.addEventListener("click", () => this.sendMessage())
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage()
        }
      })
    }

    // Quick action buttons
    quickActions.forEach((btn) => {
      btn.addEventListener("click", () => {
        const message = btn.dataset.message
        if (message) {
          this.sendQuickMessage(message)
        }
      })
    })
  }

  // Toggle chat window
  toggleChat() {
    const chatWindow = document.getElementById("chat-window")
    const chatBadge = document.querySelector(".chat-badge")

    if (chatWindow) {
      this.chatOpen = !this.chatOpen
      chatWindow.classList.toggle("active", this.chatOpen)

      if (this.chatOpen && chatBadge) {
        chatBadge.style.display = "none"
      }
    }
  }

  // Open chat
  openChat() {
    const chatWindow = document.getElementById("chat-window")
    const chatBadge = document.querySelector(".chat-badge")

    if (chatWindow) {
      this.chatOpen = true
      chatWindow.classList.add("active")

      if (chatBadge) {
        chatBadge.style.display = "none"
      }
    }
  }

  // Close chat
  closeChat() {
    const chatWindow = document.getElementById("chat-window")

    if (chatWindow) {
      this.chatOpen = false
      chatWindow.classList.remove("active")
    }
  }

  // Send message
  sendMessage() {
    const chatInput = document.getElementById("chat-input")
    if (!chatInput || !chatInput.value.trim()) return

    const message = chatInput.value.trim()
    this.addMessage(message, "user")
    chatInput.value = ""

    // Simulate agent response
    setTimeout(
      () => {
        this.simulateAgentResponse(message)
      },
      1000 + Math.random() * 2000,
    )
  }

  // Send quick message
  sendQuickMessage(message) {
    this.addMessage(message, "user")

    // Simulate agent response
    setTimeout(
      () => {
        this.simulateAgentResponse(message)
      },
      1000 + Math.random() * 2000,
    )
  }

  // Add message to chat
  addMessage(text, sender) {
    const chatMessages = document.getElementById("chat-messages")
    if (!chatMessages) return

    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${sender}-message`

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (sender === "agent") {
      messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="/placeholder.svg?height=32&width=32" alt="Agent">
                </div>
                <div class="message-content">
                    <p>${text}</p>
                    <span class="message-time">${timeString}</span>
                </div>
            `
    } else {
      messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${text}</p>
                    <span class="message-time">${timeString}</span>
                </div>
            `
    }

    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  // Simulate agent response
  simulateAgentResponse(userMessage) {
    const responses = {
      order: [
        "I'd be happy to help you with your order! Could you please provide your order number?",
        "Let me check on your order status. What's your order number?",
        "I can help you track your order. Please share your order number with me.",
      ],
      return: [
        "I can assist you with returns. Our return policy allows returns within 30 days of purchase.",
        "To process your return, I'll need your order number and the reason for return.",
        "Returns are easy! Let me guide you through the process.",
      ],
      technical: [
        "I'm here to help with any technical issues. What specific problem are you experiencing?",
        "Let's troubleshoot this together. Can you describe the technical issue in detail?",
        "Technical support is available 24/7. What device or feature needs assistance?",
      ],
      general: [
        "Thank you for contacting NEXUS Store! How can I assist you today?",
        "I'm here to help! What questions do you have about our products or services?",
        "Welcome to NEXUS Store support. What can I help you with?",
      ],
    }

    let responseType = "general"
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("order") || lowerMessage.includes("purchase")) {
      responseType = "order"
    } else if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
      responseType = "return"
    } else if (
      lowerMessage.includes("technical") ||
      lowerMessage.includes("problem") ||
      lowerMessage.includes("issue")
    ) {
      responseType = "technical"
    }

    const possibleResponses = responses[responseType]
    const response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)]

    this.addMessage(response, "agent")
  }

  // Initialize FAQ
  initFAQ() {
    const categoryBtns = document.querySelectorAll(".faq-category-btn")
    const faqItems = document.querySelectorAll(".faq-item")

    // Category switching
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category
        this.switchFAQCategory(category)
      })
    })

    // FAQ item toggling
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question")
      if (question) {
        question.addEventListener("click", () => {
          item.classList.toggle("active")
        })
      }
    })
  }

  // Switch FAQ category
  switchFAQCategory(category) {
    // Update active button
    document.querySelectorAll(".faq-category-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category)
    })

    // Update active content
    document.querySelectorAll(".faq-category-content").forEach((content) => {
      content.classList.toggle("active", content.dataset.category === category)
    })

    this.currentFAQCategory = category
  }

  // Initialize form validation
  initFormValidation() {
    const form = document.getElementById("contact-form")
    if (!form) return

    const inputs = form.querySelectorAll("input, select, textarea")

    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input))
      input.addEventListener("input", () => this.clearFieldError(input))
    })
  }

  // Validate individual field
  validateField(field) {
    const value = field.value.trim()
    const fieldName = field.name
    let isValid = true
    let errorMessage = ""

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      isValid = false
      errorMessage = "This field is required"
    }

    // Email validation
    if (fieldName === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        isValid = false
        errorMessage = "Please enter a valid email address"
      }
    }

    // Phone validation
    if (fieldName === "phone" && value) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(value.replace(/[\s\-$$$$]/g, ""))) {
        isValid = false
        errorMessage = "Please enter a valid phone number"
      }
    }

    // Message length validation
    if (fieldName === "message" && value.length > 1000) {
      isValid = false
      errorMessage = "Message must be less than 1000 characters"
    }

    this.showFieldError(field, isValid ? "" : errorMessage)
    return isValid
  }

  // Show field error
  showFieldError(field, message) {
    const errorElement = field.parentNode.querySelector(".form-error")
    if (errorElement) {
      errorElement.textContent = message
      errorElement.style.display = message ? "block" : "none"
    }

    field.classList.toggle("error", !!message)
  }

  // Clear field error
  clearFieldError(field) {
    const errorElement = field.parentNode.querySelector(".form-error")
    if (errorElement) {
      errorElement.style.display = "none"
    }
    field.classList.remove("error")
  }

  // Handle form submission
  async handleFormSubmit(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector(".submit-btn")
    const formData = new FormData(form)

    // Validate all fields
    const inputs = form.querySelectorAll("input[required], select[required], textarea[required]")
    let isFormValid = true

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isFormValid = false
      }
    })

    if (!isFormValid) {
      this.showNotification("Please fix the errors in the form", "error")
      return
    }

    // Show loading state
    submitBtn.classList.add("loading")
    submitBtn.disabled = true

    try {
      // Simulate form submission
      await this.simulateFormSubmission(formData)

      // Success
      this.showNotification("Message sent successfully! We'll get back to you soon.", "success")
      form.reset()

      // Reset character counter
      const charCount = document.getElementById("char-count")
      if (charCount) {
        charCount.textContent = "0"
        charCount.style.color = "#666"
      }
    } catch (error) {
      this.showNotification("Failed to send message. Please try again.", "error")
    } finally {
      // Remove loading state
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false
    }
  }

  // Simulate form submission
  async simulateFormSubmission(formData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Form submitted:", Object.fromEntries(formData))
        resolve()
      }, 2000)
    })
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
    }, 5000)
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.contactPage = new ContactPage()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ContactPage
}
