// SUGA MART - Basic Chatbot

const chatbotReplies = {
    greeting: {
        en: "Hello! Welcome to SUGA MART. How can I help you?",
        ta: "வணக்கம்! SUGA MART-க்கு வரவேற்கிறோம். நான் எப்படி உதவலாம்?"
    },

    products: {
        en: "You can explore our furniture in the Products section.",
        ta: "Products பகுதியில் நமது furniture வகைகளைப் பார்க்கலாம்."
    },

    cart: {
        en: "You can view your selected items in My Cart.",
        ta: "நீங்கள் தேர்வு செய்த பொருட்களை My Cart பகுதியில் பார்க்கலாம்."
    },

    orders: {
        en: "Visit My Orders to check your orders.",
        ta: "உங்கள் ஆர்டர்களைப் பார்க்க My Orders பகுதிக்குச் செல்லுங்கள்."
    },

    delivery: {
        en: "Please check the delivery details during checkout.",
        ta: "Checkout செய்யும்போது delivery விவரங்களைப் பார்க்கவும்."
    },

    thanks: {
        en: "You're welcome! Happy shopping at SUGA MART!",
        ta: "மகிழ்ச்சி! SUGA MART-ல் மகிழ்ச்சியாக shopping செய்யுங்கள்!"
    },

    default: {
        en: "Sorry, I didn't understand. Try asking about products, cart, orders or delivery.",
        ta: "மன்னிக்கவும், புரியவில்லை. Products, cart, orders அல்லது delivery பற்றி கேளுங்கள்."
    }
};

function getChatbotReply(message, language = "en") {
    const text = message.toLowerCase();

    let category = "default";

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("வணக்கம்")
    ) {
        category = "greeting";
    } else if (
        text.includes("product") ||
        text.includes("furniture") ||
        text.includes("sofa") ||
        text.includes("bed") ||
        text.includes("பொருள்")
    ) {
        category = "products";
    } else if (
        text.includes("cart") ||
        text.includes("கார்ட்")
    ) {
        category = "cart";
    } else if (
        text.includes("order") ||
        text.includes("ஆர்டர்")
    ) {
        category = "orders";
    } else if (
        text.includes("delivery") ||
        text.includes("address") ||
        text.includes("டெலிவரி")
    ) {
        category = "delivery";
    } else if (
        text.includes("thank") ||
        text.includes("நன்றி")
    ) {
        category = "thanks";
    }

    return chatbotReplies[category][language] ||
           chatbotReplies[category].en;
}

// SUGA MART - Chat Window

document.addEventListener("DOMContentLoaded", function () {

    const chatButton = document.getElementById("chatbot-toggle");
    const chatWindow = document.getElementById("chatbot-window");
    const chatForm = document.getElementById("chatbot-form");
    const chatInput = document.getElementById("chatbot-input");
    const chatMessages = document.getElementById("chatbot-messages");
    const languageSelect = document.getElementById("chatbot-language");

    // Stop if the chatbot HTML elements are not present
    if (
        !chatButton ||
        !chatWindow ||
        !chatForm ||
        !chatInput ||
        !chatMessages
    ) {
        console.warn("SUGA MART chatbot HTML elements are missing.");
        return;
    }

    // Open and close chatbot
    chatButton.addEventListener("click", function () {
        const isHidden = chatWindow.hidden;
        chatWindow.hidden = !isHidden;
        chatButton.setAttribute("aria-expanded", String(isHidden));

        if (isHidden) {
            chatInput.focus();
        }
    });

    // Add a message to the chat window
    function addMessage(text, sender) {
        const message = document.createElement("div");
        message.className = "chat-message " + sender;
        message.textContent = text;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Welcome message
    addMessage(
        "Hello! Welcome to SUGA MART. How can I help you?",
        "bot"
    );

    // Send a message
    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const userMessage = chatInput.value.trim();

        if (!userMessage) {
            return;
        }

        addMessage(userMessage, "user");

        const language = languageSelect
            ? languageSelect.value
            : "en";

        const reply = getChatbotReply(userMessage, language);

        addMessage(reply, "bot");

        chatInput.value = "";
        chatInput.focus();
    });

});


// Close chatbot using the X button
const closeButton = document.getElementById("chatbot-close");
const chatButton = document.getElementById("chatbot-toggle");
const chatWindow = document.getElementById("chatbot-window");

if (closeButton && chatButton && chatWindow) {
    closeButton.addEventListener("click", function () {
        chatWindow.hidden = true;
        chatButton.setAttribute("aria-expanded", "false");
    });
}


