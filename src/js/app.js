class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.items = this.sidebar.getElementsByClassName('sidebar_bd-item');
    }

    resetSelectedItems() {
        if (this.sidebar.classList.contains('sidebar_ft--reset-active')) {
            for (let item of this.items) {
                for (let checkBox of item.getElementsByClassName('sidebar_bd-item-cnt--checkbox')) {
                    checkBox.checked = false;
                }
            }

            for (let manufacturersBtn of this.sidebar.getElementsByClassName('sidebar_bd-item--btn')) {
                if (manufacturersBtn.classList.contains('sidebar_bd-item--btn-active')) {
                    manufacturersBtn.classList.remove('sidebar_bd-item--btn-active');
                }
            }

            product.selectedManufacturers = [];
            this.sidebar.classList.remove('sidebar_ft--reset-active');
        }
    }

    showManufacturersBtn(manufacturer, sidebarItem) {
        let counter = 0,
            selectedManufacturers = [];

        for (let item of this.sidebar.getElementsByClassName('sidebar_bd-item-cnt--manufacturer')) {
            if (item.getElementsByClassName('sidebar_bd-item-cnt--checkbox')[0].checked) {
                let manufacturerId = item.dataset.manufacturerId;
                counter = counter + product.getProductsByManufacturers(manufacturerId).length;

                selectedManufacturers[selectedManufacturers.length] = manufacturerId;
            }
        }

        let btnWrapper = sidebarItem.getElementsByClassName('sidebar_bd-item--btn')[0];
        btnWrapper.getElementsByClassName('sidebar-products-show-btn')[0].innerHTML = `<span>${counter} товаров</span><span>показать</span>`;

        for (let item of this.items) {
            if (item.getElementsByClassName('sidebar_bd-item--btn')[0].classList.contains('sidebar_bd-item--btn-active')) {
                item.getElementsByClassName('sidebar_bd-item--btn')[0].classList.remove('sidebar_bd-item--btn-active');
            }
        }

        if (counter !== 0) {
            if (!btnWrapper.classList.contains('sidebar_bd-item--btn-active')) {
                btnWrapper.classList.add('sidebar_bd-item--btn-active');
            }

            if (!this.sidebar.classList.contains('sidebar_ft--reset-active')) {
                this.sidebar.classList.add('sidebar_ft--reset-active');
            }
        }
        else {
            if (this.sidebar.classList.contains('sidebar_ft--reset-active')) {
                this.sidebar.classList.remove('sidebar_ft--reset-active');
            }
        }

        product.selectedManufacturers = selectedManufacturers;
    }

    openOrCloseItem(item) {
        item.classList.toggle('sidebar_bd-item-active');
    }
};

class Switch {
    constructor() {
        this.switches = document.getElementsByClassName('switch');
    }

    toggle() {
        this.switch.classList.toggle('switch-off');
    }
}

class InputCounter {
    constructor() {
        this.counters = document.getElementsByClassName('counter');
    }

    minus(input) {
        let value = Number(input.value);
        if (value > 1 && value !== 0) {
            input.value--;
        }
        else {
            input.value = 1;
        }
    }

    plus(input) {
        let value = Number(input.value);
        if (value < 1) {
            input.value = 1;
        }
        else {
            input.value++;
        }
    }

    setHandlers() {
        for (let counter of this.counters) {
            let inputEl = counter.getElementsByClassName('counter-input')[0];
            counter.getElementsByClassName('minus')[0].onclick = () => this.minus(inputEl);

            counter.getElementsByClassName('plus')[0].onclick = () => this.plus(inputEl);
        }
    }
}

class Product {
    constructor() {
        this.data = JSON.parse(new Ajax().Get('./js/data.json'));

        this.availability = document.getElementsByClassName('filter-availability')[0].checked;
        this.sort = document.getElementsByClassName('filter-sort')[0].value;
        this.show = document.getElementsByClassName('filter-show')[0].value;
        this.selectedManufacturers = [];
    }

    outputProducts() {
        if (this.data === undefined) {
            this.getData();
        }

        let contentBody = document.getElementsByClassName('content_bd')[0],
            products = [];

        this.sortBy();

        if (this.show === "30" || this.show === "50" || this.show === "100") {

            let data = this.data;
            if (this.selectedManufacturers.length > 0) {
                data = this.sortByManufacturers();
            }

            let i = 1;
            for (let item of data) {
                if (Number(this.show) < i) {
                    break;
                }

                if (this.availability) {
                    if (item.Stock !== 0) {
                        products[products.length] = this.getHtmlProduct(item);
                    }
                }
                else {
                    if (item.Stock === 0) {
                        products[products.length] = this.getHtmlProduct(item);
                    }
                }

                i++;
            }
        }

        contentBody.innerHTML = products.join('');

        new InputCounter().setHandlers();

        this.lazyLoad();
    }

    getData() {
        this.data = JSON.parse(new Ajax().Get('./js/data.json'));
    }

    sortByManufacturers() {
        let result = [];

        for (let product of this.data) {
            for (let manufacturerId of this.selectedManufacturers) {
                if (Number(manufacturerId) === Number(product.Manufacturer_ID)) {
                    result[result.length] = product;
                }
            }
        }

        return result;
    }

    sortBy() {
        switch (this.sort) {
            case "1":
                this.data.sort((a, b) => {
                    let nameA = a.Name.toLowerCase(),
                        nameB = b.Name.toLowerCase();

                    if (nameA < nameB)
                        return -1;

                    if (nameA > nameB)
                        return 1;

                    return 0;
                });
                break;

            case "2":
                this.data.sort((a, b) => {
                    let nameA = a.Name.toLowerCase(),
                        nameB = b.Name.toLowerCase();

                    if (nameA < nameB)
                        return 1;

                    if (nameA > nameB)
                        return -1;

                    return 0;
                });
                break;

            case "3":
                this.data.sort((a, b) => {
                    return a.Price - b.Price;
                });
                break;

            case "4":
                this.data.sort((a, b) => {
                    return b.Price - a.Price;
                });
                break;
        }
    }

    getProductsByManufacturers(manufacturerId) {
        let result = [];
        for (let product of this.data) {
            if (Number(product.Manufacturer_ID) === Number(manufacturerId)) {
                result[result.length] = product;
            }
        }
        return result;
    }

    getHtmlProduct(data) {
        return `<div class="content_bd-item" data-product-manufacture-id="${data.Manufacturer_ID}"><div class="col"><div class="content_bd-item--photo"><img class="content_bd-item--photo-hidden" src="" data-img-src="${data.Image}"></div><div class="content_bd-item--desc"><a class="title" href="#"> ${data.Name} </a><a class="city"><img class="city--img" src="${data.logo}"><div>${data.Manufacturer}</div></a><div class="code">Артикул: <span>${data.Articul}</span></div></div></div><div class="content_bd-item--price"><div class="content_bd-item--price_hd"><div class="col retail"><div>${data.Price} <span>P</span></div><div class="internet-price">Интернет-цена</div></div></div><div class="content_bd-item--price_bd"><div class="col availability"><div class="txt"><span>На складе:</span><span><b>${data.Stock} шт.</b></span></div></div><div class="col"><div class="counter"><button class="counter-btn minus" type="button">-</button><input class="counter-input" min="1" value="1" type="number"><button class="counter-btn plus" type="button">+</button></div><button class="cart-btn" type="button">В корзину</button></div></div></div></div>`;
    }

    changeSortAvailability(switchEl) {
        this.availability = switchEl.checked;
        this.outputProducts();
    }

    changeShowFilter(select) {
        this.show = select.value;
        this.outputProducts();
    }

    changeSortFilter(select) {
        this.sort = select.value;
        this.outputProducts();
    }

    lazyLoad() {
        let clientHeight = document.documentElement.clientHeight,
            hiddenImages = document.getElementsByClassName('content_bd-item--photo-hidden');

        for (let i = 0; hiddenImages.length > i; i++) {
            if (clientHeight >= hiddenImages[i].getBoundingClientRect().y) {
                hiddenImages[i].setAttribute('src', hiddenImages[i].dataset.imgSrc);
                hiddenImages[i].classList.remove('content_bd-item--photo-hidden');

                i--;
            }
        }
    }
}

class Ajax {

    // TODO: Реализовать с помощью fetch js

    Get(method) {
        let xhr = this.XHR();

        xhr.open('GET', method, false);
        xhr.send();

        if (xhr.status !== 200) {
            console.log("Ошибка" + this.status);
        }
        else {
            return xhr.responseText;
        }
    }

    XHR() {
        return new XMLHttpRequest();
    }
}


let product = new Product();
document.addEventListener('DOMContentLoaded', () => {
    let contentHeader = document.getElementById('contentHeader');

    // Получает и выводит товары
    product.outputProducts();

    // Вешает обработчик на кнопки сайдбара
    let sidebarCl = new Sidebar();
    for (let sidebarItem of sidebarCl.items) {
        sidebarItem.getElementsByClassName('sidebar_bd-item--title')[0].onclick = () => sidebarCl.openOrCloseItem(sidebarItem);

        for (let manufacturer of sidebarItem.getElementsByClassName('sidebar_bd-item-cnt--manufacturer')) {
            manufacturer.onclick = () => sidebarCl.showManufacturersBtn(manufacturer, sidebarItem);
        }

        for (let productShowBtn of sidebarCl.sidebar.getElementsByClassName('sidebar-products-show-btn')) {
            productShowBtn.onclick = () => product.outputProducts();
        }
    }
    sidebarCl.sidebar.getElementsByClassName('sidebar_ft--reset')[0].onclick = () => sidebarCl.resetSelectedItems();

    // Вешает обработчик на кнопки счетчиков
    new InputCounter().setHandlers();

    // Вешает обработчик на select filter-availability
    let filterSortAvailability = contentHeader.getElementsByClassName('filter-availability')[0];
    filterSortAvailability.onchange = () => product.changeSortAvailability(filterSortAvailability);

    // Вешает обработчик на select filter-sort
    let filterSortSelect = contentHeader.getElementsByClassName('filter-sort')[0];
    filterSortSelect.onchange = () => product.changeSortFilter(filterSortSelect);

    // Вешает обработчик на select filter-show
    let filterShowSelect = contentHeader.getElementsByClassName('filter-show')[0];
    filterShowSelect.onchange = () => product.changeShowFilter(filterShowSelect);

    // Вешает обработчик на тумблер
    let switchCl = new Switch();
    for (let switchItem of switchCl.switches) {
        switchItem.getElementsByClassName('switch-box')[0].addEventListener('click', {
            handleEvent: switchCl.toggle, switch: switchItem
        });
    }

    // Вешает обработчик события sroll на document для ленивой загрузки
    document.onscroll = () => product.lazyLoad();
});