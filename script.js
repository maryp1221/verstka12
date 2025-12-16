// 1. МАССИВЫ ДАННЫХ
const products = [
    { id: 1, name: "Матовая жидкая помада", category: "lips", brand: "L'Oreal", volume: "5ml", price: 899, rating: 4.7, image: "images/lipstick.jpeg" },
    { id: 2, name: "Тональная основа", category: "face", brand: "Maybelline", volume: "30ml", price: 1299, rating: 4.5, image: 'images/foundation.jpeg' },
    { id: 3, name: "Палетка теней", category: "eyes", brand: "NYX", volume: "15g", price: 1599, rating: 4.8, image: 'images/eyeshadows.jpeg' },
    { id: 4, name: "Увлажняющий крем", category: "skincare", brand: "La Roche-Posay", volume: "50ml", price: 1899, rating: 4.9, image: "images/cream.jpeg.webp" },
    { id: 5, name: "Блеск для губ", category: "lips", brand: "Dior", volume: "6ml", price: 2499, rating: 4.6, image: "images/lipgloss.jpg" },
    { id: 6, name: "Консилер", category: "face", brand: "NARS", volume: "8ml", price: 2199, rating: 4.4, image: 'images/concealer.jpg' },
    { id: 7, name: "Тушь для ресниц", category: "eyes", brand: "Too Faced", volume: "10ml", price: 1799, rating: 4.7, image: 'images/mascara.jpg' },
    { id: 8, name: "Сыворотка", category: "skincare", brand: "The Ordinary", volume: "30ml", price: 999, rating: 4.3, image: 'images/serum.jpeg' }
];

// Данные для таблицы (можно взять те же товары)
const tableData = [...products];

// 2. ПЕРЕМЕННЫЕ ДЛЯ РАБОТЫ С DOM
const productsContainer = document.getElementById('products-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartModal = document.getElementById('cart-modal');
const cartToggle = document.getElementById('cart-toggle');
const modalClose = document.querySelector('.modal-close');
const checkoutBtn = document.getElementById('checkout-btn');
const tableBody = document.getElementById('table-body');
const highlightBtn = document.getElementById('highlight-top-rated');
const sortPriceBtn = document.getElementById('sort-by-price');
const subscribeForm = document.getElementById('subscribe-form');
const formMessage = document.getElementById('form-message');

// 3. КОРЗИНА (глобальное состояние)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 4. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products); // Показываем все товары
    renderTable(tableData);   // Заполняем таблицу
    updateCartUI();           // Обновляем корзину
});

// 5. РЕНДЕРИНГ КАРТОЧЕК ТОВАРОВ
function renderProducts(productsArray) {
    productsContainer.innerHTML = '';
    if (productsArray.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">Товары не найдены</p>';
        return;
    }
    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = `product-card ${product.category}`;
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="brand">${product.brand}</p>
            <p class="volume">${product.volume}</p>
            <div class="price">${product.price} руб.</div>
            <div class="rating">Рейтинг: ${product.rating} ★</div>
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">В корзину</button>
        `;
        productsContainer.appendChild(productCard);
    });
    // Вешаем обработчики на кнопки "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => addToCart(e.target.dataset.id));
    });
}

// 6. ФИЛЬТРАЦИЯ ТОВАРОВ
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        button.classList.add('active');
        const filter = button.dataset.filter;
        // Фильтруем товары
        const filteredProducts = filter === 'all' 
            ? products 
            : products.filter(product => product.category === filter);
        renderProducts(filteredProducts);
    });
});

// 7. РАБОТА С КОРЗИНОЙ
function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    const existingItem = cart.find(item => item.id == productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    // Визуальная обратная связь
    const button = document.querySelector(`[data-id="${productId}"]`);
    const originalText = button.textContent;
    button.textContent = 'Добавлено!';
    button.disabled = true;
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

function updateCartUI() {
    // Обновляем счетчик
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    // Обновляем модальное окно корзины
    renderCartItems();
    // Обновляем итоговую сумму
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = totalPrice;
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Корзина пуста</p>';
        return;
    }
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>${item.price} руб. × ${item.quantity} = ${item.price * item.quantity} руб.</p>
            </div>
            <div>
                <button class="btn-decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="btn-increase" data-id="${item.id}">+</button>
                <button class="btn-remove" data-id="${item.id}">×</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    // Вешаем обработчики на кнопки в корзине
    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
    });
    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
    });
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
    });
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id != productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// 8. УПРАВЛЕНИЕ МОДАЛЬНЫМ ОКНОМ КОРЗИНЫ
cartToggle.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

modalClose.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Оформление заказа (упрощенно)
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    alert(`Заказ оформлен! Сумма: ${cartTotalPrice.textContent} руб. Спасибо!`);
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
    cartModal.style.display = 'none';
});

// 9. РАБОТА С ТАБЛИЦЕЙ (ОБЯЗАТЕЛЬНЫЙ ЭЛЕМЕНТ)
function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.brand}</td>
            <td>${item.category}</td>
            <td>${item.volume}</td>
            <td>${item.price}</td>
            <td>${item.rating} ★</td>
            <td><button class="btn-table-add" data-id="${item.id}">В корзину</button></td>
        `;
        tableBody.appendChild(row);
    });
    // Вешаем обработчики на кнопки в таблице
    document.querySelectorAll('.btn-table-add').forEach(btn => {
        btn.addEventListener('click', (e) => addToCart(e.target.dataset.id));
    });
}

// Подсветка строк с высоким рейтингом
highlightBtn.addEventListener('click', () => {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const ratingCell = row.cells[5];
        const rating = parseFloat(ratingCell.textContent);
        if (rating >= 4.5) {
            row.classList.add('high-rated');
        } else {
            row.classList.remove('high-rated');
        }
    });
});

// Сортировка таблицы по цене
sortPriceBtn.addEventListener('click', () => {
    const sortedData = [...tableData].sort((a, b) => a.price - b.price);
    renderTable(sortedData);
});

// 10. ФОРМА ПОДПИСКИ (второй интерактивный сценарий)
subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = subscribeForm.email.value;
    // Имитация отправки
    formMessage.textContent = `Спасибо! Подписка для ${email} оформлена.`;
    formMessage.style.color = 'green';
    subscribeForm.reset();
    setTimeout(() => {
        formMessage.textContent = '';
    }, 3000);
});
