const toggleBtn = document.getElementById("darkModeToggle");
const htmlElement = document.documentElement;
const form = document.getElementById("paymentForm");
const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantity");
const promoInput = document.getElementById("promoCode");
const applyPromoBtn = document.getElementById("applyPromoBtn");
const promoMessage = document.getElementById("promoMessage");
const subtotalEl = document.getElementById("subtotal");
const discountRow = document.getElementById("discountRow");
const discountEl = document.getElementById("discount");
const totalAmountEl = document.getElementById("totalAmount");
const modal = document.getElementById("paymentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const paymentDetails = document.getElementById("paymentDetails");
const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const totalTransactionsEl = document.getElementById("totalTransactions");
const totalRevenueEl = document.getElementById("totalRevenue");
const avgTransactionEl = document.getElementById("avgTransaction");

let promoDiscount = 0;
const PROMO_CODES = {
  "PROMO10": 0.1,
  "PROMO20": 0.2
};

// Toggle dark mode
toggleBtn.addEventListener("click", () => {
  htmlElement.classList.toggle("dark");
});

// Update Total
function updateTotal() {
  const product = productSelect.options[productSelect.selectedIndex];
  const price = parseInt(product.dataset.price || 0);
  const qty = parseInt(quantityInput.value || 1);
  const subtotal = price * qty;
  const discount = subtotal * promoDiscount;
  const total = subtotal - discount;

  subtotalEl.textContent = `Rp ${subtotal.toLocaleString()}`;
  discountEl.textContent = `Rp ${discount.toLocaleString()}`;
  totalAmountEl.textContent = `Rp ${total.toLocaleString()}`;

  discountRow.classList.toggle("hidden", promoDiscount === 0);

  return { subtotal, discount, total };
}

productSelect.addEventListener("change", updateTotal);
quantityInput.addEventListener("input", updateTotal);

applyPromoBtn.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  if (PROMO_CODES[code]) {
    promoDiscount = PROMO_CODES[code];
    promoMessage.className = "mt-2 text-sm text-green-600";
    promoMessage.textContent = `Kode promo berhasil diterapkan! (-${promoDiscount * 100}%)`;
  } else {
    promoDiscount = 0;
    promoMessage.className = "mt-2 text-sm text-red-600";
    promoMessage.textContent = "Kode promo tidak valid.";
  }
  promoMessage.classList.remove("hidden");
  updateTotal();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.customerName.value;
  const email = form.customerEmail.value;
  const productText = productSelect.options[productSelect.selectedIndex].text;
  const paymentMethod = form.paymentMethod.value;
  const qty = parseInt(quantityInput.value);
  const { total } = updateTotal();
  const timestamp = new Date().toLocaleString();

  const transaction = { name, email, productText, qty, paymentMethod, total, timestamp };

  saveTransaction(transaction);
  renderTransactions();
  showConfirmation(transaction);
  form.reset();
  promoDiscount = 0;
  promoMessage.classList.add("hidden");
  updateTotal();
});

function saveTransaction(data) {
  const list = JSON.parse(localStorage.getItem("transactions") || "[]");
  list.push(data);
  localStorage.setItem("transactions", JSON.stringify(list));
}

function renderTransactions() {
  const list = JSON.parse(localStorage.getItem("transactions") || "[]");
  transactionList.innerHTML = "";

  if (list.length === 0) {
    emptyState.classList.remove("hidden");
    clearHistoryBtn.classList.add("hidden");
    totalTransactionsEl.textContent = 0;
    totalRevenueEl.textContent = "Rp 0";
    avgTransactionEl.textContent = "Rp 0";
    return;
  }

  emptyState.classList.add("hidden");
  clearHistoryBtn.classList.remove("hidden");

  const template = document.getElementById("transactionTemplate");
  let totalRevenue = 0;

  list.slice().reverse().forEach(t => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".transaction-customer").textContent = t.name;
    clone.querySelector(".transaction-product").textContent = `${t.productText} x ${t.qty}`;
    clone.querySelector(".transaction-amount").textContent = `Rp ${t.total.toLocaleString()}`;
    clone.querySelector(".transaction-time").textContent = t.timestamp;
    clone.querySelector(".transaction-method").textContent = t.paymentMethod;
    transactionList.appendChild(clone);
    totalRevenue += t.total;
  });

  totalTransactionsEl.textContent = list.length;
  totalRevenueEl.textContent = `Rp ${totalRevenue.toLocaleString()}`;
  avgTransactionEl.textContent = `Rp ${(totalRevenue / list.length).toLocaleString()}`;
}

function showConfirmation(transaction) {
  paymentDetails.innerHTML = `
    <p><strong>Nama:</strong> ${transaction.name}</p>
    <p><strong>Email:</strong> ${transaction.email}</p>
    <p><strong>Produk:</strong> ${transaction.productText}</p>
    <p><strong>Jumlah:</strong> ${transaction.qty}</p>
    <p><strong>Metode Pembayaran:</strong> ${transaction.paymentMethod}</p>
    <p><strong>Total:</strong> Rp ${transaction.total.toLocaleString()}</p>
    <p><strong>Waktu:</strong> ${transaction.timestamp}</p>
  `;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("transactions");
  renderTransactions();
});

// Init on load
renderTransactions();
updateTotal();
