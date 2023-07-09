//state
let products = [];
let cart = [];

//html selectors
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const totalPriceCounter = document.getElementById('total-price-counter');
const checkoutButton = document.getElementById('checkout-button');
const paymentModal = document.getElementById('payment-modal-container');
const modalExitButton = document.getElementById('modal-exit-button');

// Product classes
class Item {
    constructor(title, subtitle, price, img = '') {
        this.title = title;
        this.subtitle = subtitle;
        this.price = price;
        this.img = `./assets/${img ?? 'default.png'}`;
    }
    createHtml() {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.innerHTML = `
        <img src="${this.img}" alt="${this.title}">
        <h2>${this.title}</h2>
        <h3>${this.subtitle}</h3>
        <p>Price: ${this.price}</p>
        `;
        return itemElement;
    }
}

class CartItem extends Item {
    createHtml() {
        const itemElement = super.createHtml();
        const button = document.createElement('button');
        button.textContent = 'Remove from Cart';
        button.addEventListener('click', () => {
            const index = cart.indexOf(this);
            removeProductFromCart(index);
        });
        itemElement.appendChild(button);
        return itemElement;
    }
}

class StoreItem extends Item {
    constructor(title, subtitle, price, img = '', productIndex, planIndex) {
        super(title, subtitle, price, img);
        this.productIndex = productIndex;
        this.planIndex = planIndex;
    }
    createHtml() {
        const itemElement = super.createHtml();
        const button = document.createElement('button');
        button.textContent = 'Add to Cart';
        button.addEventListener('click', () => {
            addProductToCart(this.productIndex, this.planIndex);
        });
        itemElement.appendChild(button);
        return itemElement;
    }
}

//render functions (store and cart)
//render store should run once on load, render cart should run on cart change.
function renderStore() {
    productsContainer.innerHTML = '';
    products.forEach((product, productIndex) => {
        //if product has no plans prevent errors
        if (!product?.plans?.length) return;
        //render each product plan as a store item
        product.plans.forEach((plan, planIndex) => {
            const item = new StoreItem(product.name, plan.name, plan.price, product.img, productIndex, planIndex);
            const itemElement = item.createHtml();
            productsContainer.appendChild(itemElement);
        });
    });
}

function renderCart() {
    //remove previous cart items
    cartContainer.innerHTML = '';
    //render new items
    let totalPrice = 0;
    cart.forEach((item) => {
        const itemElement = item.createHtml();
        cartContainer.appendChild(itemElement);
        totalPrice += item.price;
    });
    totalPriceCounter.textContent = `Total Price: ${totalPrice}`;
    // Enable or disable checkout button based on cart length
    if (cart.length > 0) {
        checkoutButton.removeAttribute('disabled');
    } else {
        checkoutButton.setAttribute('disabled', 'disabled');
    }
}

//handler functions
function togglePaymentModal() {
    paymentModal.classList.toggle('hidden');
}

function handlePayment(e) {
    e.preventDefault();
    //implement ajax request to BE
    alert('Thank you for your purchase!');
}

//add event listeners
checkoutButton.addEventListener('click', togglePaymentModal);
modalExitButton.addEventListener('click', togglePaymentModal);

//api
async function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Server responded with a status of ' + response.status);
    }
    return await response.json();
}

async function fetchData(endpoint) {
    try {
        const response = await fetch(`./${endpoint}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(error);
    }
}

async function postData(endpoint, data) {
    try {
        const response = await fetch(`./${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error(error);
    }
}

async function fetchProducts() {
    const productsData = (await fetchData('products')) || [];
    products = productsData.map(function (product, productIndex) {
        return {
            ...product,
            plans: product.plans.map(function (plan, planIndex) {
                return new StoreItem(product.name, plan.name, plan.price, product.img, productIndex, planIndex);
            }),
        };
    });
    renderStore();
}

async function fetchCart() {
    const cartData = (await fetchData('cart')) || [];
    cart = cartData.map(function (item) {
        return new CartItem(item.title, item.subtitle, item.price, item.img);
    });
    renderCart();
}

async function addProductToCart(productIndex, planIndex) {
    await postData('cart/add', { productIndex, planIndex });
    fetchCart();
}

async function removeProductFromCart(index) {
    await postData('cart/remove', { index });
    fetchCart();
}

//when page loads fetch products and crt and render the store
window.addEventListener('DOMContentLoaded', async () => {
    await fetchProducts();
    await fetchCart();
});
