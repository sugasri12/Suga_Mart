/* =====================================================
   SUGA MART - FRONTEND JAVASCRIPT
   ===================================================== */

window.API_BASE = window.API_BASE || (function () {
    if (!window.location || !window.location.protocol || !window.location.protocol.startsWith("http")) {
        return "http://localhost:5000";
    }
    if (window.location.port === "5000" || window.location.port === "") {
        return "";
    }
    return `${window.location.protocol}//${window.location.hostname}:5000`;
})();
const API_BASE = window.API_BASE;

/* =====================================================
   COMMON FUNCTIONS
   ===================================================== */

function showMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;

    if (type === "error") {
        element.style.color = "#b00020";
    } else {
        element.style.color = "green";
    }
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}


function isValidPassword(password) {
    return password.length >= 6;
}


/* =====================================================
   LOCAL STORAGE FUNCTIONS
   ===================================================== */

function getCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem("sugaMartCart")
        );

        if (Array.isArray(savedCart)) {
            return savedCart;
        }

        localStorage.removeItem("sugaMartCart");
        return [];

    } catch (error) {

        localStorage.removeItem("sugaMartCart");
        return [];
    }
}


function saveCart(cart) {
    localStorage.setItem("sugaMartCart", JSON.stringify(cart));
}


function getOrders() {
    try {
        return JSON.parse(localStorage.getItem("sugaMartOrders")) || [];
    } catch (error) {
        return [];
    }
}


function saveOrders(orders) {
    localStorage.setItem("sugaMartOrders", JSON.stringify(orders));
}


/* =====================================================
   HOME PAGE
   ===================================================== */

const buyerLoginButton = document.getElementById("buyerLoginButton");
const sellerLoginButton = document.getElementById("sellerLoginButton");
const adminLoginButton = document.getElementById("adminLoginButton");

if (buyerLoginButton) {
    buyerLoginButton.onclick = function () {
        window.location.href = "buyer-login.html";
    };
}

if (sellerLoginButton) {
    sellerLoginButton.onclick = function () {
        window.location.href = "seller-login.html";
    };
}

if (adminLoginButton) {
    adminLoginButton.onclick = function () {
        window.location.href = "admin-login.html";
    };
}


/* =====================================================
   BUYER LOGIN
   ===================================================== */

const buyerLoginForm = document.getElementById("buyerLoginForm");

if (buyerLoginForm) {

    buyerLoginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("buyerEmail");
        const password = document.getElementById("buyerPassword");
        const message = document.getElementById("buyerLoginMessage");

        if (!email || !password) return;

        const emailValue = email.value.trim();
        const passwordValue = password.value;

        if (!isValidEmail(emailValue)) {
            showMessage(message, "Please enter a valid email address.", "error");
            return;
        }

        if (passwordValue === "") {
            showMessage(message, "Please enter your password.", "error");
            return;
        }

        showMessage(message, "Logging in...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailValue,
                    password: passwordValue,
                    expectedRole: "buyer"
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Invalid email or password.", "error");
                return;
            }

            localStorage.setItem("sugaMartRole", "buyer");
            localStorage.setItem("sugaMartEmail", data.user.email);
            localStorage.setItem("sugaMartUser", JSON.stringify(data.user));

            showMessage(message, "Login successful! Redirecting...", "success");

            setTimeout(function () {
                window.location.href = "buyer-dashboard.html";
            }, 800);

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   BUYER CREATE ACCOUNT
   ===================================================== */

const buyerCreateAccountForm =
    document.getElementById("buyerCreateAccountForm");

if (buyerCreateAccountForm) {

    buyerCreateAccountForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("buyerName");
        const email = document.getElementById("buyerEmail");
        const phone = document.getElementById("buyerPhone");
        const password = document.getElementById("buyerPassword");
        const confirmPassword =
            document.getElementById("buyerConfirmPassword");

        const message =
            document.getElementById("buyerCreateAccountMessage");

        if (!name || !email || !phone || !password || !confirmPassword) {
            return;
        }

        const nameVal = name.value.trim();
        const emailVal = email.value.trim();
        const phoneVal = phone.value.trim();
        const passVal = password.value;
        const confirmPassVal = confirmPassword.value;

        if (nameVal === "") {
            showMessage(message, "Please enter your name.", "error");
            return;
        }

        if (!isValidEmail(emailVal)) {
            showMessage(message, "Enter a valid email address.", "error");
            return;
        }

        if (!isValidPhone(phoneVal)) {
            showMessage(
                message,
                "Phone number must contain 10 digits.",
                "error"
            );
            return;
        }

        if (!isValidPassword(passVal)) {
            showMessage(
                message,
                "Password must contain at least 6 characters.",
                "error"
            );
            return;
        }

        if (passVal !== confirmPassVal) {
            showMessage(
                message,
                "Passwords do not match.",
                "error"
            );
            return;
        }

        showMessage(message, "Creating account...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "buyer",
                    name: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    password: passVal
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Could not create account.", "error");
                return;
            }

            showMessage(
                message,
                "Account created successfully! Redirecting to login...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "buyer-login.html";
            }, 1000);

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   BUYER FORGOT PASSWORD
   ===================================================== */

const buyerForgotPasswordForm =
    document.getElementById("buyerForgotPasswordForm");

if (buyerForgotPasswordForm) {

    buyerForgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("buyerForgotEmail");
        const message =
            document.getElementById("buyerForgotPasswordMessage");

        if (!email) return;

        const emailVal = email.value.trim();

        if (!isValidEmail(emailVal)) {
            showMessage(
                message,
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        showMessage(message, "Verifying email...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailVal })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "No registered account found with this email.", "error");
                return;
            }

            showMessage(
                message,
                data.message || "Password reset instructions sent successfully.",
                "success"
            );

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   SELLER LOGIN
   ===================================================== */

const sellerLoginForm = document.getElementById("sellerLoginForm");

if (sellerLoginForm) {

    sellerLoginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("sellerEmail");
        const password = document.getElementById("sellerPassword");
        const message =
            document.getElementById("sellerLoginMessage");

        if (!email || !password) return;

        const emailValue = email.value.trim();
        const passwordValue = password.value;

        if (!isValidEmail(emailValue)) {
            showMessage(message, "Please enter a valid email address.", "error");
            return;
        }

        if (passwordValue === "") {
            showMessage(message, "Please enter your password.", "error");
            return;
        }

        showMessage(message, "Logging in...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailValue,
                    password: passwordValue,
                    expectedRole: "seller"
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Invalid seller email or password.", "error");
                return;
            }

            localStorage.setItem("sugaMartRole", "seller");
            localStorage.setItem("sugaMartEmail", data.user.email);
            localStorage.setItem("sugaMartUser", JSON.stringify(data.user));

            showMessage(message, "Login successful! Redirecting...", "success");

            setTimeout(function () {
                window.location.href = "seller-dashboard.html";
            }, 800);

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   SELLER CREATE ACCOUNT
   ===================================================== */

const sellerCreateAccountForm =
    document.getElementById("sellerCreateAccountForm");

if (sellerCreateAccountForm) {

    sellerCreateAccountForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("sellerName");
        const email = document.getElementById("sellerEmail");
        const phone = document.getElementById("sellerPhone");
        const password = document.getElementById("sellerPassword");
        const confirmPassword =
            document.getElementById("sellerConfirmPassword");

        const message =
            document.getElementById("sellerCreateAccountMessage");

        if (!name || !email || !phone || !password || !confirmPassword) {
            return;
        }

        const nameVal = name.value.trim();
        const emailVal = email.value.trim();
        const phoneVal = phone.value.trim();
        const passVal = password.value;
        const confirmPassVal = confirmPassword.value;

        if (nameVal === "") {
            showMessage(message, "Please enter your name.", "error");
            return;
        }

        if (!isValidEmail(emailVal)) {
            showMessage(message, "Enter a valid email address.", "error");
            return;
        }

        if (!isValidPhone(phoneVal)) {
            showMessage(
                message,
                "Phone number must contain 10 digits.",
                "error"
            );
            return;
        }

        if (!isValidPassword(passVal)) {
            showMessage(
                message,
                "Password must contain at least 6 characters.",
                "error"
            );
            return;
        }

        if (passVal !== confirmPassVal) {
            showMessage(
                message,
                "Passwords do not match.",
                "error"
            );
            return;
        }

        showMessage(message, "Creating seller account...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "seller",
                    name: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    password: passVal
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Could not create seller account.", "error");
                return;
            }

            showMessage(
                message,
                "Seller account created successfully! Redirecting to login...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "seller-login.html";
            }, 1000);

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   SELLER FORGOT PASSWORD
   ===================================================== */

const sellerForgotPasswordForm =
    document.getElementById("sellerForgotPasswordForm");

if (sellerForgotPasswordForm) {

    sellerForgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("sellerForgotEmail");
        const message =
            document.getElementById("sellerForgotPasswordMessage");

        if (!email) return;

        const emailVal = email.value.trim();

        if (!isValidEmail(emailVal)) {
            showMessage(
                message,
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        showMessage(message, "Verifying email...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailVal })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "No registered account found with this email.", "error");
                return;
            }

            showMessage(
                message,
                data.message || "Password reset instructions sent successfully.",
                "success"
            );

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   ADMIN LOGIN
   ===================================================== */

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("adminEmail");
        const password = document.getElementById("adminPassword");
        const message =
            document.getElementById("adminLoginMessage");

        if (!email || !password) return;

        const emailValue = email.value.trim();
        const passwordValue = password.value;

        if (!isValidEmail(emailValue)) {
            showMessage(message, "Please enter a valid admin email address.", "error");
            return;
        }

        if (passwordValue === "") {
            showMessage(message, "Please enter your password.", "error");
            return;
        }

        showMessage(message, "Logging in...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailValue,
                    password: passwordValue,
                    expectedRole: "admin"
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Invalid admin email or password.", "error");
                return;
            }

            localStorage.setItem("sugaMartRole", "admin");
            localStorage.setItem("sugaMartEmail", data.user.email);
            localStorage.setItem("sugaMartUser", JSON.stringify(data.user));

            showMessage(message, "Login successful! Redirecting...", "success");

            setTimeout(function () {
                window.location.href = "admin-dashboard.html";
            }, 800);

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   ADMIN CREATE ACCOUNT
   ===================================================== */

const adminCreateAccountForm =
    document.getElementById("adminCreateAccountForm");

if (adminCreateAccountForm) {

    adminCreateAccountForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("adminName");
        const email = document.getElementById("adminCreateEmail");
        const phone = document.getElementById("adminPhone");
        const password = document.getElementById("adminCreatePassword");
        const confirmPassword =
            document.getElementById("adminConfirmPassword");

        const message =
            document.getElementById("adminCreateAccountMessage");

        if (!name || !email || !phone || !password || !confirmPassword) {
            return;
        }

        const nameVal = name.value.trim();
        const emailVal = email.value.trim();
        const phoneVal = phone.value.trim();
        const passVal = password.value;
        const confirmPassVal = confirmPassword.value;

        if (nameVal === "") {
            showMessage(message, "Please enter your name.", "error");
            return;
        }

        if (!isValidEmail(emailVal)) {
            showMessage(message, "Enter a valid email address.", "error");
            return;
        }

        if (!isValidPhone(phoneVal)) {
            showMessage(
                message,
                "Phone number must contain 10 digits.",
                "error"
            );
            return;
        }

        if (!isValidPassword(passVal)) {
            showMessage(
                message,
                "Password must contain at least 6 characters.",
                "error"
            );
            return;
        }

        if (passVal !== confirmPassVal) {
            showMessage(
                message,
                "Passwords do not match.",
                "error"
            );
            return;
        }

        showMessage(message, "Creating admin account...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "admin",
                    name: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    password: passVal
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Could not create admin account.", "error");
                return;
            }

            showMessage(
                message,
                "Admin account created successfully! Redirecting to login...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "admin-login.html";
            }, 1000);

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   ADMIN FORGOT PASSWORD
   ===================================================== */

const adminForgotPasswordForm =
    document.getElementById("adminForgotPasswordForm");

if (adminForgotPasswordForm) {

    adminForgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("adminForgotEmail");
        const message =
            document.getElementById("adminForgotPasswordMessage");

        if (!email) return;

        const emailVal = email.value.trim();

        if (!isValidEmail(emailVal)) {
            showMessage(
                message,
                "Please enter a valid email address.",
                "error"
            );
            return;
        }

        showMessage(message, "Verifying admin email...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailVal })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "No registered account found with this email.", "error");
                return;
            }

            showMessage(
                message,
                data.message || "Password reset instructions sent successfully.",
                "success"
            );

        } catch (error) {
            showMessage(message, "Unable to connect to backend server. Make sure server is running.", "error");
        }
    });
}


/* =====================================================
   LOGOUT
   ===================================================== */

const logoutButtons =
    document.querySelectorAll("[data-logout]");

logoutButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        localStorage.removeItem("sugaMartRole");
        localStorage.removeItem("sugaMartEmail");
        localStorage.removeItem("sugaMartUser");

        window.location.href = "index.html";
    });

});


/* =====================================================
   CART - ADD PRODUCT
   ===================================================== */

function addProductToCart(button) {

    const productName =
        button.getAttribute("data-product-name");

    const productPrice =
        Number(button.getAttribute("data-product-price"));

    const productImage =
        button.getAttribute("data-product-image") || "";

    const productHoverImage =
        button.getAttribute("data-product-hover-image") || "";

    const productSeller =
        button.getAttribute("data-product-seller") || "";

    const productId =
        button.getAttribute("data-product-id") || productName;

    if (!productName || Number.isNaN(productPrice)) {
        return;
    }

    const cart = getCart();

    const existingProduct = cart.find(function (item) {
        return item.id === productId;
    });

    if (existingProduct) {

        existingProduct.quantity =
            Number(existingProduct.quantity || 1) + 1;

        if (productImage) {
            existingProduct.image = productImage;
        }

        if (productHoverImage) {
            existingProduct.hoverImage = productHoverImage;
        }

        if (productSeller) {
            existingProduct.seller = productSeller;
        }

    } else {

        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            hoverImage: productHoverImage,
            seller: productSeller,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();

    button.textContent = "Added ✓";

    setTimeout(function () {
        button.textContent = "Add to Cart";
    }, 1000);
}


/* PRODUCT DETAIL PAGE */

const addCartButtons =
    document.querySelectorAll("[data-add-cart]");

addCartButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

        event.preventDefault();

        addProductToCart(button);

    });

});


/* PRODUCT LIST PAGE */

const productPageCartButtons =
    document.querySelectorAll(".add-cart-button");

productPageCartButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        const card =
            button.closest(".product-card");

        if (!card) return;

        const productName =
            card.querySelector(".product-name")?.textContent?.trim();

        const productPriceElement =
            card.querySelector(".product-price");

        if (!productName || !productPriceElement) {
            return;
        }

        const productPrice =
            Number(
                productPriceElement.textContent
                    .replace(/[₹,]/g, "")
                    .trim()
            );

        if (Number.isNaN(productPrice)) {
            return;
        }

        const productImageElement =
            card.querySelector(".product-image");

        const productImage =
            productImageElement
                ? productImageElement.src
                : "";

        const product = {
            id: productName,
            name: productName,
            price: productPrice,
            image: productImage,
            seller: "SUGA Premium Homes"
        };

        const cart = getCart();

        const existingProduct =
            cart.find(function (item) {
                return item.id === product.id;
            });

        if (existingProduct) {

            existingProduct.quantity =
                Number(existingProduct.quantity || 1) + 1;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                seller: product.seller,
                quantity: 1
            });
        }

        saveCart(cart);
        updateCartCount();

        button.textContent = "Added ✓";

        setTimeout(function () {
            button.textContent = "Add to Cart";
        }, 1000);

    });

});


/* =====================================================
   CART COUNT
   ===================================================== */

function updateCartCount() {

    const cart = getCart();

    let totalQuantity = 0;

    cart.forEach(function (item) {
        totalQuantity += Math.max(0, Number(item.quantity) || 0);
    });

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }
}

updateCartCount();


/* =====================================================
   CART PAGE
   ===================================================== */

function displayCart() {

    const cartContainer =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");

    if (!cartContainer) return;

    const cart = getCart();

    cartContainer.innerHTML = "";

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="cart-empty-state">
                <div class="cart-empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add furniture from the Products page to see it here.</p>
                <a href="buyer-products.html">Browse Products</a>
            </div>
        `;

        if (cartTotal) {
            cartTotal.textContent = "₹0";
        }

        return;
    }

    let total = 0;

    cart.forEach(function (item, index) {

        const quantity =
            Math.max(1, Number(item.quantity) || 1);

        const price =
            Number(item.price) || 0;

        const itemTotal =
            price * quantity;

        total += itemTotal;

        const row =
            document.createElement("article");

        row.className = "cart-item";

        row.innerHTML = `
            <div class="cart-item-image-wrap">
                <img
                    class="cart-item-image"
                    src="${item.image || ""}"
                    alt="${item.name || "Furniture product"}"
                    loading="lazy"
                >
            </div>

            <div class="cart-item-details">
                <h3>${item.name || "Furniture Product"}</h3>

                <p class="cart-item-seller">
                    Seller: ${item.seller || "SUGA Premium Homes"}
                </p>

                <p class="cart-item-price">
                    ₹${price.toLocaleString("en-IN")}
                </p>

                <div class="cart-item-controls">

                    <div class="quantity-control">
                        <button
                            type="button"
                            aria-label="Decrease quantity"
                            onclick="changeCartQuantity(${index}, -1)"
                        >−</button>

                        <span>${quantity}</span>

                        <button
                            type="button"
                            aria-label="Increase quantity"
                            onclick="changeCartQuantity(${index}, 1)"
                        >+</button>
                    </div>

                    <button
                        type="button"
                        class="cart-delete-button"
                        onclick="removeCartItem(${index})"
                    >
                        Delete
                    </button>

                </div>
            </div>

            <div class="cart-item-total">
                ₹${itemTotal.toLocaleString("en-IN")}
            </div>
        `;

        cartContainer.appendChild(row);
    });

    if (cartTotal) {
        cartTotal.textContent =
            "₹" + total.toLocaleString("en-IN");
    }
}

function changeCartQuantity(index, change) {

    const cart = getCart();

    if (!cart[index]) return;

    const currentQuantity =
        Math.max(1, Number(cart[index].quantity) || 1);

    const newQuantity =
        currentQuantity + change;

    if (newQuantity <= 0) {
        cart.splice(index, 1);
    } else {
        cart[index].quantity = newQuantity;
    }

    saveCart(cart);
    displayCart();
    updateCartCount();
}

displayCart();


/* =====================================================
   REMOVE CART ITEM
   ===================================================== */

function removeCartItem(index) {

    const cart = getCart();

    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart(cart);

    displayCart();
    updateCartCount();
}


/* =====================================================
   BUY NOW
   ===================================================== */

const buyNowButtons =
    document.querySelectorAll("[data-buy-now]");

buyNowButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const productName =
            button.getAttribute("data-product-name");

        const productPrice =
            Number(button.getAttribute("data-product-price"));

        if (!productName || isNaN(productPrice)) {
            return;
        }

        const buyNowProduct = [{
            name: productName,
            price: productPrice,
            quantity: 1
        }];

        localStorage.setItem(
            "sugaMartBuyNow",
            JSON.stringify(buyNowProduct)
        );

        window.location.href = "buyer-checkout.html";
    });

});


/* =====================================================
   CHECKOUT
   ===================================================== */

const checkoutForm =
    document.getElementById("checkoutForm");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("checkoutName");

        const phone =
            document.getElementById("checkoutPhone");

        const address =
            document.getElementById("checkoutAddress");

        const city =
            document.getElementById("checkoutCity");

        const state =
            document.getElementById("checkoutState");

        const pincode =
            document.getElementById("checkoutPincode");

        const message =
            document.getElementById("checkoutMessage");

        if (
            !name ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return;
        }

        if (name.value.trim() === "") {
            showMessage(
                message,
                "Please enter your name.",
                "error"
            );
            return;
        }

        if (!isValidPhone(phone.value.trim())) {
            showMessage(
                message,
                "Enter a valid 10-digit phone number.",
                "error"
            );
            return;
        }

        if (address.value.trim() === "") {
            showMessage(
                message,
                "Please enter your delivery address.",
                "error"
            );
            return;
        }

        if (city.value.trim() === "") {
            showMessage(
                message,
                "Please enter your city.",
                "error"
            );
            return;
        }

        if (state.value.trim() === "") {
            showMessage(
                message,
                "Please enter your state.",
                "error"
            );
            return;
        }

        if (!/^[0-9]{6}$/.test(pincode.value.trim())) {
            showMessage(
                message,
                "Pincode must contain 6 digits.",
                "error"
            );
            return;
        }

        const addressData = {
            name: name.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim(),
            city: city.value.trim(),
            state: state.value.trim(),
            pincode: pincode.value.trim()
        };

        localStorage.setItem(
            "sugaMartDeliveryAddress",
            JSON.stringify(addressData)
        );

        window.location.href = "buyer-payment.html";
    });
}


/* =====================================================
   PAYMENT
   ===================================================== */
   const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
);

const upiOptions = document.getElementById("upiOptions");
const qrPayment = document.getElementById("qrPayment");
const codInformation = document.getElementById("codInformation");

paymentMethods.forEach(function (method) {

    method.addEventListener("change", function () {

        // Hide all sections first
        upiOptions.style.display = "none";
        qrPayment.style.display = "none";
        codInformation.style.display = "none";

        // Show selected section
        if (this.value === "UPI") {
            upiOptions.style.display = "block";
        }

        else if (this.value === "QR Payment") {
            qrPayment.style.display = "block";
        }

        else if (this.value === "Cash on Delivery") {
            codInformation.style.display = "block";
        }

    });

});

const paymentForm =
    document.getElementById("paymentForm");

if (paymentForm) {

    paymentForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const selectedPayment =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );

        const message =
            document.getElementById("paymentMessage");

        if (!selectedPayment) {
            showMessage(
                message,
                "Please select a payment method.",
                "error"
            );
            return;
        }

        const cart = getCart();

        if (cart.length === 0) {
            showMessage(
                message,
                "Your cart is empty. Please add items before placing an order.",
                "error"
            );
            return;
        }

        let deliveryAddress = {};
        try {
            deliveryAddress = JSON.parse(localStorage.getItem("sugaMartDeliveryAddress")) || {};
        } catch (e) {}

        const userEmail = localStorage.getItem("sugaMartEmail") || "buyer@sugamart.com";
        const orderId = "SM" + Date.now();
        const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

        showMessage(message, "Processing your order...", "info");

        try {
            const response = await fetch(`${API_BASE}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderNumber: orderId,
                    buyerEmail: userEmail,
                    customerName: deliveryAddress.name || "Customer",
                    phone: deliveryAddress.phone || "9876543210",
                    shippingAddress: deliveryAddress.address || "Delivery Address",
                    city: deliveryAddress.city || "City",
                    state: deliveryAddress.state || "State",
                    pincode: deliveryAddress.pincode || "600001",
                    totalAmount: totalAmount,
                    paymentMethod: selectedPayment.value,
                    items: cart
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(message, data.message || "Failed to place order in database.", "error");
                return;
            }

            // Also keep local fallback
            const orders = getOrders();
            orders.push({
                orderId: orderId,
                status: "Order Placed",
                paymentMethod: selectedPayment.value,
                totalAmount: totalAmount,
                items: cart,
                date: new Date().toLocaleDateString()
            });
            saveOrders(orders);

            localStorage.setItem("sugaMartLastOrderId", orderId);

            // Clear cart upon successful order
            localStorage.removeItem("sugaMartCart");
            updateCartCount();

            window.location.href = "buyer-order-success.html";

        } catch (error) {
            showMessage(message, "Unable to connect to order backend. Please check server.", "error");
        }
    });
}


/* =====================================================
   ORDER SUCCESS
   ===================================================== */

const orderIdElement =
    document.querySelector("[data-order-id]");

if (orderIdElement) {

    const orderId =
        localStorage.getItem("sugaMartLastOrderId");

    if (orderId) {
        orderIdElement.textContent = orderId;
    }
}


/* =====================================================
   PRODUCT SEARCH
   ===================================================== */

const searchInput =
    document.querySelector("[data-product-search]");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const searchText =
            searchInput.value.toLowerCase().trim();

        const products =
            document.querySelectorAll("[data-product-card]");

        products.forEach(function (product) {

            const productName =
                product.textContent.toLowerCase();

            if (productName.includes(searchText)) {
                product.style.display = "";
            } else {
                product.style.display = "none";
            }

        });
    });
}


/* =====================================================
   PROFILE EMAIL
   ===================================================== */

const accountEmailElements =
    document.querySelectorAll("[data-account-email]");

accountEmailElements.forEach(function (element) {
    const email = localStorage.getItem("sugaMartEmail");
    if (email) {
        element.textContent = email;
    }
});

async function loadLiveUserProfile() {
    const email = localStorage.getItem("sugaMartEmail");
    if (!email) return;

    try {
        const response = await fetch(`${API_BASE}/api/users/profile/${encodeURIComponent(email)}`);
        const data = await response.json();
        if (response.ok && data.success && data.user) {
            const u = data.user;
            const profileName = document.getElementById("profileName");
            if (profileName && u.name) {
                profileName.textContent = u.name;
            }

            document.querySelectorAll("[data-account-name]").forEach(el => {
                if (u.name) el.textContent = u.name;
            });

            document.querySelectorAll("[data-account-email]").forEach(el => {
                if (u.email) el.textContent = u.email;
            });

            document.querySelectorAll("[data-account-phone]").forEach(el => {
                if (u.phone) el.textContent = u.phone;
            });
        }
    } catch (e) {}
}

loadLiveUserProfile();


/* =====================================================
   DELIVERY ADDRESS DISPLAY
   ===================================================== */

const deliveryAddressElement =
    document.querySelector("[data-delivery-address]");

if (deliveryAddressElement) {

    try {

        const address =
            JSON.parse(
                localStorage.getItem(
                    "sugaMartDeliveryAddress"
                )
            );

        if (address) {

            deliveryAddressElement.innerHTML = `
                <p><strong>${address.name}</strong></p>
                <p>${address.phone}</p>
                <p>${address.address}</p>
                <p>${address.city}, ${address.state}</p>
                <p>${address.pincode}</p>
            `;
        }

    } catch (error) {

        deliveryAddressElement.textContent =
            "No delivery address available.";

    }
}


/* =====================================================
   SHIPMENT STATUS
   ===================================================== */

const shipmentStatusElement =
    document.querySelector("[data-shipment-status]");

if (shipmentStatusElement) {

    const orders = getOrders();

    if (orders.length > 0) {

        const latestOrder =
            orders[orders.length - 1];

        shipmentStatusElement.textContent =
            latestOrder.status;

    } else {

        shipmentStatusElement.textContent =
            "No orders found.";
    }
}


/* =====================================================
   BACK TO HOME
   ===================================================== */

const backHomeButtons =
    document.querySelectorAll("[data-back-home]");

backHomeButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        window.location.href = "index.html";

    });

});


/* =====================================================
   PASSWORD SHOW / HIDE
   ===================================================== */

const passwordToggleButtons =
    document.querySelectorAll("[data-password-toggle]");

passwordToggleButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const targetId =
            button.getAttribute("data-password-toggle");

        const passwordInput =
            document.getElementById(targetId);

        if (!passwordInput) return;

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            button.textContent = "Hide";

        } else {

            passwordInput.type = "password";

            button.textContent = "Show";
        }

    });

});


/* =====================================================
   BUYER ORDERS LOADER (MYSQL)
   ===================================================== */

async function loadBuyerOrders() {
    const container = document.getElementById("buyerOrdersContainer");
    if (!container) return;

    const email = localStorage.getItem("sugaMartEmail");
    if (!email) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders/buyer/${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            container.innerHTML = "";

            data.orders.forEach(order => {
                const dateStr = new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                });

                const card = document.createElement("section");
                card.className = "order-card";
                card.innerHTML = `
                    <div class="order-card-content">
                        <div class="order-card-header">
                            <div>
                                <p class="eyebrow">ORDER</p>
                                <h3>#${order.order_number}</h3>
                            </div>
                            <span class="order-status">${order.order_status}</span>
                        </div>
                        <div class="order-details-grid">
                            <div>
                                <span class="detail-label">Items</span>
                                <strong>${order.total_items} Item(s)</strong>
                            </div>
                            <div>
                                <span class="detail-label">Order Date</span>
                                <strong>${dateStr}</strong>
                            </div>
                            <div>
                                <span class="detail-label">Amount</span>
                                <strong>₹${Number(order.total_amount).toLocaleString("en-IN")}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="order-card-action">
                        <a href="buyer-order-details.html?order=${order.order_number}" class="secondary-button">
                            View Details
                        </a>
                    </div>
                `;
                container.appendChild(card);
            });

            const shipmentStatus = document.querySelector("[data-shipment-status]");
            if (shipmentStatus && data.orders[0]) {
                shipmentStatus.textContent = data.orders[0].order_status;
            }
        }
    } catch (error) {
        console.warn("Could not fetch buyer orders from database:", error);
    }
}


/* =====================================================
   BUYER ORDER DETAILS LOADER (MYSQL)
   ===================================================== */
async function loadBuyerOrderDetails() {
    const orderNumberEl = document.querySelector("[data-order-number]");
    if (!orderNumberEl) return;

    const urlParams = new URLSearchParams(window.location.search);
    let orderNumber = urlParams.get("order");
    if (!orderNumber) {
        orderNumber = localStorage.getItem("sugaMartLastOrderId");
    }
    if (!orderNumber) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders/details/${encodeURIComponent(orderNumber)}`);
        const data = await response.json();

        if (response.ok && data.success && data.order) {
            const order = data.order;
            orderNumberEl.textContent = "#" + order.order_number;

            const dateEl = document.querySelector("[data-order-date]");
            if (dateEl) {
                dateEl.textContent = new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "long", year: "numeric"
                });
            }

            const statusEl = document.querySelector("[data-order-status]");
            if (statusEl) statusEl.textContent = order.order_status;

            const shipmentStatus = document.querySelector("[data-shipment-status]");
            if (shipmentStatus) shipmentStatus.textContent = order.order_status;

            const paymentEl = document.querySelector("[data-order-payment]");
            if (paymentEl) paymentEl.textContent = order.payment_method + " Confirmed";

            if (order.items && order.items.length > 0) {
                const item = order.items[0];
                const productEl = document.querySelector("[data-order-product]");
                if (productEl) productEl.textContent = item.product_name;

                const categoryEl = document.querySelector("[data-order-category]");
                if (categoryEl) categoryEl.textContent = item.seller_name || "Furniture";

                const quantityEl = document.querySelector("[data-order-quantity]");
                if (quantityEl) quantityEl.textContent = item.quantity;

                const priceEl = document.querySelector("[data-order-price]");
                if (priceEl) priceEl.textContent = "₹" + Number(item.price).toLocaleString("en-IN");
            }

            const totalEl = document.querySelector("[data-order-total]");
            if (totalEl) totalEl.textContent = "₹" + Number(order.total_amount).toLocaleString("en-IN");

            const addressEl = document.querySelector("[data-delivery-address]");
            if (addressEl) {
                addressEl.innerHTML = `
                    <p><strong>${order.customer_name}</strong></p>
                    <p>${order.phone}</p>
                    <p>${order.shipping_address}</p>
                    <p>${order.city}, ${order.state} - ${order.pincode}</p>
                `;
            }

            // Update shipment tracking steps
            const trackingSteps = document.querySelectorAll(".tracking-list-item");
            if (trackingSteps.length >= 5) {
                const statuses = ["Order Placed", "Order Confirmed", "Packed", "Shipped", "Delivered"];
                const currentIndex = statuses.indexOf(order.order_status);
                trackingSteps.forEach((step, idx) => {
                    const dot = step.querySelector(".tracking-dot");
                    if (idx <= (currentIndex >= 0 ? currentIndex : 0)) {
                        step.classList.add("active");
                        if (dot) dot.textContent = "✓";
                    } else {
                        step.classList.remove("active");
                        if (dot) dot.textContent = "○";
                    }
                });
            }
        }
    } catch (err) {
        console.warn("Could not load order details from MySQL:", err);
    }
}

/* =====================================================
   SELLER ORDERS LOADER (MYSQL)
   ===================================================== */
async function loadSellerOrders() {
    const container = document.getElementById("sellerOrdersContainer");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders/all`);
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            container.innerHTML = "";

            data.orders.forEach((order, idx) => {
                const card = document.createElement("section");
                card.className = "order-card";
                card.innerHTML = `
                    <div class="order-card-content">
                        <div class="order-card-header">
                            <div>
                                <p class="eyebrow">ORDER 0${idx + 1}</p>
                                <h3>Order #${order.order_number}</h3>
                            </div>
                            <span class="order-status">${order.order_status}</span>
                        </div>
                        <div class="order-information">
                            <p><strong>Customer:</strong> ${order.customer_name}</p>
                            <p><strong>Items:</strong> ${order.total_items} Product(s)</p>
                            <p><strong>Total:</strong> ₹${Number(order.total_amount).toLocaleString("en-IN")}</p>
                            <p><strong>Payment:</strong> ${order.payment_method}</p>
                            <p><strong>Status:</strong> ${order.order_status}</p>
                        </div>
                        <div class="order-actions">
                            <a href="seller-order-details.html?order=${order.order_number}" class="primary-button">
                                View Details
                            </a>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (err) {
        console.warn("Could not load seller orders from MySQL:", err);
    }
}

/* =====================================================
   SELLER ORDER DETAILS LOADER (MYSQL)
   ===================================================== */
async function loadSellerOrderDetails() {
    const customerNameEl = document.querySelector("[data-customer-name]");
    if (!customerNameEl) return;

    const urlParams = new URLSearchParams(window.location.search);
    let orderNumber = urlParams.get("order");
    if (!orderNumber) {
        orderNumber = localStorage.getItem("sugaMartLastOrderId");
    }
    if (!orderNumber) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders/details/${encodeURIComponent(orderNumber)}`);
        const data = await response.json();

        if (response.ok && data.success && data.order) {
            const order = data.order;
            const orderNumEl = document.querySelector("[data-order-number]");
            if (orderNumEl) orderNumEl.textContent = order.order_number;

            const statusEl = document.querySelector("[data-order-status]");
            if (statusEl) statusEl.textContent = order.order_status;

            customerNameEl.textContent = order.customer_name;

            const phoneEl = document.querySelector("[data-customer-phone]");
            if (phoneEl) phoneEl.textContent = order.phone;

            const emailEl = document.querySelector("[data-customer-email]");
            if (emailEl) emailEl.textContent = order.buyer_email;

            const addressEl = document.querySelector("[data-delivery-address-text]");
            if (addressEl) {
                addressEl.innerHTML = `${order.shipping_address}<br>${order.city}<br>${order.state}<br>${order.pincode}`;
            }

            if (order.items && order.items.length > 0) {
                const item = order.items[0];
                const prodNameEl = document.querySelector("[data-product-name]");
                if (prodNameEl) prodNameEl.textContent = item.product_name;

                const qtyEl = document.querySelector("[data-product-quantity]");
                if (qtyEl) qtyEl.textContent = item.quantity;

                const priceEl = document.querySelector("[data-product-price]");
                if (priceEl) priceEl.textContent = "₹" + Number(item.price).toLocaleString("en-IN");
            }

            const totalEl = document.querySelector("[data-product-total]");
            if (totalEl) totalEl.textContent = "₹" + Number(order.total_amount).toLocaleString("en-IN");

            const methodEl = document.querySelector("[data-payment-method]");
            if (methodEl) methodEl.textContent = order.payment_method;

            const payStatusEl = document.querySelector("[data-payment-status]");
            if (payStatusEl) payStatusEl.textContent = order.payment_method === "Cash on Delivery" ? "Pending" : "Paid";
        }
    } catch (err) {
        console.warn("Could not load seller order details from MySQL:", err);
    }
}

/* =====================================================
   ADMIN ORDERS LOADER (MYSQL)
   ===================================================== */
async function loadAdminOrders() {
    const container = document.getElementById("adminOrdersContainer");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders/all`);
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            container.innerHTML = "";

            data.orders.forEach(order => {
                const statusClass = order.order_status === "Delivered" ? "status-delivered" : (order.order_status === "Shipped" ? "status-shipped" : "status-placed");
                const card = document.createElement("article");
                card.className = "order-card";
                card.innerHTML = `
                    <div class="order-card-header">
                        <div>
                            <p class="section-eyebrow">ORDER NUMBER</p>
                            <h2>#${order.order_number}</h2>
                        </div>
                        <span class="order-status ${statusClass}">
                            ${order.order_status}
                        </span>
                    </div>
                    <div class="order-card-content">
                        <div class="order-information">
                            <p><strong>Customer:</strong> ${order.customer_name}</p>
                            <p><strong>Email:</strong> ${order.buyer_email}</p>
                            <p><strong>Total Items:</strong> ${order.total_items}</p>
                            <p><strong>Total:</strong> ₹${Number(order.total_amount).toLocaleString("en-IN")}</p>
                            <p><strong>Payment:</strong> ${order.payment_method}</p>
                        </div>
                        <div class="order-actions">
                            <button
                                type="button"
                                class="primary-button"
                                onclick="updateOrderStatus(this, 'Shipped', '${order.order_number}')">
                                Mark Shipped
                            </button>
                            <button
                                type="button"
                                class="secondary-button"
                                onclick="updateOrderStatus(this, 'Delivered', '${order.order_number}')">
                                Mark Delivered
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (err) {
        console.warn("Could not load admin orders from MySQL:", err);
    }
}

/* =====================================================
   ADMIN REPORTS LOADER (MYSQL)
   ===================================================== */
async function loadAdminReports() {
    const totalUsersEl = document.getElementById("reportTotalUsers");
    if (!totalUsersEl) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/reports`);
        const data = await response.json();

        if (response.ok && data.success && data.reports) {
            const r = data.reports;
            if (totalUsersEl) totalUsersEl.textContent = r.totalUsers;
            const sellersEl = document.getElementById("reportTotalSellers");
            if (sellersEl) sellersEl.textContent = r.totalSellers;
            const productsEl = document.getElementById("reportTotalProducts");
            if (productsEl) productsEl.textContent = r.totalProducts;
            const ordersEl = document.getElementById("reportTotalOrders");
            if (ordersEl) ordersEl.textContent = r.totalOrders;
            const completedEl = document.getElementById("reportCompletedOrders");
            if (completedEl) completedEl.textContent = r.completedOrders;
            const pendingEl = document.getElementById("reportPendingOrders");
            if (pendingEl) pendingEl.textContent = r.pendingOrders;

            const salesEl = document.getElementById("reportTotalSales");
            if (salesEl) salesEl.textContent = "₹" + Number(r.totalSales).toLocaleString("en-IN");
            const monthlyEl = document.getElementById("reportMonthlySales");
            if (monthlyEl) monthlyEl.textContent = "₹" + Number(r.monthlySales).toLocaleString("en-IN");
            const avgEl = document.getElementById("reportAvgOrderValue");
            if (avgEl) avgEl.textContent = "₹" + Number(r.avgOrderValue).toLocaleString("en-IN");
        }
    } catch (err) {
        console.warn("Could not load admin reports from MySQL:", err);
    }
}

/* =====================================================
   PAGE READY
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();
    displayCart();
    loadBuyerOrders();
    loadBuyerOrderDetails();
    loadSellerOrders();
    loadSellerOrderDetails();
    loadAdminOrders();
    loadLiveUserProfile();
    loadAdminReports();

});

function changeUserStatus(button, status) {
    const userCard = button.closest(".product-card");
    const statusText = userCard.querySelector(".user-status");
    const statusLabel = userCard.querySelector(".product-label");

    if (!statusText || !statusLabel) {
        return;
    }

    statusText.textContent = status;
    statusText.classList.toggle("active-status", status === "Active");
    statusText.classList.toggle("blocked-status", status === "Blocked");

    statusLabel.textContent =
        status === "Active" ? "ACTIVE USER" : "BLOCKED USER";

    statusLabel.style.background =
        status === "Active" ? "#e5f1e9" : "#f8e5e2";

    statusLabel.style.color =
        status === "Active" ? "#176b52" : "#a33a32";
}

function changeSellerStatus(button, status) {
    const sellerCard = button.closest(".product-card");

    if (!sellerCard) {
        return;
    }

    const statusText = sellerCard.querySelector(".seller-status");
    const statusLabel = sellerCard.querySelector(".product-label");

    if (!statusText || !statusLabel) {
        return;
    }

    statusText.textContent = status;

    if (status === "Approved") {
        statusLabel.textContent = "APPROVED SELLER";
        statusLabel.style.background = "#e5f1e9";
        statusLabel.style.color = "#176b52";
        statusText.style.color = "#176b52";
    } else {
        statusLabel.textContent = "BLOCKED SELLER";
        statusLabel.style.background = "#f8e5e2";
        statusLabel.style.color = "#a33a32";
        statusText.style.color = "#a33a32";
    }
}