// Product Data and API Simulation
class ProductData {
  constructor() {
    this.products = [
      {
        id: 1,
        name: "Quantum Wireless Headphones",
        category: "electronics",
        brand: "nexus",
        price: 299.99,
        originalPrice: 399.99,
        discount: 25,
        rating: 4.8,
        reviews: 1247,
        image: "https://i.pinimg.com/736x/b6/dc/b2/b6dcb270eae6458889dc4f9b3d35cb56.jpg",
        images: [
          "https://i.pinimg.com/736x/b6/dc/b2/b6dcb270eae6458889dc4f9b3d35cb56.jpg",
          "https://i.pinimg.com/1200x/33/2c/ce/332cce4ccbcc74ac8e8b62abe28f04b6.jpg",
          "https://i.pinimg.com/736x/1c/b1/df/1cb1df9ee74bed178f91f245180fa978.jpg",
          "https://i.pinimg.com/736x/26/ce/0b/26ce0bc4f6cc2d6c59da0b8c2ddf684e.jpg",
        ],
        badge: "sale",
        description:
          "Experience premium audio quality with our latest quantum wireless headphones featuring advanced noise cancellation and 30-hour battery life.",
        detailedDescription: `
          <h3>Revolutionary Audio Experience</h3>
          <p>The Quantum Wireless Headphones represent the pinnacle of audio engineering, combining cutting-edge technology with premium materials to deliver an unparalleled listening experience.</p>
          
          <h3>Advanced Features</h3>
          <ul>
            <li>Quantum Audio Processing for crystal-clear sound</li>
            <li>Active Noise Cancellation with 99% noise reduction</li>
            <li>30-hour battery life with quick charge technology</li>
            <li>Premium leather ear cushions for maximum comfort</li>
            <li>Bluetooth 5.2 with multi-device connectivity</li>
          </ul>
          
          <h3>Perfect for Every Occasion</h3>
          <p>Whether you're commuting, working out, or relaxing at home, these headphones adapt to your lifestyle with intelligent sound optimization and comfortable ergonomic design.</p>
        `,
        specifications: {
          Audio: {
            "Driver Size": "50mm Dynamic",
            "Frequency Response": "20Hz - 40kHz",
            Impedance: "32 Ohms",
            Sensitivity: "110dB SPL",
          },
          Connectivity: {
            "Bluetooth Version": "5.2",
            Codecs: "SBC, AAC, aptX HD",
            Range: "30 meters",
            "Multi-device": "Yes (2 devices)",
          },
          Battery: {
            Playtime: "30 hours (ANC off)",
            "Playtime (ANC)": "25 hours",
            "Charging Time": "2 hours",
            "Quick Charge": "15 min = 3 hours",
          },
          Physical: {
            Weight: "280g",
            Dimensions: "190 x 165 x 85mm",
            Foldable: "Yes",
            "Cable Length": "1.2m",
          },
        },
        colors: ["black", "white", "blue", "red"],
        sizes: [],
        inStock: true,
        featured: true,
        new: false,
      },
      {
        id: 2,
        name: "Neural Smartwatch Pro",
        category: "electronics",
        brand: "neural",
        price: 599.99,
        originalPrice: null,
        discount: 0,
        rating: 4.9,
        reviews: 892,
        image: "https://i.pinimg.com/736x/a5/6c/53/a56c53a723d5f7d2a17d3e20104df65b.jpg",
        images: [
          "https://i.pinimg.com/736x/a5/6c/53/a56c53a723d5f7d2a17d3e20104df65b.jpg",
          "https://i.pinimg.com/1200x/8a/56/84/8a5684df6a18bbf81b15de0c680a97cd.jpg",
          "https://i.pinimg.com/736x/df/9a/e3/df9ae3f08a517544c0b1e75b3413a328.jpg",
          "https://i.pinimg.com/1200x/a6/9c/ac/a69cac452c5794a5faeaa407fb3792d6.jpg",
          "https://i.pinimg.com/736x/d1/dd/44/d1dd445f8ce9ed4c31ae6658cd569c9f.jpg",
        ],
        badge: "new",
        description: "The most advanced smartwatch with AI health monitoring, GPS tracking, and 7-day battery life.",
        detailedDescription: `
          <h3>Next-Generation Health Monitoring</h3>
          <p>The Neural Smartwatch Pro uses advanced AI algorithms to monitor your health 24/7, providing insights that help you live a healthier life.</p>
          
          <h3>Key Features</h3>
          <ul>
            <li>AI-powered health analysis and recommendations</li>
            <li>Advanced GPS with multi-satellite support</li>
            <li>7-day battery life with solar charging</li>
            <li>Water resistant up to 100 meters</li>
            <li>ECG and blood oxygen monitoring</li>
          </ul>
        `,
        specifications: {
          Display: {
            Size: "1.4 inches",
            Resolution: "454 x 454",
            Type: "AMOLED",
            Brightness: "1000 nits",
          },
          Health: {
            "Heart Rate": "24/7 monitoring",
            "Blood Oxygen": "SpO2 sensor",
            ECG: "Medical grade",
            "Sleep Tracking": "Advanced REM analysis",
          },
          Connectivity: {
            GPS: "Multi-satellite",
            Bluetooth: "5.0",
            WiFi: "802.11 b/g/n",
            NFC: "Yes",
          },
          Battery: {
            Life: "7 days typical use",
            Charging: "Wireless + Solar",
            "Quick Charge": "1 hour = 1 day",
          },
        },
        colors: ["black", "silver", "gold"],
        sizes: ["42mm", "46mm"],
        inStock: true,
        featured: true,
        new: true,
      },
      {
        id: 3,
        name: "Holographic Display Monitor",
        category: "electronics",
        brand: "quantum",
        price: 1299.99,
        originalPrice: 1599.99,
        discount: 19,
        rating: 4.7,
        reviews: 456,
        image: "https://i.pinimg.com/736x/e7/ee/01/e7ee017be7ed5ae10fdef0bf3753524a.jpg",
        images:
         [
          "https://i.pinimg.com/736x/e7/ee/01/e7ee017be7ed5ae10fdef0bf3753524a.jpg",
          "/placeholder.svg?height=600&width=600", 
          "/placeholder.svg?height=600&width=600"
        ],
        badge: "sale",
        description:
          "Revolutionary 32-inch 4K holographic display with 3D visualization capabilities for professional and gaming use.",
        detailedDescription: `
          <h3>The Future of Display Technology</h3>
          <p>Experience the next evolution in display technology with our holographic monitor that brings content to life in stunning 3D detail.</p>
        `,
        specifications: {
          Display: {
            Size: "32 inches",
            Resolution: "3840 x 2160 (4K)",
            "Refresh Rate": "144Hz",
            "Response Time": "1ms",
          },
        },
        colors: ["black"],
        sizes: [],
        inStock: true,
        featured: true,
        new: false,
      },
      {
        id: 4,
        name: "Premium Cotton T-Shirt",
        category: "fashion",
        brand: "nexus",
        price: 49.99,
        originalPrice: null,
        discount: 0,
        rating: 4.5,
        reviews: 234,
        image: "https://i.pinimg.com/1200x/98/0a/f8/980af8f08fceb1ea49be0467fdfa4adb.jpg",
        images: [
          "https://i.pinimg.com/736x/a7/e9/0d/a7e90dd949514229dc04291d21ad2d40.jpg",
          "https://i.pinimg.com/1200x/98/0a/f8/980af8f08fceb1ea49be0467fdfa4adb.jpg",
          "https://i.pinimg.com/736x/6c/72/64/6c7264feb00ad1b90ea85721bff9f1dc.jpg",
          "https://i.pinimg.com/736x/90/98/a6/9098a64629a9778014d48f58752140e3.jpg",
          "https://i.pinimg.com/1200x/a3/51/86/a35186f251fbc557ba6a95faae024e03.jpg",
        ],
        badge: null,
        description: "Soft, comfortable premium cotton t-shirt perfect for everyday wear.",
        detailedDescription: `
          <h3>Premium Quality Cotton</h3>
          <p>Made from 100% organic cotton, this t-shirt offers exceptional comfort and durability.</p>
        `,
        specifications: {
          Material: {
            Fabric: "100% Organic Cotton",
            Weight: "180 GSM",
            Care: "Machine washable",
          },
        },
        colors: ["white", "black", "gray", "navy", "red"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        inStock: true,
        featured: false,
        new: false,
      },
      {
        id: 5,
        name: "Smart Home Hub",
        category: "home",
        brand: "neural",
        price: 199.99,
        originalPrice: 249.99,
        discount: 20,
        rating: 4.6,
        reviews: 678,
        image: "https://i.pinimg.com/736x/d6/a8/21/d6a821d70760ee4f7f75aa15e4047a5c.jpg",
        images: 
          [
          "https://i.pinimg.com/736x/d6/a8/21/d6a821d70760ee4f7f75aa15e4047a5c.jpg",
          "https://i.pinimg.com/736x/5c/4f/50/5c4f50e69016634a974b963f194c7406.jpg",
          "https://i.pinimg.com/736x/a2/ee/76/a2ee76056fd475ddd55b5e6de5d270eb.jpg",
          "https://i.pinimg.com/736x/bb/13/90/bb1390a3aa49a00f645c579b20f3f9fe.jpg"
          ],

        badge: "sale",
        description: "Central control hub for all your smart home devices with voice control and AI automation.",
        detailedDescription: `
          <h3>Complete Home Automation</h3>
          <p>Transform your home into a smart home with our advanced hub that connects and controls all your devices.</p>
        `,
        specifications: {
          Connectivity: {
            WiFi: "802.11ac",
            Bluetooth: "5.0",
            Zigbee: "3.0",
            "Z-Wave": "Plus",
          },
        },
        colors: ["white", "black"],
        sizes: [],
        inStock: true,
        featured: false,
        new: false,
      },
      {
        id: 6,
        name: "Fitness Tracker Band",
        category: "sports",
        brand: "quantum",
        price: 129.99,
        originalPrice: null,
        discount: 0,
        rating: 4.4,
        reviews: 567,
        image: "https://i.pinimg.com/736x/f9/a4/2f/f9a42f04d2cb9f5102ae4495d915e03c.jpg",
        images: 
        [
          "https://i.pinimg.com/736x/f9/a4/2f/f9a42f04d2cb9f5102ae4495d915e03c.jpg",
          "https://i.pinimg.com/736x/94/0b/fd/940bfdb47fddf9ac9e2b88b86a2058e4.jpg"
        ],
        badge: null,
        description: "Advanced fitness tracker with heart rate monitoring, GPS, and 14-day battery life.",
        detailedDescription: `
          <h3>Track Your Fitness Journey</h3>
          <p>Monitor your health and fitness goals with precision tracking and detailed analytics.</p>
        `,
        specifications: {
          Sensors: {
            "Heart Rate": "Optical sensor",
            GPS: "Built-in",
            Accelerometer: "3-axis",
            Gyroscope: "3-axis",
          },
        },
        colors: ["black", "blue", "pink", "green"],
        sizes: ["S", "M", "L"],
        inStock: true,
        featured: false,
        new: false,
      },
    ]

    this.reviews = {
      1: [
        {
          id: 1,
          user: "John D.",
          rating: 5,
          date: "2024-01-15",
          title: "Amazing sound quality!",
          content:
            "These headphones exceeded my expectations. The noise cancellation is incredible and the battery life is exactly as advertised. Highly recommend!",
          helpful: 24,
        },
        {
          id: 2,
          user: "Sarah M.",
          rating: 4,
          date: "2024-01-10",
          title: "Great for travel",
          content:
            "Perfect for long flights. Comfortable to wear for hours and the sound quality is excellent. Only minor complaint is they're a bit heavy.",
          helpful: 18,
        },
        {
          id: 3,
          user: "Mike R.",
          rating: 5,
          date: "2024-01-05",
          title: "Best purchase this year",
          content:
            "I've tried many headphones and these are by far the best. The quantum audio processing really makes a difference. Worth every penny!",
          helpful: 31,
        },
      ],
      2: [
        {
          id: 4,
          user: "Lisa K.",
          rating: 5,
          date: "2024-01-20",
          title: "Life-changing health insights",
          content:
            "The AI health monitoring has helped me understand my body better. The sleep tracking is incredibly detailed and accurate.",
          helpful: 42,
        },
        {
          id: 5,
          user: "David L.",
          rating: 4,
          date: "2024-01-18",
          title: "Excellent smartwatch",
          content:
            "Great features and battery life. The GPS is very accurate for running. Only wish it had more third-party app support.",
          helpful: 15,
        },
      ],
    }

    this.categories = [
      { id: "electronics", name: "Electronics", count: 15000 },
      { id: "fashion", name: "Fashion", count: 25000 },
      { id: "home", name: "Home & Living", count: 8000 },
      { id: "sports", name: "Sports & Fitness", count: 5000 },
      { id: "books", name: "Books & Media", count: 12000 },
      { id: "gaming", name: "Gaming", count: 3000 },
    ]

    this.brands = [
      { id: "nexus", name: "Nexus", count: 234 },
      { id: "quantum", name: "Quantum", count: 156 },
      { id: "neural", name: "Neural", count: 89 },
    ]
  }

  // Get all products
  getAllProducts() {
    return this.products
  }

  // Get featured products
  getFeaturedProducts(limit = 6) {
    return this.products.filter((product) => product.featured).slice(0, limit)
  }

  // Get product by ID
  getProductById(id) {
    return this.products.find((product) => product.id === Number.parseInt(id))
  }

  // Get products by category
  getProductsByCategory(category, limit = null) {
    const filtered = this.products.filter((product) => product.category === category)
    return limit ? filtered.slice(0, limit) : filtered
  }

  // Search products
  searchProducts(query) {
    const searchTerm = query.toLowerCase()
    return this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm),
    )
  }

  // Filter products
  filterProducts(filters) {
    let filtered = [...this.products]

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((product) => filters.categories.includes(product.category))
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter((product) => filters.brands.includes(product.brand))
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter((product) => {
        const price = product.price
        const minPrice = filters.minPrice || 0
        const maxPrice = filters.maxPrice || Number.POSITIVE_INFINITY
        return price >= minPrice && price <= maxPrice
      })
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter((product) => product.rating >= filters.minRating)
    }

    return filtered
  }

  // Sort products
  sortProducts(products, sortBy) {
    const sorted = [...products]

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "newest":
        return sorted.sort((a, b) => b.new - a.new)
      case "featured":
      default:
        return sorted.sort((a, b) => b.featured - a.featured)
    }
  }

  // Get product reviews
  getProductReviews(productId) {
    return this.reviews[productId] || []
  }

  // Get related products
  getRelatedProducts(productId, limit = 4) {
    const product = this.getProductById(productId)
    if (!product) return []

    return this.products.filter((p) => p.id !== productId && p.category === product.category).slice(0, limit)
  }

  // Get categories
  getCategories() {
    return this.categories
  }

  // Get brands
  getBrands() {
    return this.brands
  }

  // Simulate API delay
  async simulateApiCall(data, delay = 500) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay)
    })
  }

  // Get products with pagination
  async getProductsPaginated(page = 1, limit = 24, filters = {}, sortBy = "featured") {
    let products = this.getAllProducts()

    // Apply filters
    products = this.filterProducts(filters)

    // Apply sorting
    products = this.sortProducts(products, sortBy)

    // Calculate pagination
    const total = products.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = products.slice(startIndex, endIndex)

    return this.simulateApiCall({
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  }
}

// Create global instance
window.productData = new ProductData()

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ProductData
}
