// Authentication System for NEXUS Store

class AuthSystem {
  constructor() {
    this.currentUser = null
    this.isAuthenticated = false
    this.init()
  }

  init() {
    this.checkAuthState()
    this.bindEvents()
    this.updateNavigation()
  }

  // Initialize AOS
  initAOS() {
    const AOS = window.AOS // Declare the variable before using it
    if (AOS) {
      AOS.init({
        duration: 1000,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
      })
    }
  }

  // Check authentication state
  checkAuthState() {
    const userData = localStorage.getItem("nexus_user")
    const authToken = localStorage.getItem("nexus_auth_token")

    if (userData && authToken) {
      try {
        this.currentUser = JSON.parse(userData)
        this.isAuthenticated = true

        // Redirect if on auth pages
        if (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html")) {
          window.location.href = "account.html"
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        this.logout()
      }
    } else {
      // Redirect to login if on protected pages
      if (window.location.pathname.includes("account.html")) {
        window.location.href = "login.html"
      }
    }
  }

  // Bind event listeners
  bindEvents() {
    // Login form
    const loginForm = document.getElementById("login-form")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e))
    }

    // Register form
    const registerForm = document.getElementById("register-form")
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e))
    }

    // Password toggles
    document.addEventListener("click", (e) => {
      if (e.target.matches(".password-toggle, .password-toggle *")) {
        const toggle = e.target.closest(".password-toggle")
        this.togglePassword(toggle)
      }
    })

    // Password strength checker
    const passwordInput = document.getElementById("password")
    if (passwordInput && window.location.pathname.includes("register.html")) {
      passwordInput.addEventListener("input", (e) => this.checkPasswordStrength(e.target.value))
    }

    // Social auth buttons
    document.addEventListener("click", (e) => {
      if (e.target.matches(".social-btn, .social-btn *")) {
        const btn = e.target.closest(".social-btn")
        this.handleSocialAuth(btn)
      }
    })

    // Account button in navigation
    const accountBtn = document.getElementById("account-btn")
    if (accountBtn) {
      accountBtn.addEventListener("click", () => this.handleAccountClick())
    }

    // User menu toggle
    const userBtn = document.getElementById("user-btn")
    const userMenu = document.getElementById("user-menu")
    if (userBtn && userMenu) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        userMenu.classList.toggle("active")
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        userMenu.classList.remove("active")
      })
    }

    // Logout button
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout())
    }

    // Form validation
    document.addEventListener("input", (e) => {
      if (e.target.matches(".form-input")) {
        this.validateField(e.target)
      }
    })
  }

  // Handle login
  async handleLogin(e) {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const email = formData.get("email")
    const password = formData.get("password")
    const remember = formData.get("remember")

    // Validate form
    if (!this.validateLoginForm(email, password)) {
      return
    }

    const loginBtn = document.getElementById("login-btn")
    this.setButtonLoading(loginBtn, true)

    try {
      // Simulate API call
      await this.simulateLogin(email, password)

      // Create user session
      const userData = {
        id: Date.now(),
        email: email,
        firstName: email.split("@")[0],
        lastName: "User",
        avatar: null,
        joinDate: new Date().toISOString(),
        preferences: {
          newsletter: true,
          notifications: true,
        },
      }

      this.setUserSession(userData, remember)
      this.showNotification("Login successful! Welcome back.", "success")

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "account.html"
      }, 1500)
    } catch (error) {
      this.showNotification(error.message, "error")
    } finally {
      this.setButtonLoading(loginBtn, false)
    }
  }

  // Handle registration
  async handleRegister(e) {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)
    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: formData.get("terms"),
      newsletter: formData.get("newsletter"),
    }

    // Validate form
    if (!this.validateRegisterForm(userData)) {
      return
    }

    const registerBtn = document.getElementById("register-btn")
    this.setButtonLoading(registerBtn, true)

    try {
      // Simulate API call
      await this.simulateRegister(userData)

      // Create user session
      const newUser = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        avatar: null,
        joinDate: new Date().toISOString(),
        preferences: {
          newsletter: userData.newsletter === "on",
          notifications: true,
        },
      }

      this.setUserSession(newUser, false)
      this.showNotification("Account created successfully! Welcome to NEXUS.", "success")

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "account.html"
      }, 1500)
    } catch (error) {
      this.showNotification(error.message, "error")
    } finally {
      this.setButtonLoading(registerBtn, false)
    }
  }

  // Simulate login API call
  async simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check for demo accounts
        if (email === "demo@nexus.com" && password === "demo123") {
          resolve()
        } else if (email && password.length >= 6) {
          resolve()
        } else {
          reject(new Error("Invalid email or password"))
        }
      }, 1500)
    })
  }

  // Simulate register API call
  async simulateRegister(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists (simulate)
        const existingUsers = JSON.parse(localStorage.getItem("nexus_users") || "[]")
        if (existingUsers.find((user) => user.email === userData.email)) {
          reject(new Error("Email already exists"))
        } else {
          // Add to users list
          existingUsers.push({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
          })
          localStorage.setItem("nexus_users", JSON.stringify(existingUsers))
          resolve()
        }
      }, 2000)
    })
  }

  // Set user session
  setUserSession(userData, remember) {
    this.currentUser = userData
    this.isAuthenticated = true

    // Store user data
    localStorage.setItem("nexus_user", JSON.stringify(userData))
    localStorage.setItem("nexus_auth_token", this.generateToken())

    if (remember) {
      localStorage.setItem("nexus_remember", "true")
    }

    this.updateNavigation()
  }

  // Generate auth token
  generateToken() {
    return btoa(Date.now() + Math.random().toString(36))
  }

  // Logout
  logout() {
    this.currentUser = null
    this.isAuthenticated = false

    // Clear storage
    localStorage.removeItem("nexus_user")
    localStorage.removeItem("nexus_auth_token")
    localStorage.removeItem("nexus_remember")

    this.showNotification("Logged out successfully", "success")

    // Redirect to home
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1000)
  }

  // Update navigation based on auth state
  updateNavigation() {
    const accountBtn = document.getElementById("account-btn")
    const userMenu = document.getElementById("user-menu")
    const userName = document.getElementById("user-name")
    const userAvatar = document.getElementById("user-avatar")

    if (this.isAuthenticated && this.currentUser) {
      // Update account button to show user info
      if (accountBtn) {
        accountBtn.style.display = "none"
      }

      if (userMenu) {
        userMenu.style.display = "block"
      }

      if (userName) {
        userName.textContent = this.currentUser.firstName
      }

      if (userAvatar) {
        if (this.currentUser.avatar) {
          userAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar">`
        } else {
          userAvatar.innerHTML = `<i class="fas fa-user"></i>`
        }
      }
    } else {
      // Show login button
      if (accountBtn) {
        accountBtn.style.display = "flex"
      }

      if (userMenu) {
        userMenu.style.display = "none"
      }
    }
  }

  // Handle account button click
  handleAccountClick() {
    if (this.isAuthenticated) {
      window.location.href = "account.html"
    } else {
      window.location.href = "login.html"
    }
  }

  // Toggle password visibility
  togglePassword(toggle) {
    const input = toggle.parentElement.querySelector("input")
    const icon = toggle.querySelector("i")

    if (input.type === "password") {
      input.type = "text"
      icon.className = "fas fa-eye-slash"
    } else {
      input.type = "password"
      icon.className = "fas fa-eye"
    }
  }

  // Check password strength
  checkPasswordStrength(password) {
    const strengthBar = document.querySelector(".strength-fill")
    const strengthText = document.querySelector(".strength-text")

    if (!strengthBar || !strengthText) return

    let strength = 0
    let strengthLabel = "Very Weak"

    // Length check
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    // Set strength class and text
    strengthBar.className = "strength-fill"

    if (strength <= 2) {
      strengthBar.classList.add("weak")
      strengthLabel = "Weak"
    } else if (strength <= 3) {
      strengthBar.classList.add("fair")
      strengthLabel = "Fair"
    } else if (strength <= 4) {
      strengthBar.classList.add("good")
      strengthLabel = "Good"
    } else {
      strengthBar.classList.add("strong")
      strengthLabel = "Strong"
    }

    strengthText.textContent = `Password strength: ${strengthLabel}`
  }

  // Handle social authentication
  handleSocialAuth(btn) {
    const provider = btn.classList.contains("google-btn")
      ? "Google"
      : btn.classList.contains("facebook-btn")
        ? "Facebook"
        : "Apple"

    this.showNotification(`${provider} authentication coming soon!`, "info")
  }

  // Validate login form
  validateLoginForm(email, password) {
    let isValid = true

    // Email validation
    if (!email || !this.isValidEmail(email)) {
      this.showFieldError("email", "Please enter a valid email address")
      isValid = false
    } else {
      this.hideFieldError("email")
    }

    // Password validation
    if (!password || password.length < 6) {
      this.showFieldError("password", "Password must be at least 6 characters")
      isValid = false
    } else {
      this.hideFieldError("password")
    }

    return isValid
  }

  // Validate register form
  validateRegisterForm(userData) {
    let isValid = true

    // First name validation
    if (!userData.firstName || userData.firstName.trim().length < 2) {
      this.showFieldError("firstName", "First name must be at least 2 characters")
      isValid = false
    } else {
      this.hideFieldError("firstName")
    }

    // Last name validation
    if (!userData.lastName || userData.lastName.trim().length < 2) {
      this.showFieldError("lastName", "Last name must be at least 2 characters")
      isValid = false
    } else {
      this.hideFieldError("lastName")
    }

    // Email validation
    if (!userData.email || !this.isValidEmail(userData.email)) {
      this.showFieldError("email", "Please enter a valid email address")
      isValid = false
    } else {
      this.hideFieldError("email")
    }

    // Phone validation (optional)
    if (userData.phone && !this.isValidPhone(userData.phone)) {
      this.showFieldError("phone", "Please enter a valid phone number")
      isValid = false
    } else {
      this.hideFieldError("phone")
    }

    // Password validation
    if (!userData.password || userData.password.length < 8) {
      this.showFieldError("password", "Password must be at least 8 characters")
      isValid = false
    } else {
      this.hideFieldError("password")
    }

    // Confirm password validation
    if (userData.password !== userData.confirmPassword) {
      this.showFieldError("confirmPassword", "Passwords do not match")
      isValid = false
    } else {
      this.hideFieldError("confirmPassword")
    }

    // Terms validation
    if (!userData.terms) {
      this.showFieldError("terms", "You must agree to the terms and conditions")
      isValid = false
    } else {
      this.hideFieldError("terms")
    }

    return isValid
  }

  // Validate individual field
  validateField(field) {
    const value = field.value.trim()
    const fieldName = field.name

    switch (fieldName) {
      case "email":
        if (value && !this.isValidEmail(value)) {
          this.showFieldError(fieldName, "Please enter a valid email address")
        } else {
          this.hideFieldError(fieldName)
        }
        break

      case "phone":
        if (value && !this.isValidPhone(value)) {
          this.showFieldError(fieldName, "Please enter a valid phone number")
        } else {
          this.hideFieldError(fieldName)
        }
        break

      case "firstName":
      case "lastName":
        if (value && value.length < 2) {
          this.showFieldError(fieldName, "Must be at least 2 characters")
        } else {
          this.hideFieldError(fieldName)
        }
        break
    }
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation
  isValidPhone(phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  }

  // Show field error
  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`)
    const inputElement = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`)

    if (errorElement) {
      errorElement.textContent = message
      errorElement.classList.add("show")
    }

    if (inputElement) {
      inputElement.style.borderColor = "var(--danger-color)"
    }
  }

  // Hide field error
  hideFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`)
    const inputElement = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`)

    if (errorElement) {
      errorElement.classList.remove("show")
    }

    if (inputElement) {
      inputElement.style.borderColor = ""
    }
  }

  // Set button loading state
  setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add("loading")
      button.disabled = true
    } else {
      button.classList.remove("loading")
      button.disabled = false
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
    }, 4000)
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated
  }
}

// Initialize authentication system
document.addEventListener("DOMContentLoaded", () => {
  window.authSystem = new AuthSystem()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthSystem
}
