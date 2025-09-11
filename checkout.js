// Checkout Page JavaScript
class CheckoutPage {
  constructor() {
    this.currentStep = 1
    this.totalSteps = 4
    this.formData = {}
    this.orderData = {}
    this.shippingRates = {
      standard: 0,
      express: 9.99,
      overnight: 19.99,
    }
    this.AOS = window.AOS // Declare the AOS variable

    this.init()
  }

  async init() {
    this.bindEvents()
    this.initAOS()
    this.loadOrderSummary()
    this.validateCartItems()
    this.setupFormValidation()
    this.loadSavedData()
  }

  // Initialize AOS
  initAOS() {
    if (this.AOS) {
      this.AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 50,
      })
    }
  }

  // Validate cart items
  validateCartItems() {
    if (!window.cart || window.cart.getItemCount() === 0) {
      this.showNotification("Your cart is empty. Redirecting to shop...", "warning")
      setTimeout(() => {
        window.location.href = "shop.html"
      }, 2000)
      return false
    }
    return true
  }

  // Bind event listeners
  bindEvents() {
    // Step navigation
    document.getElementById("continue-to-shipping")?.addEventListener("click", () => this.nextStep())
    document.getElementById("continue-to-payment")?.addEventListener("click", () => this.nextStep())
    document.getElementById("continue-to-review")?.addEventListener("click", () => this.nextStep())

    document.getElementById("back-to-info")?.addEventListener("click", () => this.prevStep())
    document.getElementById("back-to-shipping")?.addEventListener("click", () => this.prevStep())
    document.getElementById("back-to-payment")?.addEventListener("click", () => this.prevStep())

    // Form submission
    document.getElementById("checkout-form")?.addEventListener("submit", (e) => this.handleSubmit(e))

    // Shipping address toggle
    document.getElementById("same-as-billing")?.addEventListener("change", (e) => {
      this.toggleShippingAddress(e.target.checked)
    })

    // Payment method change
    document.querySelectorAll('input[name="payment"]').forEach((radio) => {
      radio.addEventListener("change", () => this.handlePaymentMethodChange())
    })

    // Shipping method change
    document.querySelectorAll('input[name="shipping"]').forEach((radio) => {
      radio.addEventListener("change", () => this.updateShippingCost())
    })

    // Form input changes
    document.addEventListener("input", (e) => {
      if (e.target.matches("#checkout-form input, #checkout-form select")) {
        this.saveFormData()
        this.validateField(e.target)
      }
    })

    // Card number formatting
    document.getElementById("cardNumber")?.addEventListener("input", (e) => {
      this.formatCardNumber(e.target)
    })

    // Expiry date formatting
    document.getElementById("expiryDate")?.addEventListener("input", (e) => {
      this.formatExpiryDate(e.target)
    })

    // CVV formatting
    document.getElementById("cvv")?.addEventListener("input", (e) => {
      this.formatCVV(e.target)
    })
  }

  // Setup form validation
  setupFormValidation() {
    const form = document.getElementById("checkout-form")
    if (!form) return

    // Add real-time validation
    const inputs = form.querySelectorAll("input[required], select[required]")
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input))
    })
  }

  // Validate individual field
  validateField(field) {
    const value = field.value.trim()
    let isValid = true
    let message = ""

    // Remove existing error
    this.clearFieldError(field)

    if (field.hasAttribute("required") && !value) {
      isValid = false
      message = "This field is required"
    } else {
      // Specific validations
      switch (field.type) {
        case "email":
          if (value && !this.isValidEmail(value)) {
            isValid = false
            message = "Please enter a valid email address"
          }
          break
        case "tel":
          if (value && !this.isValidPhone(value)) {
            isValid = false
            message = "Please enter a valid phone number"
          }
          break
      }

      // Field-specific validations
      switch (field.id) {
        case "zipCode":
          if (value && !this.isValidZipCode(value)) {
            isValid = false
            message = "Please enter a valid ZIP code"
          }
          break
        case "cardNumber":
          if (value && !this.isValidCardNumber(value)) {
            isValid = false
            message = "Please enter a valid card number"
          }
          break
        case "expiryDate":
          if (value && !this.isValidExpiryDate(value)) {
            isValid = false
            message = "Please enter a valid expiry date"
          }
          break
        case "cvv":
          if (value && !this.isValidCVV(value)) {
            isValid = false
            message = "Please enter a valid CVV"
          }
          break
      }
    }

    if (!isValid) {
      this.showFieldError(field, message)
    }

    return isValid
  }

  // Validation helpers
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  isValidPhone(phone) {
    return /^[+]?[1-9][\d]{0,15}$/.test(phone.replace(/\D/g, ""))
  }

  isValidZipCode(zip) {
    return /^\d{5}(-\d{4})?$/.test(zip)
  }

  isValidCardNumber(number) {
    const cleaned = number.replace(/\D/g, "")
    return cleaned.length >= 13 && cleaned.length <= 19 && this.luhnCheck(cleaned)
  }

  isValidExpiryDate(date) {
    const match = date.match(/^(\d{2})\/(\d{2})$/)
    if (!match) return false

    const month = Number.parseInt(match[1])
    const year = Number.parseInt("20" + match[2])
    const now = new Date()
    const expiry = new Date(year, month - 1)

    return month >= 1 && month <= 12 && expiry > now
  }

  isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv)
  }

  // Luhn algorithm for card validation
  luhnCheck(number) {
    let sum = 0
    let isEven = false

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(number[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Show field error
  showFieldError(field, message) {
    field.classList.add("error")

    let errorElement = field.parentElement.querySelector(".field-error")
    if (!errorElement) {
      errorElement = document.createElement("div")
      errorElement.className = "field-error"
      field.parentElement.appendChild(errorElement)
    }

    errorElement.textContent = message
  }

  // Clear field error
  clearFieldError(field) {
    field.classList.remove("error")
    const errorElement = field.parentElement.querySelector(".field-error")
    if (errorElement) {
      errorElement.remove()
    }
  }

  // Format card number
  formatCardNumber(input) {
    let value = input.value.replace(/\D/g, "")
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ")
    input.value = value
  }

  // Format expiry date
  formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    input.value = value
  }

  // Format CVV
  formatCVV(input) {
    input.value = input.value.replace(/\D/g, "").substring(0, 4)
  }

  // Navigate to next step
  nextStep() {
    if (!this.validateCurrentStep()) {
      return
    }

    this.saveFormData()

    if (this.currentStep < this.totalSteps) {
      this.currentStep++
      this.updateStepDisplay()

      if (this.currentStep === 4) {
        this.populateOrderReview()
      }
    }
  }

  // Navigate to previous step
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--
      this.updateStepDisplay()
    }
  }

  // Update step display
  updateStepDisplay() {
    // Update progress indicators
    document.querySelectorAll(".progress-step").forEach((step, index) => {
      const stepNumber = index + 1
      step.classList.remove("active", "completed")

      if (stepNumber === this.currentStep) {
        step.classList.add("active")
      } else if (stepNumber < this.currentStep) {
        step.classList.add("completed")
      }
    })

    // Update step content
    document.querySelectorAll(".checkout-step").forEach((step, index) => {
      const stepNumber = index + 1
      step.classList.remove("active")

      if (stepNumber === this.currentStep) {
        step.classList.add("active")
      }
    })

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Validate current step
  validateCurrentStep() {
    const currentStepElement = document.getElementById(`step-${this.currentStep}`)
    if (!currentStepElement) return true

    const requiredFields = currentStepElement.querySelectorAll("input[required], select[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false
      }
    })

    // Step-specific validations
    switch (this.currentStep) {
      case 1:
        // Validate customer information
        break
      case 2:
        // Validate shipping information
        break
      case 3:
        // Validate payment information
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value
        if (paymentMethod === "credit-card") {
          const cardFields = ["cardNumber", "cardName", "expiryDate", "cvv"]
          cardFields.forEach((fieldId) => {
            const field = document.getElementById(fieldId)
            if (field && !this.validateField(field)) {
              isValid = false
            }
          })
        }
        break
      case 4:
        // Validate terms acceptance
        const termsCheckbox = document.getElementById("terms")
        if (termsCheckbox && !termsCheckbox.checked) {
          this.showNotification("Please accept the terms and conditions", "warning")
          isValid = false
        }
        break
    }

    if (!isValid) {
      this.showNotification("Please correct the errors before continuing", "error")
    }

    return isValid
  }

  // Toggle shipping address
  toggleShippingAddress(sameAsBilling) {
    const shippingAddress = document.getElementById("shipping-address")
    if (shippingAddress) {
      shippingAddress.style.display = sameAsBilling ? "none" : "block"
    }
  }

  // Handle payment method change
  handlePaymentMethodChange() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value
    const creditCardForm = document.getElementById("credit-card-form")

    if (creditCardForm) {
      creditCardForm.style.display = paymentMethod === "credit-card" ? "block" : "none"
    }
  }

  // Update shipping cost
  updateShippingCost() {
    const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value
    if (shippingMethod && window.cart) {
      // Update cart with new shipping cost
      this.loadOrderSummary()
    }
  }

  // Load order summary
  loadOrderSummary() {
    if (!window.cart) return

    const orderItems = document.getElementById("order-items")
    const summaryTotals = document.getElementById("summary-totals")

    if (orderItems) {
      const cartItems = window.cart.getItems()
      orderItems.innerHTML = cartItems
        .map(
          (item) => `
        <div class="order-item">
          <div class="item-image-small">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="item-details-small">
            <div class="item-name-small">${item.name}</div>
            ${
              Object.keys(item.options).length > 0
                ? `
              <div class="item-options-small">
                ${Object.entries(item.options)
                  .map(([key, value]) => (value ? `${key}: ${value}` : ""))
                  .filter(Boolean)
                  .join(", ")}
              </div>
            `
                : ""
            }
            <div class="item-quantity-small">Qty: ${item.quantity}</div>
          </div>
          <div class="item-price-small">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `,
        )
        .join("")
    }

    if (summaryTotals) {
      const subtotal = window.cart.getSubtotal()
      const discount = window.cart.getDiscount()
      const tax = window.cart.getTax()
      const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || "standard"
      const shipping = this.shippingRates[shippingMethod] || 0
      const total = subtotal - discount + tax + shipping

      summaryTotals.innerHTML = `
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${
          discount > 0
            ? `
          <div class="summary-row">
            <span>Discount:</span>
            <span>-$${discount.toFixed(2)}</span>
          </div>
        `
            : ""
        }
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div class="summary-row">
          <span>Tax:</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      `
    }
  }

  // Populate order review
  populateOrderReview() {
    const orderReview = document.getElementById("order-review")
    if (!orderReview) return

    const formData = this.getFormData()
    const shippingMethod = document.querySelector('input[name="shipping"]:checked')
    const paymentMethod = document.querySelector('input[name="payment"]:checked')

    orderReview.innerHTML = `
      <div class="review-section">
        <h4>Contact Information <a href="#" class="edit-link" onclick="window.checkoutPage.goToStep(1)">Edit</a></h4>
        <div class="review-info">
          <p><strong>Email:</strong> ${formData.email || "Not provided"}</p>
          <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
        </div>
      </div>
      
      <div class="review-section">
        <h4>Billing Address <a href="#" class="edit-link" onclick="window.checkoutPage.goToStep(1)">Edit</a></h4>
        <div class="review-info">
          <p>${formData.firstName} ${formData.lastName}</p>
          <p>${formData.address}</p>
          ${formData.apartment ? `<p>${formData.apartment}</p>` : ""}
          <p>${formData.city}, ${formData.state} ${formData.zipCode}</p>
        </div>
      </div>
      
      <div class="review-section">
        <h4>Shipping Method <a href="#" class="edit-link" onclick="window.checkoutPage.goToStep(2)">Edit</a></h4>
        <div class="review-info">
          <p><strong>${shippingMethod?.nextElementSibling.querySelector(".shipping-name")?.textContent}</strong></p>
          <p>${shippingMethod?.nextElementSibling.querySelector(".shipping-time")?.textContent}</p>
        </div>
      </div>
      
      <div class="review-section">
        <h4>Payment Method <a href="#" class="edit-link" onclick="window.checkoutPage.goToStep(3)">Edit</a></h4>
        <div class="review-info">
          <p><strong>${paymentMethod?.nextElementSibling.textContent.trim()}</strong></p>
          ${
            paymentMethod?.value === "credit-card"
              ? `
            <p>Card ending in ${formData.cardNumber?.slice(-4) || "****"}</p>
          `
              : ""
          }
        </div>
      </div>
    `
  }

  // Go to specific step
  goToStep(step) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step
      this.updateStepDisplay()
    }
  }

  // Get form data
  getFormData() {
    const form = document.getElementById("checkout-form")
    if (!form) return {}

    const formData = new FormData(form)
    const data = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    return data
  }

  // Save form data
  saveFormData() {
    try {
      const data = this.getFormData()
      localStorage.setItem("nexus_checkout_data", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }

  // Load saved data
  loadSavedData() {
    try {
      const saved = localStorage.getItem("nexus_checkout_data")
      if (saved) {
        const data = JSON.parse(saved)

        // Populate form fields
        Object.entries(data).forEach(([key, value]) => {
          const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`)
          if (field) {
            if (field.type === "checkbox" || field.type === "radio") {
              field.checked = field.value === value
            } else {
              field.value = value
            }
          }
        })
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    }
  }

  // Handle form submission
  async handleSubmit(e) {
    e.preventDefault()

    if (!this.validateCurrentStep()) {
      return
    }

    this.showLoading(true)

    try {
      // Prepare order data
      const orderData = this.prepareOrderData()

      // Simulate API call
      await this.submitOrder(orderData)

      // Clear cart and saved data
      if (window.cart) {
        window.cart.clearCart()
      }
      localStorage.removeItem("nexus_checkout_data")

      // Redirect to success page
      window.location.href = `order-success.html?order=${orderData.orderId}`
    } catch (error) {
      console.error("Order submission error:", error)
      this.showNotification("There was an error processing your order. Please try again.", "error")
    } finally {
      this.showLoading(false)
    }
  }

  // Prepare order data
  prepareOrderData() {
    const formData = this.getFormData()
    const cartItems = window.cart ? window.cart.getItems() : []
    const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value

    return {
      orderId: this.generateOrderId(),
      customer: {
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
      billing: {
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      shipping: {
        method: shippingMethod,
        sameAsBilling: document.getElementById("same-as-billing")?.checked,
      },
      payment: {
        method: paymentMethod,
        cardLast4: paymentMethod === "credit-card" ? formData.cardNumber?.slice(-4) : null,
      },
      items: cartItems,
      totals: {
        subtotal: window.cart ? window.cart.getSubtotal() : 0,
        discount: window.cart ? window.cart.getDiscount() : 0,
        tax: window.cart ? window.cart.getTax() : 0,
        shipping: this.shippingRates[shippingMethod] || 0,
        total: this.calculateTotal(),
      },
      timestamp: new Date().toISOString(),
    }
  }

  // Calculate total
  calculateTotal() {
    if (!window.cart) return 0

    const subtotal = window.cart.getSubtotal()
    const discount = window.cart.getDiscount()
    const tax = window.cart.getTax()
    const shippingMethod = document.querySelector('input[name="shipping"]:checked')?.value || "standard"
    const shipping = this.shippingRates[shippingMethod] || 0

    return subtotal - discount + tax + shipping
  }

  // Generate order ID
  generateOrderId() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `NX${timestamp}${random}`
  }

  // Submit order (simulate API call)
  async submitOrder(orderData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure
        if (Math.random() > 0.1) {
          // 90% success rate
          resolve({ success: true, orderId: orderData.orderId })
        } else {
          reject(new Error("Payment processing failed"))
        }
      }, 2000)
    })
  }

  // Show/hide loading
  showLoading(show) {
    const overlay = document.getElementById("loading-overlay")
    if (overlay) {
      overlay.classList.toggle("active", show)
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
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.checkoutPage = new CheckoutPage()
})

// Add CSS for field errors
const errorStyles = document.createElement("style")
errorStyles.textContent = `
  .form-group input.error,
  .form-group select.error {
    border-color: var(--danger-color);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  
  .field-error {
    color: var(--danger-color);
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
`
document.head.appendChild(errorStyles)
