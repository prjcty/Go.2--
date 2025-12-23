// User Data Storage
let userData = {
  email: "",
  balance: 0,
  totalInvested: 0,
  totalEarnings: 0,
  joinDate: "",
  referralCode: "",
  referrals: 0,
  investments: [],
  earnings: [],
  withdrawals: [],
  dailyTasksCompleted: [],
}

// Initialize on page load
window.addEventListener("load", () => {
  const savedData = localStorage.getItem("wagoUserData")
  if (savedData) {
    userData = JSON.parse(savedData)
  }

  // If user is not logged in, show only auth modal and hide main content
  if (!userData.email) {
    document.getElementById("mainContainer").style.display = "none"
    document.querySelector(".bottom-nav").style.display = "none"
    document.querySelector(".header").style.display = "none"
    openAuthModal()
  } else {
    // User is logged in, show main content
    document.getElementById("mainContainer").style.display = "block"
    document.querySelector(".bottom-nav").style.display = "flex"
    document.querySelector(".header").style.display = "block"
    showPage("home")
    updateAllUI()
  }
})

// Save user data to localStorage
function saveUserData() {
  localStorage.setItem("wagoUserData", JSON.stringify(userData))
  updateAllUI()
}

// Page Navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })

  // Show selected page
  document.getElementById(`page-${pageName}`).classList.add("active")

  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target?.classList.add("active")

  // Update page content based on type
  if (pageName === "home") {
    updateDashboard()
  } else if (pageName === "earnings") {
    updateEarningsPage()
  } else if (pageName === "task") {
    updateTasksPage()
  } else if (pageName === "share") {
    updateSharePage()
  } else if (pageName === "withdraw") {
    updateWithdrawPage()
  } else if (pageName === "account") {
    updateAccountPage()
  }
}

// Auth Functions
function openAuthModal() {
  document.getElementById("authModal").classList.add("active")
  document.getElementById("emailAuthForm").style.display = "block"
  document.getElementById("signupForm").style.display = "none"
}

function closeAuthModal() {
  document.getElementById("authModal").classList.remove("active")
}

function toggleAuthMode() {
  document.getElementById("emailAuthForm").style.display =
    document.getElementById("emailAuthForm").style.display === "none" ? "block" : "none"
  document.getElementById("signupForm").style.display =
    document.getElementById("signupForm").style.display === "none" ? "block" : "none"
}

function handleGmailLogin() {
  const email = prompt("Enter your Gmail address:")
  if (email && email.includes("@gmail.com")) {
    loginUser(email)
  } else if (email) {
    showAuthMessage("Please enter a valid Gmail address", "error")
  }
}

function handleEmailAuth() {
  const email = document.getElementById("authEmail").value
  const password = document.getElementById("authPassword").value

  if (email && password.length >= 6) {
    loginUser(email)
  } else {
    showAuthMessage("Email and password (min 6 chars) required", "error")
  }
}

function handleSignup() {
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value

  if (email && password.length >= 6) {
    loginUser(email)
  } else {
    showAuthMessage("Email and password (min 6 chars) required", "error")
  }
}

function loginUser(email) {
  userData.email = email
  userData.joinDate = new Date().toLocaleDateString()
  userData.referralCode = generateReferralCode()
  userData.balance = 1000 // Starting bonus
  closeAuthModal()
  saveUserData()

  // Show main content after successful login
  document.getElementById("mainContainer").style.display = "block"
  document.querySelector(".bottom-nav").style.display = "flex"
  document.querySelector(".header").style.display = "block"

  showSuccessAlert("Welcome to WAGO! 🎉")
  showPage("home")
}

function generateReferralCode() {
  return "WAGO" + Math.random().toString(36).substr(2, 8).toUpperCase()
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    userData = {
      email: "",
      balance: 0,
      totalInvested: 0,
      totalEarnings: 0,
      joinDate: "",
      referralCode: "",
      referrals: 0,
      investments: [],
      earnings: [],
      withdrawals: [],
      dailyTasksCompleted: [],
    }
    localStorage.removeItem("wagoUserData")

    // Hide main content and show login modal
    document.getElementById("mainContainer").style.display = "none"
    document.querySelector(".bottom-nav").style.display = "none"
    document.querySelector(".header").style.display = "none"

    openAuthModal()
    showSuccessAlert("Logged out successfully")
  }
}

// Account Menu
function toggleAccountMenu() {
  document.getElementById("accountMenu").classList.toggle("active")
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".user-btn") && !e.target.closest(".account-menu")) {
    document.getElementById("accountMenu").classList.remove("active")
  }
})

// Invest Modal
function openInvestModal(productName, price, dailyReturn) {
  document.getElementById("investProductName").textContent = productName
  document.getElementById("investUnitPrice").textContent = price
  document.getElementById("investDailyReturn").textContent = dailyReturn.toFixed(2)
  document.getElementById("investQuantity").value = 1
  document.getElementById("investModal").classList.add("active")
  updateInvestmentCalculation(price, dailyReturn)
}

function closeInvestModal() {
  document.getElementById("investModal").classList.remove("active")
}

function updateInvestmentCalculation(price, dailyReturn) {
  const quantity = Number.parseInt(document.getElementById("investQuantity").value) || 1
  document.getElementById("totalInvestment").textContent = (price * quantity).toFixed(2)
  document.getElementById("dailyEarnings").textContent = (dailyReturn * quantity).toFixed(2)
}

document.addEventListener("input", (e) => {
  if (e.target.id === "investQuantity") {
    const price = Number.parseFloat(document.getElementById("investUnitPrice").textContent)
    const dailyReturn = Number.parseFloat(document.getElementById("investDailyReturn").textContent)
    updateInvestmentCalculation(price, dailyReturn)
  }
})

function confirmInvestment() {
  const productName = document.getElementById("investProductName").textContent
  const quantity = Number.parseInt(document.getElementById("investQuantity").value)
  const totalInvestment = Number.parseFloat(document.getElementById("totalInvestment").textContent)
  const dailyEarnings = Number.parseFloat(document.getElementById("dailyEarnings").textContent)

  if (userData.balance < totalInvestment) {
    showAuthMessage("Insufficient balance!", "error")
    return
  }

  userData.balance -= totalInvestment
  userData.totalInvested += totalInvestment

  const investment = {
    id: Date.now(),
    name: productName,
    amount: totalInvestment,
    dailyEarnings: dailyEarnings,
    date: new Date().toLocaleDateString(),
    daysRemaining: 100,
  }

  userData.investments.push(investment)
  closeInvestModal()
  saveUserData()
  showSuccessAlert(`Successfully invested Rs ${totalInvestment.toFixed(2)} in ${productName}! 🚀`)
}

// Earnings Functions
function updateDashboard() {
  document.getElementById("welcomeUser").textContent = `Welcome back, ${userData.email}!`
  document.getElementById("balanceDisplay").textContent = `Balance: Rs ${userData.balance.toFixed(2)}`
}

function updateEarningsPage() {
  // Calculate today's earnings
  const todayEarnings = userData.investments.reduce((sum, inv) => sum + inv.dailyEarnings, 0)
  document.getElementById("todayEarnings").textContent = `Rs ${todayEarnings.toFixed(2)}`
  document.getElementById("totalDeposits").textContent = `Rs ${userData.totalInvested.toFixed(2)}`

  const totalIncome = userData.earnings.reduce((sum, e) => sum + e.amount, 0)
  document.getElementById("totalIncome").textContent = `Rs ${totalIncome.toFixed(2)}`

  // Show earning history
  const historyDiv = document.getElementById("earningsHistory")
  if (userData.earnings.length > 0) {
    historyDiv.innerHTML = userData.earnings
      .map(
        (earning) => `
            <div class="history-item">
                <div class="history-item-info">
                    <h4>${earning.type}</h4>
                    <p>${earning.date}</p>
                </div>
                <div class="history-item-amount">+Rs ${earning.amount.toFixed(2)}</div>
            </div>
        `,
      )
      .join("")
  } else {
    historyDiv.innerHTML = '<p class="empty-message">No earnings yet. Start investing!</p>'
  }
}

// Tasks Functions
function updateTasksPage() {
  // Simulate task progress based on referrals
  const task1Percent = Math.min((userData.referrals / 3) * 100, 100)
  const task2Percent = Math.min((userData.referrals / 12) * 100, 100)
  const task3Percent = Math.min((userData.referrals / 30) * 100, 100)

  document.getElementById("task1Progress").style.width = task1Percent + "%"
  document.getElementById("task2Progress").style.width = task2Percent + "%"
  document.getElementById("task3Progress").style.width = task3Percent + "%"
}

function completeTask(taskId, taskType) {
  const today = new Date().toDateString()
  const taskKey = `task-${taskId}-${today}`

  if (userData.dailyTasksCompleted.includes(taskKey)) {
    showAuthMessage("Already completed today!", "error")
    return
  }

  userData.dailyTasksCompleted.push(taskKey)

  let reward = 0
  if (taskId === 1) reward = 50
  else if (taskId === 2) reward = 100
  else if (taskId === 3) reward = 200

  userData.balance += reward
  userData.earnings.push({
    type: `Task Reward (Task ${taskId})`,
    amount: reward,
    date: new Date().toLocaleDateString(),
  })

  saveUserData()
  showSuccessAlert(`Task completed! You earned Rs ${reward} 🎁`)
  updateTasksPage()
}

// Share/Referral Functions
function updateSharePage() {
  userData.referralCode = userData.referralCode || generateReferralCode()
  document.getElementById("referralCode").value = userData.referralCode
  document.getElementById("referralLink").value = `https://wago-n.icu/login?ref=${userData.referralCode}`
  saveUserData()
}

function copyReferralCode() {
  const code = document.getElementById("referralCode").value
  navigator.clipboard.writeText(code)
  showSuccessAlert("Referral code copied! 📋")
}

function copyReferralLink() {
  const link = document.getElementById("referralLink").value
  navigator.clipboard.writeText(link)
  showSuccessAlert("Referral link copied! 📋")
}

function downloadQR() {
  const canvas = document.querySelector(".qr-code svg")
  const svgData = new XMLSerializer().serializeToString(canvas)
  const link = document.createElement("a")
  link.href = "data:image/svg+xml;base64," + btoa(svgData)
  link.download = "wago-qr-code.svg"
  link.click()
  showSuccessAlert("QR Code downloaded! 📥")
}

// Withdraw Functions
function updateWithdrawPage() {
  document.getElementById("withdrawBalance").textContent = `Rs ${userData.balance.toFixed(2)}`

  const historyDiv = document.getElementById("withdrawalHistoryList")
  if (userData.withdrawals.length > 0) {
    historyDiv.innerHTML = userData.withdrawals
      .map(
        (withdrawal) => `
            <div class="history-item">
                <div class="history-item-info">
                    <h4>Withdrawal Request</h4>
                    <p>${withdrawal.date}</p>
                </div>
                <div class="history-item-amount">-Rs ${withdrawal.amount.toFixed(2)}</div>
            </div>
        `,
      )
      .join("")
  } else {
    historyDiv.innerHTML = '<p class="empty-message">No withdrawals yet</p>'
  }
}

function handleWithdraw(event) {
  event.preventDefault()

  const amount = Number.parseFloat(document.getElementById("withdrawAmount").value)
  const bank = document.getElementById("withdrawBank").value
  const accountHolder = document.getElementById("withdrawBank2").value
  const ifsc = document.getElementById("withdrawBank3").value

  if (amount > userData.balance) {
    showAuthMessage("Insufficient balance!", "error")
    return
  }

  if (amount < 100) {
    showAuthMessage("Minimum withdrawal is Rs 100", "error")
    return
  }

  userData.balance -= amount
  userData.withdrawals.push({
    amount: amount,
    bank: bank,
    accountHolder: accountHolder,
    ifsc: ifsc,
    date: new Date().toLocaleDateString(),
    status: "Processing",
  })

  document.querySelector(".withdraw-form").reset()
  saveUserData()
  showSuccessAlert(`Withdrawal request of Rs ${amount} submitted! 💳`)
  updateWithdrawPage()
}

// Account Page
function updateAccountPage() {
  document.getElementById("accountEmail").textContent = userData.email
  document.getElementById("accountBalance").textContent = `Rs ${userData.balance.toFixed(2)}`
  document.getElementById("accountTotalInvested").textContent = `Rs ${userData.totalInvested.toFixed(2)}`

  const totalEarnings = userData.earnings.reduce((sum, e) => sum + e.amount, 0)
  document.getElementById("accountTotalEarnings").textContent = `Rs ${totalEarnings.toFixed(2)}`
  document.getElementById("accountJoinDate").textContent = userData.joinDate
  document.getElementById("accountReferrals").textContent = userData.referrals
}

// Update all UI elements
function updateAllUI() {
  document.getElementById("balanceDisplay").textContent = `Balance: Rs ${userData.balance.toFixed(2)}`
  updateDashboard()
}

// Helper Functions
function showAuthMessage(message, type) {
  const messageDiv = document.getElementById("authMessage")
  messageDiv.textContent = message
  messageDiv.className = `auth-message ${type}`
  setTimeout(() => {
    messageDiv.className = "auth-message"
  }, 3000)
}

function showSuccessAlert(message) {
  const alertDiv = document.getElementById("successMessage")
  document.getElementById("successText").textContent = message
  alertDiv.classList.add("show")
  setTimeout(() => {
    alertDiv.classList.remove("show")
  }, 3000)
}

// Close modals on outside click
window.addEventListener("click", (event) => {
  const investModal = document.getElementById("investModal")
  const authModal = document.getElementById("authModal")

  if (event.target === investModal) {
    closeInvestModal()
  }
  if (event.target === authModal && userData.email) {
    closeAuthModal()
  }
})
