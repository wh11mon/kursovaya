'use strict';


//   КОРЗИНА
  
// Получить корзину из памяти браузера
function getCart() {
  var data = localStorage.getItem('laz_cart');
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

// Сохранить корзину в память браузера
function saveCart(items) {
  localStorage.setItem('laz_cart', JSON.stringify(items));
}

// Обновить счётчик товаров на иконке корзины
function updateBadge() {
  var items = getCart();
  var count = 0;
  for (var i = 0; i < items.length; i++) {
    count = count + items[i].qty;
  }
  var elems = document.querySelectorAll('.js-cart-count');
  for (var j = 0; j < elems.length; j++) {
    if (count > 0) {
      elems[j].textContent = '(' + count + ')';
    } else {
      elems[j].textContent = '';
    }
  }
}

// Добавить товар в корзину
function addToCart(id, name, price, image, material) {
  var items = getCart();

  // Ищем, есть ли уже такой товар
  var existing = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      existing = items[i];
    }
  }

  if (existing) {
    // Товар уже есть — увеличиваем количество
    existing.qty = existing.qty + 1;
  } else {
    // Товара нет — добавляем новый
    items.push({
      id: id,
      name: name,
      price: price,
      image: image,
      material: material,
      qty: 1
    });
  }

  saveCart(items);
  updateBadge();
  showToast('Добавлено в корзину');
}

// Форматировать цену: 145000 → "145 000 ₽"
function fmt(n) {
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

 //  ВСПЛЫВАЮЩЕЕ СООБЩЕНИЕ (TOAST)
 

function showToast(msg) {
  var el = document.getElementById('toast');

  // Если элемента нет на странице — создаём его
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.position = 'fixed';
    el.style.bottom = '28px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = '#1a1a1a';
    el.style.color = '#fff';
    el.style.padding = '12px 28px';
    el.style.fontSize = '13px';
    el.style.letterSpacing = '1px';
    el.style.zIndex = '9999';
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.25s';
    document.body.appendChild(el);
  }

  el.textContent = msg;
  el.style.opacity = '1';

  // Скрываем через 2.4 секунды
  clearTimeout(el.timer);
  el.timer = setTimeout(function() {
    el.style.opacity = '0';
  }, 2400);
}


//   АВТОРИЗАЦИЯ
  

// Получить данные пользователя из памяти браузера
function getUser() {
  var raw = localStorage.getItem('laz_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Сохранить пользователя
function saveUser(userData) {
  localStorage.setItem('laz_user', JSON.stringify(userData));
}

// Удалить пользователя (выход)
function logoutUser() {
  localStorage.removeItem('laz_user');
}

// Выход из аккаунта (вызывается из кнопки в HTML)
window.handleLogout = function() {
  logoutUser();
  showToast('Вы вышли из аккаунта');
  setTimeout(function() {
    location.reload();
  }, 600);
};

// Обновить навигацию: заменить "ВОЙТИ" на имя пользователя
function updateNavAuth() {
  var currentUser = getUser();
  if (!currentUser) return;

  // Находим все ссылки на страницу входа
  var links = document.querySelectorAll('a[href*="auth.html"]');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];

    // Создаём блок с именем и кнопкой выхода
    var container = document.createElement('span');
    container.style.display = 'inline-flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';

    var nameEl = document.createElement('span');
    nameEl.textContent = currentUser.name;
    nameEl.style.fontSize = '12px';
    nameEl.style.letterSpacing = '2px';
    nameEl.style.textTransform = 'uppercase';
    nameEl.style.color = 'var(--gray-dark)';

    var logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'ВЫЙТИ';
    logoutBtn.style.fontSize = '11px';
    logoutBtn.style.letterSpacing = '1px';
    logoutBtn.style.textTransform = 'uppercase';
    logoutBtn.style.color = 'var(--gray)';
    logoutBtn.style.border = '1px solid var(--border)';
    logoutBtn.style.padding = '4px 10px';
    logoutBtn.style.background = 'none';
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.onclick = window.handleLogout;

    container.appendChild(nameEl);
    container.appendChild(logoutBtn);
    link.replaceWith(container);
  }
}


// СТРАНИЦА КОРЗИНЫ

function initCartPage() {
  var cartWrap = document.getElementById('cart-wrap');
  if (!cartWrap) return; // Мы не на странице корзины

  var emptyMsg    = document.getElementById('cart-empty');
  var tableBlock  = document.getElementById('cart-table-wrap');
  var tableBody   = document.getElementById('cart-tbody');
  var totalEl     = document.getElementById('cart-total');

  // Нарисовать содержимое корзины
  function renderCart() {
    var items = getCart();

    if (items.length === 0) {
      // Корзина пуста
      if (emptyMsg)    emptyMsg.style.display    = 'block';
      if (tableBlock)  tableBlock.style.display  = 'none';
      return;
    }

    // Корзина не пуста
    if (emptyMsg)    emptyMsg.style.display    = 'none';
    if (tableBlock)  tableBlock.style.display  = 'block';

    if (!tableBody) return;

    // Строим таблицу товаров
    var rows = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      rows += '<tr>' +
        '<td>' +
          '<div class="cart-item-wrap">' +
            '<img src="' + item.image + '" alt="' + item.name + '">' +
            '<div>' +
              '<p class="cart-item-name">' + item.name + '</p>' +
              '<p class="cart-item-mat">' + item.material + '</p>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div class="qty-ctrl">' +
            '<button onclick="changeQty(\'' + item.id + '\', -1)">−</button>' +
            '<input type="number" value="' + item.qty + '" min="1" onchange="setQty(\'' + item.id + '\', +this.value)">' +
            '<button onclick="changeQty(\'' + item.id + '\', 1)">+</button>' +
          '</div>' +
        '</td>' +
        '<td class="cart-price">' + fmt(item.price) + '</td>' +
        '<td class="cart-price">' + fmt(item.price * item.qty) + '</td>' +
        '<td><button class="cart-remove" onclick="removeItem(\'' + item.id + '\')">×</button></td>' +
      '</tr>';
    }
    tableBody.innerHTML = rows;

    // Считаем итог
    var sum = 0;
    for (var j = 0; j < items.length; j++) {
      sum = sum + items[j].price * items[j].qty;
    }
    if (totalEl) totalEl.textContent = fmt(sum);

    updateBadge();
  }

  // Изменить количество товара
  window.changeQty = function(id, delta) {
    var items = getCart();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items[i].qty = items[i].qty + delta;
        if (items[i].qty < 1) items[i].qty = 1;
      }
    }
    saveCart(items);
    renderCart();
  };

  // Установить конкретное количество
  window.setQty = function(id, value) {
    var items = getCart();
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items[i].qty = value < 1 ? 1 : value;
      }
    }
    saveCart(items);
    renderCart();
  };

  // Удалить товар из корзины
  window.removeItem = function(id) {
    var items = getCart();
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].id !== id) {
        filtered.push(items[i]);
      }
    }
    saveCart(filtered);
    renderCart();
  };

  renderCart();
}


//СТРАНИЦА ОФОРМЛЕНИЯ ЗАКАЗА

function initCheckout() {
  var itemsWrap = document.getElementById('checkout-items');
  if (!itemsWrap) return;

  var cartItems = getCart();
  var orderTotal = 0;
  for (var i = 0; i < cartItems.length; i++) {
    orderTotal = orderTotal + cartItems[i].price * cartItems[i].qty;
  }

  // Показываем список товаров
  var html = '';
  for (var j = 0; j < cartItems.length; j++) {
    var item = cartItems[j];
    html += '<div class="checkout-item">' +
      '<img src="' + item.image + '" alt="' + item.name + '">' +
      '<div>' +
        '<p class="checkout-item-name">' + item.name + ' × ' + item.qty + '</p>' +
        '<p class="checkout-item-price">' + fmt(item.price * item.qty) + '</p>' +
      '</div>' +
    '</div>';
  }
  itemsWrap.innerHTML = html;

  var totalEl = document.getElementById('checkout-total');
  if (totalEl) totalEl.textContent = fmt(orderTotal);

  // Обработка формы заказа
  var form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      saveCart([]);
      updateBadge();
      form.style.display = 'none';
      var successBlock = document.getElementById('checkout-success');
      if (successBlock) successBlock.style.display = 'block';
    });
  }
}

// СТРАНИЦА ОДНОГО ТОВАРА (загружает данные из XML)

function initProduct() {
  var wrap = document.getElementById('product-detail');
  if (!wrap) return;

  // Берём id товара из адреса страницы: product.html?id=5
  var urlParams = new URLSearchParams(location.search);
  var productId = urlParams.get('id');
  if (!productId) return;

  // Загружаем XML с товарами
  fetch('../data/products.xml')
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      var parser = new DOMParser();
      var xml = parser.parseFromString(text, 'application/xml');

      // Ищем товар с нужным id
      var product = xml.querySelector('product[id="' + productId + '"]');
      if (!product) return;

      var catMap = {
        rings: 'Кольца',
        earrings: 'Серьги',
        necklaces: 'Колье',
        bracelets: 'Браслеты'
      };

      var productName  = product.querySelector('n').textContent;
      var productPrice = parseInt(product.querySelector('price').textContent);
      var productMat   = product.querySelector('material').textContent;
      var productDesc  = product.querySelector('description').textContent;
      var productImg   = product.querySelector('image').textContent;
      var catLabel     = catMap[product.getAttribute('category')] || '';

      document.title = productName + ' — ЛАЗУРИТ';

      // Строим HTML страницы товара
      wrap.innerHTML =
        '<div class="product-gallery">' +
          '<img src="' + productImg + '" alt="' + productName + '">' +
        '</div>' +
        '<div class="product-info">' +
          '<span class="product-info__tag">' + catLabel + '</span>' +
          '<h1 class="product-info__name">' + productName + '</h1>' +
          '<p class="product-info__price">' + fmt(productPrice) + '</p>' +
          '<p class="product-info__desc">' + productDesc + '</p>' +
          '<table class="spec-table">' +
            '<tr><td>Материал</td><td>' + productMat + '</td></tr>' +
            '<tr><td>Состояние</td><td>В наличии</td></tr>' +
          '</table>' +
          '<span class="size-label">Размер</span>' +
          '<div class="size-options" id="size-opts">' +
            '<button class="size-btn selected" onclick="selectSize(this)">15</button>' +
            '<button class="size-btn" onclick="selectSize(this)">16</button>' +
            '<button class="size-btn" onclick="selectSize(this)">17</button>' +
            '<button class="size-btn" onclick="selectSize(this)">18</button>' +
            '<button class="size-btn" onclick="selectSize(this)">19</button>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:10px">' +
            '<button class="btn" onclick="addToCart(\'' + productId + '\',\'' + productName.replace(/'/g, "\\'") + '\',' + productPrice + ',\'' + productImg + '\',\'' + productMat.replace(/'/g, "\\'") + '\')">Добавить в корзину</button>' +
            '<a class="btn btn--outline" href="catalog.html">← Назад в каталог</a>' +
          '</div>' +
        '</div>';
    });

  // Выбор размера
  window.selectSize = function(btn) {
    var allBtns = document.querySelectorAll('.size-btn');
    for (var i = 0; i < allBtns.length; i++) {
      allBtns[i].classList.remove('selected');
    }
    btn.classList.add('selected');
  };
}

//   СТРАНИЦА КАТАЛОГА (загружает товары из XML)

function initCatalog() {
  var grid = document.getElementById('catalog-grid');
  if (!grid) return;

  var urlParams = new URLSearchParams(location.search);
  var activeCat = urlParams.get('cat') || 'all';

  // Подсвечиваем активную кнопку фильтра
  var filterBtns = document.querySelectorAll('[data-cat]');
  for (var b = 0; b < filterBtns.length; b++) {
    var btn = filterBtns[b];
    if (btn.dataset.cat === activeCat) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', function() {
      var cat = this.dataset.cat;
      if (cat === 'all') {
        location.href = 'catalog.html';
      } else {
        location.href = 'catalog.html?cat=' + cat;
      }
    });
  }

  // Загружаем XML
  fetch('../data/products.xml')
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      var parser      = new DOMParser();
      var xml         = parser.parseFromString(text, 'application/xml');
      var nodeList    = xml.querySelectorAll('product');

      // Собираем в обычный массив и фильтруем по категории
      var productList = [];
      for (var i = 0; i < nodeList.length; i++) {
        var p = nodeList[i];
        if (activeCat === 'all' || p.getAttribute('category') === activeCat) {
          productList.push(p);
        }
      }

      // Обновляем счётчик
      var countEl = document.getElementById('catalog-count');
      if (countEl) countEl.textContent = productList.length + ' украшений';

      // Сортировка
      var sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', function() {
          renderProducts(productList, this.value);
        });
      }

      renderProducts(productList, 'default');
    });

  function renderProducts(productList, sortValue) {
    // Сортируем
    if (sortValue === 'asc') {
      productList.sort(function(a, b) {
        return parseInt(a.querySelector('price').textContent) - parseInt(b.querySelector('price').textContent);
      });
    } else if (sortValue === 'desc') {
      productList.sort(function(a, b) {
        return parseInt(b.querySelector('price').textContent) - parseInt(a.querySelector('price').textContent);
      });
    } else if (sortValue === 'name') {
      productList.sort(function(a, b) {
        return a.querySelector('n').textContent.localeCompare(b.querySelector('n').textContent, 'ru');
      });
    }

    // Строим карточки товаров
    var html = '';
    for (var i = 0; i < productList.length; i++) {
      var p      = productList[i];
      var id     = p.getAttribute('id');
      var name   = p.querySelector('n').textContent;
      var price  = parseInt(p.querySelector('price').textContent);
      var imgSrc = p.querySelector('image').textContent;

      html +=
        '<a class="product-card" href="product.html?id=' + id + '">' +
          '<div class="product-card__img">' +
            '<img src="' + imgSrc + '" alt="' + name + '" loading="lazy">' +
          '</div>' +
          '<p class="product-card__name">' + name + '</p>' +
          '<p class="product-card__price">' + fmt(price) + '</p>' +
        '</a>';
    }

    grid.innerHTML = html;
  }
}


//   СТРАНИЦА ОТЗЫВОВ

function initReviews() {
  var grid = document.getElementById('reviews-grid');
  if (!grid) return;

  // Получить отзывы написанные пользователями (из памяти браузера)
  function getLocalReviews() {
    var raw = localStorage.getItem('laz_reviews');
    if (raw) return JSON.parse(raw);
    return [];
  }

  function saveLocalReviews(list) {
    localStorage.setItem('laz_reviews', JSON.stringify(list));
  }

  // Загружаем отзывы из XML
  fetch('../data/products.xml')
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      var parser      = new DOMParser();
      var xml         = parser.parseFromString(text, 'application/xml');
      var reviewNodes = xml.querySelectorAll('review');

      // Собираем XML-отзывы в массив
      var xmlReviews = [];
      for (var i = 0; i < reviewNodes.length; i++) {
        var r = reviewNodes[i];
        xmlReviews.push({
          author: r.querySelector('author').textContent,
          rating: parseInt(r.querySelector('rating').textContent),
          text:   r.querySelector('text').textContent,
          date:   r.querySelector('date').textContent
        });
      }

      // Рисуем все отзывы (новые + из XML)
      function renderReviews() {
        var localList = getLocalReviews();

        // Новые отзывы идут первыми
        var allReviews = [];
        for (var j = localList.length - 1; j >= 0; j--) {
          allReviews.push(localList[j]);
        }
        for (var k = 0; k < xmlReviews.length; k++) {
          allReviews.push(xmlReviews[k]);
        }

        var html = '';
        for (var m = 0; m < allReviews.length; m++) {
          var rev = allReviews[m];

          // Строим строку из звёзд: ★★★★☆
          var stars = '';
          for (var s = 1; s <= 5; s++) {
            stars += s <= rev.rating ? '★' : '☆';
          }

          html +=
            '<article class="review-card">' +
              '<div class="review-stars">' + stars + '</div>' +
              '<p class="review-text">"' + rev.text + '"</p>' +
              '<div class="review-divider"></div>' +
              '<p class="review-author-name">' + rev.author + '</p>' +
              '<p class="review-date">' + rev.date + '</p>' +
            '</article>';
        }

        grid.innerHTML = html;
      }

      renderReviews();

      // Форма добавления отзыва
      var form = document.getElementById('review-form');
      if (!form) return;

      // Если пользователь вошёл — подставляем его имя
      var currentUser = getUser();
      var nameInput = form.querySelector('[name="author"]');
      if (currentUser && nameInput) {
        nameInput.value = currentUser.name;
        nameInput.readOnly = true;
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        var author   = form.querySelector('[name="author"]').value.trim();
        var text     = form.querySelector('[name="text"]').value.trim();
        var ratingEl = form.querySelector('[name="rating"]:checked');
        var rating   = ratingEl ? parseInt(ratingEl.value) : 5;

        if (!author || !text) {
          showToast('Заполните все поля');
          return;
        }

        // Формируем дату
        var now  = new Date();
        var date = now.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Сохраняем новый отзыв
        var localList = getLocalReviews();
        localList.push({
          id:     Date.now(),
          author: author,
          rating: rating,
          text:   text,
          date:   date
        });
        saveLocalReviews(localList);

        renderReviews();
        form.reset();

        // Возвращаем имя если пользователь вошёл
        if (currentUser && nameInput) nameInput.value = currentUser.name;

        showToast('Отзыв добавлен!');
        grid.scrollIntoView({ behavior: 'smooth' });
      });
    });
}


//   СТРАНИЦА ВХОДА / РЕГИСТРАЦИИ


function initAuth() {
  var loginForm    = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  if (!loginForm) return;

  // Если уже вошли — показываем профиль вместо формы
  var currentUser = getUser();
  if (currentUser) {
    var box = document.querySelector('.auth-box');
    if (box) {
      box.innerHTML =
        '<h1 class="auth-title">Добро пожаловать</h1>' +
        '<p class="auth-sub" style="margin-bottom:32px">Вы вошли как <strong>' + currentUser.name + '</strong></p>' +
        '<div style="display:flex;flex-direction:column;gap:12px;max-width:280px;margin:0 auto">' +
          '<a class="btn" href="catalog.html">Перейти в каталог</a>' +
          '<button class="btn btn--outline" onclick="handleLogout();location.reload()">Выйти из аккаунта</button>' +
        '</div>';
    }
    return;
  }

  // Обработка формы входа
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var email    = loginForm.querySelector('[type="email"]').value.trim();
    // Берём имя из email (часть до @)
    var username = email.split('@')[0];
    username = username.charAt(0).toUpperCase() + username.slice(1);
    saveUser({ name: username, email: email });
    showToast('Вход выполнен');
    setTimeout(function() {
      location.href = 'catalog.html';
    }, 700);
  });

  // Обработка формы регистрации
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var username = registerForm.querySelector('[type="text"]').value.trim();
      var email    = registerForm.querySelector('[type="email"]').value.trim();
      saveUser({ name: username, email: email });
      showToast('Аккаунт создан');
      setTimeout(function() {
        location.href = '../index.html';
      }, 700);
    });
  }

  // Переключение вкладок Вход / Регистрация
  var tabs = document.querySelectorAll('[data-auth-tab]');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function() {
      var tabName = this.dataset.authTab;

      // Скрываем все панели
      var panes = document.querySelectorAll('#login-pane, #register-pane');
      for (var j = 0; j < panes.length; j++) {
        panes[j].hidden = true;
      }

      // Показываем нужную панель
      var activePane = document.getElementById(tabName + '-pane');
      if (activePane) activePane.hidden = false;

      // Обновляем стили вкладок
      for (var k = 0; k < tabs.length; k++) {
        tabs[k].style.borderBottomColor = 'transparent';
        tabs[k].style.color = 'var(--gray)';
      }
      this.style.borderBottomColor = 'var(--black)';
      this.style.color = 'var(--black)';
    });
  }
}


//   БУРГЕР-МЕНЮ (мобильная навигация)


function initBurger() {
  var burger    = document.querySelector('.burger');
  var mobileNav = document.getElementById('mobile-nav');
  if (!burger || !mobileNav) return;

  // Клик по кнопке-гамбургеру
  burger.addEventListener('click', function() {
    var opened = burger.classList.toggle('open');
    if (opened) {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden'; // запрещаем прокрутку
    } else {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Клик по ссылке в меню — закрываем меню
  var navLinks = mobileNav.querySelectorAll('a');
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', function() {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Клик по фону меню — закрываем меню
  mobileNav.addEventListener('click', function(e) {
    if (e.target === mobileNav) {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}


//   ЗАПУСК — когда страница полностью загружена

document.addEventListener('DOMContentLoaded', function() {
  updateBadge();    // обновить счётчик корзины
  updateNavAuth();  // обновить навигацию если вошли
  initBurger();     // мобильное меню
  initCartPage();   // страница корзины
  initCheckout();   // страница оформления заказа
  initProduct();    // страница одного товара
  initCatalog();    // страница каталога
  initReviews();    // страница отзывов
  initAuth();       // страница входа
});
