// Account Management System for NEXUS Store

class AccountManager {
  constructor() {
    this.currentUser = null
    this.activeTab = "overview"
    this.init()
  }

  init() {
    this.loadUserData()
    this.bindEvents()
    this.initTabs()
    this.loadAccountData()
  }

  // Load user data
  loadUserData() {
    const userData = localStorage.getItem("nexus_user")
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData)
        this.updateUserProfile()
      } catch (error) {
        console.error("Error loading user data:", error)
        window.location.href = "login.html"
      }
    } else {
      window.location.href = "login.html"
    }
  }

  // Update user profile display
  updateUserProfile() {
    if (!this.currentUser) return

    // Update profile name
    const profileName = document.getElementById("profile-name")
    if (profileName) {
      profileName.textContent = `Welcome back, ${this.currentUser.firstName}!`
    }

    // Update profile email
    const profileEmail = document.getElementById("profile-email")
    if (profileEmail) {
      profileEmail.textContent = this.currentUser.email
    }

    // Update avatar
    const profileAvatar = document.getElementById("profile-avatar")
    if (profileAvatar) {
      if (this.currentUser.avatar) {
        profileAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="Profile">`
      } else {
        const initials = (this.currentUser.firstName.charAt(0) + this.currentUser.lastName.charAt(0)).toUpperCase()
        profileAvatar.innerHTML = initials
      }
    }

    // Update form fields
    this.populateProfileForm()
  }

  // Populate profile form
  populateProfileForm() {
    if (!this.currentUser) return

    const fields = {
      "edit-firstName": this.currentUser.firstName,
      "edit-lastName": this.currentUser.lastName,
      "edit-email": this.currentUser.email,
      "edit-phone": this.currentUser.phone || "",
      "edit-birthdate": this.currentUser.birthdate || "",
      "edit-gender": this.currentUser.gender || "",
    }

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) {
        element.value = value
      }
    })
  }

  // Bind event listeners
  bindEvents() {
    // Tab navigation
    document.addEventListener("click", (e) => {
      if (e.target.matches(".nav-item[data-tab]")) {
        e.preventDefault()
        const tab = e.target.dataset.tab
        this.switchTab(tab)
      }
    })

    // Profile form
    const profileForm = document.getElementById("profile-form")
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => this.handleProfileUpdate(e))
    }

    // Password form
    const passwordForm = document.getElementById("password-form")
    if (passwordForm) {
      passwordForm.addEventListener("submit", (e) => this.handlePasswordChange(e))
    }

    // Avatar edit
    const avatarEdit = document.getElementById("avatar-edit")
    if (avatarEdit) {
      avatarEdit.addEventListener("click", () => this.handleAvatarEdit())
    }

    // Edit profile button
    const editProfileBtn = document.getElementById("edit-profile-btn")
    if (editProfileBtn) {
      editProfileBtn.addEventListener("click", () => this.switchTab("profile"))
    }

    // Cancel edit
    const cancelEdit = document.getElementById("cancel-edit")
    if (cancelEdit) {
      cancelEdit.addEventListener("click", () => this.cancelProfileEdit())
    }

    // Security toggles
    document.addEventListener("change", (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        this.handleSecurityToggle(e.target)
      }
    })

    // Filter changes
    document.addEventListener("change", (e) => {
      if (e.target.matches(".filter-select")) {
        this.handleFilterChange(e.target)
      }
    })
  }

  // Initialize tabs
  initTabs() {
    const hash = window.location.hash.substring(1)
    if (hash && document.getElementById(`${hash}-tab`)) {
      this.switchTab(hash)
    } else {
      this.switchTab("overview")
    }
  }

  // Switch tab
  switchTab(tabName) {
    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })

    const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`)
    if (activeNavItem) {
      activeNavItem.classList.add("active")
    }

    // Update active tab content
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active")
    })

    const activeTab = document.getElementById(`${tabName}-tab`)
    if (activeTab) {
      activeTab.classList.add("active")
    }

    this.activeTab = tabName
    window.location.hash = tabName

    // Load tab-specific data
    this.loadTabData(tabName)
  }

  // Load tab-specific data
  loadTabData(tabName) {
    switch (tabName) {
      case "overview":
        this.loadOverviewData()
        break
      case "orders":
        this.loadOrdersData()
        break
      case "wishlist":
        this.loadWishlistData()
        break
    }
  }

  // Load account data
  loadAccountData() {
    this.loadOverviewData()
    this.loadStats()
  }

  // Load overview data
  loadOverviewData() {
    // Load recent orders count
    const orders = this.getOrders()
    const recentOrdersCount = document.getElementById("recent-orders-count")
    if (recentOrdersCount) {
      recentOrdersCount.textContent = orders.length
    }

    // Load wishlist count
    const wishlist = this.getWishlist()
    const wishlistCount = document.getElementById("wishlist-count")
    if (wishlistCount) {
      wishlistCount.textContent = wishlist.length
    }

    // Load loyalty points
    const pointsBalance = document.getElementById("points-balance")
    if (pointsBalance) {
      pointsBalance.textContent = this.currentUser.loyaltyPoints || 0
    }

    // Load active shipments
    const activeShipments = orders.filter((order) => order.status === "shipped" || order.status === "processing")
    const activeShipmentsCount = document.getElementById("active-shipments")
    if (activeShipmentsCount) {
      activeShipmentsCount.textContent = activeShipments.length
    }

    // Load recent activity
    this.loadRecentActivity()
  }

  // Load stats
  loadStats() {
    const orders = this.getOrders()

    // Total orders
    const totalOrders = document.getElementById("total-orders")
    if (totalOrders) {
      totalOrders.textContent = orders.length
    }

    // Total spent
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalSpentElement = document.getElementById("total-spent")
    if (totalSpentElement) {
      totalSpentElement.textContent = `$${totalSpent.toFixed(2)}`
    }

    // Loyalty points
    const loyaltyPoints = document.getElementById("loyalty-points")
    if (loyaltyPoints) {
      loyaltyPoints.textContent = this.currentUser.loyaltyPoints || 0
    }
  }

  // Load recent activity
  loadRecentActivity() {
    const activityList = document.getElementById("activity-list")
    if (!activityList) return

    const activities = this.getRecentActivity()

    if (activities.length === 0) {
      activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="activity-content">
                        <p>Account created successfully</p>
                        <span class="activity-time">Welcome to NEXUS!</span>
                    </div>
                </div>
            `
      return
    }

    activityList.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <span class="activity-time">${this.formatDate(activity.date)}</span>
                </div>
            </div>
        `,
      )
      .join("")
  }

  // Load orders data
  loadOrdersData() {
    const ordersList = document.getElementById("orders-list")
    if (!ordersList) return

    const orders = this.getOrders()

    if (orders.length === 0) {
      ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No Orders Yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `
      return
    }

    ordersList.innerHTML = orders
      .map(
        (order) => `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.id}</h4>
                        <p>Placed on ${this.formatDate(order.date)}</p>
                    </div>
                    <div class="order-status status-${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                </div>
                <div class="order-items">
                    ${order.items
                      .map(
                        (item) => `
                        <div class="order-item-detail">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-info">
                                <h5>${item.name}</h5>
                                <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div class="order-footer">
                    <div class="order-total">Total: $${order.total.toFixed(2)}</div>
                    <div class="order-actions">
                        <button class="btn btn-outline btn-sm" onclick="accountManager.viewOrder('${order.id}')">
                            View Details
                        </button>
                        ${
                          order.status === "delivered"
                            ? `<button class="btn btn-primary btn-sm" onclick="accountManager.reorderItems('${order.id}')">
                                Reorder
                            </button>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  // Handle profile update
  async handleProfileUpdate(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const updatedData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      birthdate: formData.get("birthdate"),
      gender: formData.get("gender"),
    }

    // Validate data
    if (!this.validateProfileData(updatedData)) {
      return
    }

    try {
      // Update user data
      Object.assign(this.currentUser, updatedData)
      localStorage.setItem("nexus_user", JSON.stringify(this.currentUser))

      this.updateUserProfile()
      this.showNotification("Profile updated successfully!", "success")

      // Switch back to overview
      setTimeout(() => {
        this.switchTab("overview")
      }, 1500)
    } catch (error) {
      this.showNotification("Error updating profile. Please try again.", "error")
    }
  }

  // Handle password change
  async handlePasswordChange(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const currentPassword = formData.get("currentPassword")
    const newPassword = formData.get("newPassword")
    const confirmPassword = formData.get("confirmPassword")

    // Validate passwords
    if (!this.validatePasswordChange(currentPassword, newPassword, confirmPassword)) {
      return
    }

    try {
      // Simulate password change
      await this.simulatePasswordChange(currentPassword, newPassword)

      this.showNotification("Password changed successfully!", "success")
      e.target.reset()
    } catch (error) {
      this.showNotification(error.message, "error")
    }
  }

  // Handle avatar edit
  handleAvatarEdit() {
    // Create file input
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.style.display = "none"

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        this.handleAvatarUpload(file)
      }
    })

    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }

  // Handle avatar upload
  handleAvatarUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      this.showNotification("File size must be less than 5MB", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const avatarUrl = e.target.result

      // Update user avatar
      this.currentUser.avatar = avatarUrl
      localStorage.setItem("nexus_user", JSON.stringify(this.currentUser))

      // Update display
      this.updateUserProfile()
      this.showNotification("Avatar updated successfully!", "success")
    }

    reader.readAsDataURL(file)
  }

  // Handle security toggle
  handleSecurityToggle(toggle) {
    const setting = toggle.id
    const enabled = toggle.checked

    // Update user preferences
    if (!this.currentUser.security) {
      this.currentUser.security = {}
    }

    this.currentUser.security[setting] = enabled
    localStorage.setItem("nexus_user", JSON.stringify(this.currentUser))

    const settingName = setting.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    this.showNotification(`${settingName} ${enabled ? "enabled" : "disabled"}`, "success")
  }

  // Handle filter change
  handleFilterChange(select) {
    const filterType = select.id
    const filterValue = select.value

    if (filterType === "order-status-filter" || filterType === "order-time-filter") {
      this.filterOrders()
    }
  }

  // Filter orders
  filterOrders() {
    const statusFilter = document.getElementById("order-status-filter")?.value
    const timeFilter = document.getElementById("order-time-filter")?.value

    let orders = this.getOrders()

    // Apply status filter
    if (statusFilter) {
      orders = orders.filter((order) => order.status === statusFilter)
    }

    // Apply time filter
    if (timeFilter) {
      const days = Number.parseInt(timeFilter)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      orders = orders.filter((order) => new Date(order.date) >= cutoffDate)
    }

    this.renderFilteredOrders(orders)
  }

  // Render filtered orders
  renderFilteredOrders(orders) {
    const ordersList = document.getElementById("orders-list")
    if (!ordersList) return

    if (orders.length === 0) {
      ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Orders Found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `
      return
    }

    // Use the same rendering logic as loadOrdersData
    this.renderOrders(orders, ordersList)
  }

  // Cancel profile edit
  cancelProfileEdit() {
    this.populateProfileForm()
    this.switchTab("overview")
  }

  // Validate profile data
  validateProfileData(data) {
    let isValid = true

    if (!data.firstName || data.firstName.trim().length < 2) {
      this.showNotification("First name must be at least 2 characters", "error")
      isValid = false
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      this.showNotification("Last name must be at least 2 characters", "error")
      isValid = false
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      this.showNotification("Please enter a valid email address", "error")
      isValid = false
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      this.showNotification("Please enter a valid phone number", "error")
      isValid = false
    }

    return isValid
  }

  // Validate password change
  validatePasswordChange(current, newPass, confirm) {
    if (!current) {
      this.showNotification("Please enter your current password", "error")
      return false
    }

    if (!newPass || newPass.length < 8) {
      this.showNotification("New password must be at least 8 characters", "error")
      return false
    }

    if (newPass !== confirm) {
      this.showNotification("New passwords do not match", "error")
      return false
    }

    return true
  }

  // Simulate password change
  async simulatePasswordChange(current, newPass) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, you would verify the current password
        if (current.length >= 6) {
          resolve()
        } else {
          reject(new Error("Current password is incorrect"))
        }
      }, 1000)
    })
  }

  // Get orders (mock data)
  getOrders() {
    const orders = localStorage.getItem(`nexus_orders_${this.currentUser.id}`)
    return orders ? JSON.parse(orders) : []
  }

  // Get wishlist
  getWishlist() {
    const wishlist = localStorage.getItem(`nexus_wishlist_${this.currentUser.id}`)
    return wishlist ? JSON.parse(wishlist) : []
  }

  // Get recent activity
  getRecentActivity() {
    const activity = localStorage.getItem(`nexus_activity_${this.currentUser.id}`)
    return activity ? JSON.parse(activity) : []
  }

  // View order details
  viewOrder(orderId) {
    this.showNotification("Order details feature coming soon!", "info")
  }

  // Reorder items
  reorderItems(orderId) {
    this.showNotification("Reorder feature coming soon!", "info")
  }

  // Utility functions
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidPhone(phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
    }, 4000)
  }
}

// Initialize account manager
document.addEventListener("DOMContentLoaded", () => {
  window.accountManager = new AccountManager()
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AccountManager
}
