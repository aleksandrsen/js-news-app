class Http {
    constructor() {
        this.apiKey = 'b09139bfceb545c4a56068e424f433a7';
    }

    static getNewsBy(url) {
        return new Promise(((resolve, reject) => {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        resolve(data);
                    } else {
                        reject(data.message)
                    }
                })
                .catch(err => reject(err));
        }));
    }

    getNewsByCountry(countryCode, category) {
        return Http.getNewsBy(`https://newsapi.org/v2/top-headlines?country=${countryCode}&category=${category || 'general'}&pageSize=100&apiKey=${this.apiKey}`);
    }

    getNewsByResource(resourceCode) {
        return Http.getNewsBy(`https://newsapi.org/v2/top-headlines?sources=${resourceCode}&apiKey=${this.apiKey}`);
    }

    getNewsByQuery(query) {
        return Http.getNewsBy(`https://newsapi.org/v2/everything?q=${query}&apiKey=${this.apiKey}`);
    }

    async getFlag(country) {
        let resUrl;
        let data = await fetch('https://restcountries.eu/rest/v2/all');
        let countries = await data.json();

        let res = countries.forEach(countryItem => {
            if (country.toLowerCase() === countryItem.name.toLowerCase()) {
                resUrl = countryItem.flag;
            }
        });
        return resUrl || 'notFoundFlag';
    }
}

class DB {
    constructor() {
    };

    static async postTemplate(url, data) {
        let response = await fetch(`/${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        let res = response.json();
        return res;
    }

    async addToFavoriteToDb(newsItem) {
        return DB.postTemplate('addToFavorite', newsItem);
    }

    async removeFromFavoriteFromDb(id) {
        return DB.postTemplate('removeFromFavorite', {id});
    }

    async getFavoriteNewsFromDb() {
        let response = await fetch('/get-favorite-news');
        let res = await response.json();
        return res;
    };
}

class UI {
    constructor(selector) {
        this.newsContainer = document.querySelector(selector);
        this.timers = [];
    }

    static formatDate(dateString) {
        const date = new Date(dateString);

        let formatter = new Intl.DateTimeFormat("ru", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        });
        return formatter.format(date);
    }

    static formatAuthor(author) {
        if (!author) return '......';
        return author.length < 28 ? author : author.slice(0, 25) + '.....';
    }

    static clearTimeout() {
        ui.timers.forEach(timerId => clearTimeout(timerId));
        ui.timers = [];
    }

    showNews(news) {
        let timeOut = 0;
        if (news.length <= 3) {
            document.body.style.overflowY = 'scroll';
            setTimeout(() => {
                document.body.style.overflowY = 'auto';
            }, 1200)
        } else if (news.length > 3) {
            document.body.style.overflowY = 'scroll';
        }

        news.forEach((newsItem, idx) => {
            let {
                author,
                description,
                publishedAt,
                source,
                title,
                url,
                urlToImage
            } = newsItem;

            if (!author && !description && !title) return;

            let timerID = setTimeout(() => {
                const template = `
                 <div class="col-4 animated fadeInUp fast">
                    <div class="card news-item text-white bg-primary">
                        <div class="close-description-icon">&#10005;</div>
                        <div class="description">
                            <h3 class="title">${title}</h3>
                            <p class="content">${description}</p>
                        </div>
                        <!--/description-->
                        <div class="card-header">
                            <img
                                src="${idx < 9 ? urlToImage : 'img/lazy-grey.jpg'}"
                                data-src="${urlToImage || 'img/img-error.jpg'}" alt="${title}"
                                onerror="this.src = 'img/img-error.jpg'"
                            >
                            <h3 class="card-title">
                               ${title.length < 130 ? title : title.slice(0, 127) + '...'}
                            </h3>
                            <div class="news-info">
                                <span>
                                    <a href="http://${source.name}" target="_blank">
                                        ${UI.formatAuthor(author)}
                                    </a>
                                </span>
                                <span>${UI.formatDate(publishedAt)}</span>
                            </div>
                            <!--/news-info-->
                        </div>
                        <!--/card-header-->
                        <div class="card-body">
                            <div class="left">
                                <a href="${url}" class="btn btn-primary" target="_blank">View in source</a>                            
                                <button type="button" class="btn btn-primary read-more">Read more</button>
                            </div>
                            <!--/left-->
                            <div class="right">
                                <i class="far fa-copy"
                                   data-toggle="tooltip"
                                   data-placement="top"
                                   title="Copy link">
                                </i>
                                <i class="${newsItem._id ? 'fas' : 'far'} fa-heart"
                                    ${newsItem._id ? `data-base-Id=${newsItem._id}` : ''}
                                   data-toggle="tooltip"
                                   data-placement="top"
                                   title="Add to favorite">
                                   <input type="text" value="${url}" id="copy-text">
                                </i>
                            </div>
                            <!--/right-->
                        </div>
                        <!--/card-body-->
                    </div>
                    <!--/card-->
                </div>
                <!--/col-4-->`;

                this.newsContainer.insertAdjacentHTML('beforeend', template);

                $('[data-toggle="tooltip"]').tooltip();

            }, timeOut);

            timeOut += 300;
            this.timers.push(timerID);
        });
    }

    cleanNewsContainer() {
        UI.clearTimeout(this.timers);
        this.newsContainer.innerHTML = '';
    }

    showAlert(type, message) {
        let messageType = type.toLowerCase();

        const template = `
            <div class="alert alert-dismissible alert-${messageType} animated">
                ${messageType === "info" ? '' : '<button type="button" class="close" data-dismiss="alert">&#10005;</button>'}
                ${messageType === "info" ? '' : `<p class=\"alert-header\">${messageType === 'warning' ? 'Error' : type}</p>`}
                <p class="alert-content">${message}</p>
            </div>`;

        const oldAlert = document.querySelector('.alert');
        if (oldAlert) oldAlert.remove();

        document.body.insertAdjacentHTML('afterbegin', template);

        const alert = document.querySelector('.alert');
        alert.classList.add('fadeInUp');

        alert.addEventListener('animationend', show);

        function show() {
            alert.classList.replace('fadeInUp', 'fadeOutUp');
            alert.classList.add('delay-2s');
            alert.removeEventListener('animationend', show);
            alert.addEventListener('animationend', remove);
        }

        function remove() {
            alert.remove();
            alert.removeEventListener('animationend', remove);
        }
    }

    showSpinner() {
        let template = `
        <div class="lds-css ng-scope">
            <div class="lds-spin">
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
            </div>
        </div>`;

        this.newsContainer.insertAdjacentHTML('afterbegin', template);
    }

    showModal(e) {
        let countNews = document.querySelectorAll('.news-container .card') || 0;
        $('.modal').modal('show');
        if (countNews.length > 3) {
            document.body.style.paddingRight = '0';
        }
    }

    hideModal(e) {
        $('.modal').modal('hide');
    }

    returnSmallSpinner() {
        return (`
        <div class="lds-css ng-scope">
            <div class="lds-spin">
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        `);
    }

    deleteSmallSpinner() {
        const smallSpinner = document.querySelector('header .searching-list .lds-css');
        if (!smallSpinner) return;
        smallSpinner.remove();
    }
}

class Auth {
    constructor() {}

    static async postTemplate(url, data) {
        let response = await fetch(`${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        let res = response.json();
        return res;
    }

    async logIn(email, password) {
        return Auth.postTemplate('/login', {email, password});
    }

    async logOut() {
        let response = await fetch('/logOut');
        let res = await response.json();
        return res;
    }

    async register(name, email, password) {
        return Auth.postTemplate('/register', {name, email, password});
    }

    async resetPassword(email) {
        return Auth.postTemplate('/reset', {email});
    }

    async changePassword(userId, password, token) {
        return Auth.postTemplate('/password', {userId, password, token});
    }
}

class formValidator {
    constructor () {
        this.result = [];
    }

    checkFields(obj) {
        this.result = [];

        for (let name in obj) {
            let val = obj[name];
            // if we check a lot of field with one type
            if (Array.isArray(val)) {
                let arr = val;

                arr.forEach(item => {
                    this.result.push(this[name](item));
                })

            } else {
                // if we check one field with this type
                this.result.push(this[name](val));
            }
        }

        return this.checkResult();
    }

    checkResult() {
        let i = 0;
        this.result.forEach(item => {
            if (item) i++;
        });

        if (i === this.result.length) {
            return true;
        }
        return false;
    }

    text(elem) {
        let value = elem.value;
        if (value.length === 0) {
            this.showValidateError(elem, 'This field must be fill!');
            return false;
        } else if (value.length < 3) {
            this.showValidateError(elem, 'Name should have at least 3 characters!');
            return false;
        }
        this.removeValidateError(elem);
        return true;
    }

    email(elem) {
        let value = elem.value;
        let regExp = new RegExp('[-.\\w]+@([\\w-]+\\.)+[\\w-]', 'g');
        let res = value.match(regExp);
        if (value.length === 0) {
            this.showValidateError(elem, 'This field must be fill!');
            return false;
        } else if (!res) {
            this.showValidateError(elem, 'Please type correct email!');
            return false;
        }
        this.removeValidateError(elem);
        return true;
    }

    password(elem) {
        let value = elem.value;
        if (value.length === 0) {
            this.showValidateError(elem, 'This field must be fill!');
            return false;
        } else if (value.length < 6) {
            this.showValidateError(elem, 'Password should have at least 6 characters!');
            return false;
        }
        this.removeValidateError(elem);
        return true;
    }

    showValidateError(elem, message) {
        // delete old error message
        this.removeValidateError(elem);

        // add new error message
        let formGroup = elem.closest('.form-group');
        let span = document.createElement('span');

        elem.style.borderColor = 'red';
        span.className = 'validate-error';
        span.textContent = message;
        span.style.cssText = `
             position: absolute;
             top: 100%;
             left: 0;
             color: #ff9900;
             font-size: 13px;
             font-style: italic;
             line-height: 1.4em;
             z-index: 101;
            `;

        formGroup.appendChild(span);
    }

    removeValidateError(elem) {
        let validateErrorElem = elem.closest('.form-group').querySelector('.validate-error');
        if (!validateErrorElem) return;
        elem.style.borderColor = '#caff00';
        validateErrorElem.remove();
    }
}

// Init classes
const http = new Http();
const db = new DB();
const ui = new UI('.row.news-container');
const auth = new Auth();
const validateForm = new formValidator();

// Global variables
let currentNews;
const countriesArr = [
    {
        name: 'Argentina',
        code: 'ar',
        id: 'country'
    },
    {
        name: 'Australia',
        code: 'au',
        id: 'country'
    },
    {
        name: 'Austria',
        code: `at`,
        id: 'country'
    },
    {
        name: 'Belgium',
        code: 'be',
        id: 'country'
    },
    {
        name: 'Brazil',
        code: 'br',
        id: 'country'
    },
    {
        name: 'Bulgaria',
        code: 'bg',
        id: 'country'
    },
    {
        name: 'Canada',
        code: 'ca',
        id: 'country'
    },
    {
        name: 'China',
        code: 'cn',
        id: 'country'
    },
    {
        name: 'Colombia',
        code: 'co',
        id: 'country'
    },
    {
        name: 'Cuba',
        code: 'cu',
        id: 'country'
    },
    {
        name: 'Czech Republic',
        code: 'cz',
        id: 'country'
    },
    {
        name: 'Egypt',
        code: 'eg',
        id: 'country'
    },
    {
        name: 'France',
        code: 'fr',
        id: 'country'
    },
    {
        name: 'Germany',
        code: 'de',
        id: 'country'
    },
    {
        name: 'Greece',
        code: 'gr',
        id: 'country'
    },
    {
        name: 'Hong Kong',
        code: 'hk',
        id: 'country'
    },
    {
        name: 'Hungary',
        code: 'hu',
        id: 'country'
    },
    {
        name: 'India',
        code: 'in',
        id: 'country'
    },
    {
        name: 'Indonesia',
        code: 'id',
        id: 'country'
    },
    {
        name: 'Ireland',
        code: 'ie',
        id: 'country'
    },
    {
        name: 'Israel',
        code: 'il',
        id: 'country'
    },
    {
        name: 'Italy',
        code: 'it',
        id: 'country'
    },
    {
        name: 'Japan',
        code: 'jp',
        id: 'country'
    },
    {
        name: 'Latvia',
        code: 'lv',
        id: 'country'
    },
    {
        name: 'Lithuania',
        code: 'lt',
        id: 'country'
    },
    {
        name: 'Malaysia',
        code: 'my',
        id: 'country'
    },
    {
        name: 'Mexico',
        code: 'mx',
        id: 'country'
    },
    {
        name: 'Morocco',
        code: 'ma',
        id: 'country'
    },
    {
        name: 'Netherlands',
        code: 'nl',
        id: 'country'
    },
    {
        name: 'New Zealand',
        code: 'nz',
        id: 'country'
    },
    {
        name: 'Nigeria',
        code: 'ng',
        id: 'country'
    },
    {
        name: 'Norway',
        code: 'no',
        id: 'country'
    },
    {
        name: 'Philippines',
        code: 'ph',
        id: 'country'
    },
    {
        name: 'Poland',
        code: 'pl',
        id: 'country'
    },
    {
        name: 'Portugal',
        code: 'pt',
        id: 'country'
    },
    {
        name: 'Romania',
        code: 'ro',
        id: 'country'
    },
    {
        name: 'Russia',
        code: 'ru',
        id: 'country'
    },
    {
        name: 'Saudi Arabia',
        code: 'sa',
        id: 'country'
    },
    {
        name: 'Serbia',
        code: 'rs',
        id: 'country'
    },
    {
        name: 'Singapore',
        code: 'sg',
        id: 'country'
    },
    {
        name: 'Slovakia',
        code: 'sk',
        id: 'country'
    },
    {
        name: 'Slovenia',
        code: 'si',
        id: 'country'
    },
    {
        name: 'South Africa',
        code: 'za',
        id: 'country'
    },
    {
        name: 'South Korea',
        code: 'kr',
        id: 'country'
    },
    {
        name: 'Sweden',
        code: 'se',
        id: 'country'
    },
    {
        name: 'Switzerland',
        code: 'ch',
        id: 'country'
    },
    {
        name: 'Taiwan',
        code: 'tw',
        id: 'country'
    },
    {
        name: 'Thailand',
        code: 'th',
        id: 'country'
    },
    {
        name: 'Turkey',
        code: 'tr',
        id: 'country'
    },
    {
        name: 'UAE',
        code: 'ae',
        id: 'country'
    },
    {
        name: 'Ukraine',
        code: 'ua',
        id: 'country'
    },
    {
        name: 'United Kingdom',
        code: 'gb',
        id: 'country'
    },
    {
        name: 'United States',
        code: 'us',
        id: 'country'
    },
    {
        name: 'Venuzuela',
        code: 've',
        id: 'country'
    }
];
const categoriesArr = [
    {
        name: 'General',
        code: 'general',
    },
    {
        name: 'Business',
        code: 'business'
    },
    {
        name: 'Entertainment',
        code: 'entertainment'
    },
    {
        name: 'Health',
        code: 'health'
    },
    {
        name: 'Science',
        code: 'science'
    },
    {
        name: 'Sports',
        code: 'sports'
    },
    {
        name: 'Technology',
        code: 'technology'
    },
];
const resourcesArr = [
    {name: 'ABC News', code: 'abc-news', id: 'resource'},
    {name: 'Ars Technica', code: 'ars-technica', id: 'resource'},
    {name: 'Ary News', code: 'ary-news', id: 'resource'},
    {name: 'Associated Press', code: 'associated-press', id: 'resource'},
    {name: 'BBC News', code: 'bbc-news', id: 'resource'},
    {name: 'BBC Sport', code: 'bbc-sport', id: 'resource'},
    {name: 'Bloomberg', code: 'bloomberg', id: 'resource'},
    {name: 'Business Insider', code: 'business-insider', id: 'resource'},
    {name: 'CBC News', code: 'cbc-news', id: 'resource'},
    {name: 'CNN', code: 'cnn', id: 'resource'},
    {name: 'Crypto Coins News', code: 'crypto-coins-news', id: 'resource'},
    {name: 'Daily Mail', code: 'daily-mail', id: 'resource'},
    {name: 'Entertainment Weekly', code: 'entertainment-weekly', id: 'resource'},
    {name: 'Financial Post', code: 'financial-post', id: 'resource'},
    {name: 'Focus', code: 'focus', id: 'resource'},
    {name: 'Fortune', code: 'fortune', id: 'resource'},
    {name: 'Fox News', code: 'fox-news', id: 'resource'},
    {name: 'Fox Sports', code: 'fox-sports', id: 'resource'},
    {name: 'Google News', code: 'google-news', id: 'resource'},
    {name: 'Google News (Argentina)', code: 'google-news-ar', id: 'resource'},
    {name: 'Google News (Australia)', code: 'google-news-au', id: 'resource'},
    {name: 'Google News (Brasil)', code: 'google-news-br', id: 'resource'},
    {name: 'Google News (Canada)', code: 'google-news-ca', id: 'resource'},
    {name: 'Google News (France)', code: 'google-news-fr', id: 'resource'},
    {name: 'Google News (India)', code: 'google-news-in', id: 'resource'},
    {name: 'Google News (Israel)', code: 'google-news-is', id: 'resource'},
    {name: 'Google News (Italy)', code: 'google-news-it', id: 'resource'},
    {name: 'Google News (Russia)', code: 'google-news-ru', id: 'resource'},
    {name: 'Google News (Saudi Arabia)', code: 'google-news-sa', id: 'resource'},
    {name: 'Google News (UK)', code: 'google-news-uk', id: 'resource'},
    {name: 'Hacker News', code: 'hacker-news', id: 'resource'},
    {name: 'Independent', code: 'independent', id: 'resource'},
    {name: 'Lenta', code: 'lenta', id: 'resource'},
    {name: 'Marca', code: 'marca', id: 'resource'},
    {name: 'Mirror', code: 'mirror', id: 'resource'},
    {name: 'National Geographic', code: 'national-geographic', id: 'resource'},
    {name: 'National Review', code: 'national-review', id: 'resource'},
    {name: 'NBC News', code: 'nbc-news', id: 'resource'},
    {name: 'News24', code: 'news24', id: 'resource'},
    {name: 'New Scientist', code: 'new-scientist', id: 'resource'},
    {name: 'Politico', code: 'politico', id: 'resource'},
    {name: 'The New York Times', code: 'the-new-york-times', id: 'resource'},
    {name: 'The Wall Street Journal', code: 'the-wall-street-journal', id: 'resource'},
    {name: 'The Washington Post', code: 'the-washington-post', id: 'resource'},
    {name: 'The Washington Times', code: 'the-washington-times', id: 'resource'}
];
const countriesResourcesArr = countriesArr.concat(resourcesArr);

// Init elements
const newsContainer = document.querySelector('.row.news-container');
const showModalBtn = $('.show-modal-wrapper');
const closeModalBtn = $('.close-icon-modal');

// Add events
// Load page events
window.addEventListener('load', e => {
    let isMainPage = document.querySelector('.navbar-nav .active.main');
    if (!isMainPage) return;
    makeList({
        arr: countriesArr,
        selector: '#country',
        selectedValue: 'ua',
        selectedText: 'Choose country'
    });
    makeList({
        arr: categoriesArr,
        selector: '#category',
        selectedValue: 'general',
        selectedText: 'Choose news category'
    });
    makeList({
        arr: resourcesArr,
        selector: '#resource',
        selectedValue: 'national-geographic',
        selectedText: 'Choose news resource'
    });
});

window.addEventListener('load', showFavoriteNews);

window.addEventListener('load', showImages);

// Lazy load event
window.addEventListener('scroll', showVisible);

// Auth events
document.addEventListener('submit', loginApp);

document.addEventListener('click', logOutApp);

document.addEventListener('submit', registerUser);

document.addEventListener('submit', resetPassword);

document.addEventListener('submit', changePassword);

document.addEventListener('click', togglePassword);

// Header input field events
document.addEventListener('input', displayMatches);

document.addEventListener('input', searching);

document.addEventListener('keyup', e => setSearchingListValue(e));

document.addEventListener('submit', searchNewsByRequest);

document.addEventListener('click', closeSearchingList);

// Modal events
showModalBtn.on('click', ui.showModal);

closeModalBtn.on('click', ui.hideModal);

// Search news by country and news resource
document.body.addEventListener('submit', searchNewsByCountry);

document.body.addEventListener('submit', searchNewsByNewsResource);

// Card events
newsContainer.addEventListener('click', toggleFavorite);

newsContainer.addEventListener('click', copyLink);

newsContainer.addEventListener('click', toggleCardDescription);


// Events handlers
// Show and check favorite news
async function showFavoriteNews(e) {
    const isFavoriteNewsActive = document.querySelector(('.navbar-nav .favorite-news.active'));
    if (!isFavoriteNewsActive) return;
    try {
        ui.showSpinner();
        const favoriteNews = await db.getFavoriteNewsFromDb();
        if (!favoriteNews.length) {
            ui.cleanNewsContainer();
            document.querySelector('.news-container').innerHTML = '<h1>You don\'t have favorite news yet!';
            return;
        }
        ui.cleanNewsContainer();
        currentNews = favoriteNews;
        ui.showNews(favoriteNews);
    } catch (e) {
        ui.showAlert('Warning', 'We can\'t find your favorite news:' + e.message);
    }
}

async function checkFavoriteNews(length) {
    let time = length * 300 + 5000;

    let timerId = setInterval(async () => {
        try {
            const favoriteNews = await db.getFavoriteNewsFromDb();
            let titles = document.querySelectorAll('.card .description .title');
            titles.forEach(title => {
                let text = title.textContent;
                favoriteNews.forEach(favoriteNewsItem => {
                    if (favoriteNewsItem.title === text) {
                        let heart = title.closest('.card').querySelector('.fa-heart');
                        heart.classList.replace('far', 'fas');
                        heart.setAttribute('data-base-Id', favoriteNewsItem._id);
                    }
                })
            })
        } catch (e) {
            ui.showAlert('Warning', 'We can\'t check your favorite news!');
        }
    }, 2000);

    setTimeout(() => clearInterval(timerId), time);
}

// Header form handlers
function closeSearchingList(e) {
    const target = e.target;
    if (target.closest('.searching-list') || target.closest('.search-news-form .btn.btn-secondary')) return;
    const searchingList = document.querySelector('.searching-list');
    const searchingInput = document.querySelector('header input.form-control');
    if (!searchingList) return;
    searchingInput.value = '';
    searchingList.innerHTML = '';
}

function findMatches(wordToMatch, arr) {
    return arr.filter(item => {
        const regex = new RegExp(wordToMatch, 'gi');
        return item.name.match(regex);
    })
}

function displayMatches(e) {
    let target = e.target;
    if (!target.closest('header input.form-control')) return;

    const input = document.querySelector('header input.form-control');
    const searchingList = document.querySelector('header .searching-list');
    const matchArray = findMatches(input.value, countriesResourcesArr);

    const html = matchArray.map(({name, code, id}) => {
        return `
        <li data-name = "${name}" data-code = "${code}" data-id = "${id}">
            ${name} ${id === 'resource' ? '<span class="hint">resource</span>' : ui.returnSmallSpinner()}
        </li>
        `;
    }).slice(0, 10).join('');

    searchingList.innerHTML = html;

    showCountryFlags(matchArray);
}

function showCountryFlags(arr) {
    arr.forEach(({name, id}, idx) => {
        if (id === "resource") return;
        if (idx > 10) return;

        http.getFlag(name)
            .then(url => {
                let elem = document.querySelector(`.searching-list li[data-name="${name}"]`);
                if (!elem) return;
                ui.deleteSmallSpinner();
                let oldImgOrSpan = elem.querySelector('img') || elem.querySelector('span.hint');
                if (oldImgOrSpan) return;

                if (url === 'notFoundFlag') {
                    elem.insertAdjacentHTML('beforeend', '<span class="hint">country</span>');
                } else {
                    elem.insertAdjacentHTML('beforeend', `<img src="${url}" alt="">`);
                }
            })
            .catch(err => console.log(err))
    })
}

function searching(e) {
    let target = e.target;
    if (!target.closest('header input.form-control')) return;
    const searchingInput = document.querySelector('header input.form-control');
    const searchNewsForm = document.querySelector('header .search-news-form');

    let lis = document.querySelectorAll('.searching-list li');
    if (!lis[0]) return;
    let i = 0;
    let max = lis.length;

    // highLight active item
    lis[0].classList.add('active');
    lis.forEach(li => {
        li.addEventListener('mouseenter', e => {
            let target = e.target;
            for (let j = 0; j < lis.length; j++) {
                lis[j].classList.remove('active');
            }
            target.classList.add('active');

            let activeIdx = [].findIndex.call(lis, (li) => {
                return li.classList.contains('active');
            });

            i = activeIdx;
        });

        li.addEventListener('click', (e) => {
            setSearchingListValue(e);
            let event = new Event('submit');
            document.dispatchEvent(event);
        });
    });

    // use arrow to navigate in searching list
    searchingInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 40) e.preventDefault();
        if (e.keyCode === 38) e.preventDefault();

        if (e.keyCode === 40) {
            lis[i].classList.remove('active');
            i++;
            if (i >= max) i = 0;
            lis[i].classList.add('active');
        } else if (e.keyCode === 38) {
            lis[i].classList.remove('active');
            i--;
            if (i < 0) i = max - 1;
            lis[i].classList.add('active');
        }
    });
}

function setSearchingListValue(e) {
    let target = e.target;
    if (!(target.closest('header input.form-control') || target.closest('header .searching-list li'))) return;
    let active = document.querySelector('.searching-list li.active');
    const searchingInput = document.querySelector('header input.form-control'); // header
    if (active) {
        searchingInput.setAttribute('data-code', active.dataset.code);
        searchingInput.setAttribute('data-id', active.dataset.id);
    } else {
        searchingInput.setAttribute('data-code', '');
        searchingInput.setAttribute('data-id', '');
    }

}

function searchNewsByRequest(e) {
    e.preventDefault();
    let target = e.target;
    if (!e.isTrusted) {
        find();
        return;
    }

    if (!target.closest('header .search-news-form')) return;

    find();

    function find() {
        const searchingInput = document.querySelector('header input.form-control');
        const searchingList = document.querySelector('header .searching-list');
        let query = searchingInput.dataset.code || searchingInput.value;
        let id = searchingInput.dataset.id;
        searchingList.innerHTML = '';
        searchingInput.value = '';
        searchingInput.setAttribute('data-code', '');
        searchingInput.setAttribute('data-id', '');
        searchingInput.blur();

        if (id === 'country') {
            searchHelper(e, http.getNewsByCountry, query, 'general');
        } else if (id === 'resource') {
            searchHelper(e, http.getNewsByResource, query);
        } else {
            searchHelper(e, http.getNewsByQuery, query);
        }
    }
}

// Modal handlers
function makeList({arr, selector, selectedValue, selectedText}) {
    const select = document.querySelector(selector);
    let result = arr.map((item, idx) => {
        if (idx === 0) {
            return `<option selected value =${selectedValue}>${selectedText}</option>`
        }
        return `<option value="${item.code}">${item.name}</option>`
    }).join();
    select.insertAdjacentHTML('afterbegin', result);
}

function searchHelper(e, func, ...args) {
    e.preventDefault();
    ui.cleanNewsContainer();
    ui.hideModal();
    ui.showSpinner();

    func.apply(http, args)
        .then(data => {
            currentNews = data.articles;
            ui.cleanNewsContainer();
            if (data.articles.length > 0) {
                ui.showNews(data.articles);
                checkFavoriteNews(data.articles.length);
                return;
            }
            ui.showAlert('Warning', 'We could\'nt find any news for this request!');
        })
        .catch(err => {
            ui.cleanNewsContainer();
            ui.showAlert('Warning', err);
        });
}

function searchNewsByCountry(e) {
    const target = e.target;
    if (!target.closest('#country-form')) return;
    const countryForm = document.querySelector('#country-form');
    const countryValue = countryForm.querySelector('#country').value;
    const categoryValue = countryForm.querySelector('#category').value;
    searchHelper(e, http.getNewsByCountry, countryValue, categoryValue);
    countryForm.reset();
}

function searchNewsByNewsResource(e) {
    const target = e.target;
    if (!target.closest('#source-form')) return;
    const newsSourceForm = document.querySelector('#source-form');
    const newsSourceValue = newsSourceForm.querySelector('#resource').value;
    searchHelper(e, http.getNewsByResource, newsSourceValue);
    newsSourceForm.reset();
}

// Lazy load handlers
function isVisible(elem) {
    let coords = elem.getBoundingClientRect();
    let windowHeight = document.documentElement.clientHeight;

    let extendedTop = -windowHeight;
    let extendedBottom = 2 * windowHeight;

    let topVisible = coords.top > extendedTop && coords.top < extendedBottom;
    let bottomVisible = coords.bottom < extendedBottom && coords.bottom > extendedTop;

    return topVisible || bottomVisible;
}

function showVisible() {
    for (let img of document.querySelectorAll('img')) {
        let realSrc = img.dataset.src;
        if (!realSrc) continue;

        if (isVisible(img)) {
            img.src = realSrc;
            img.dataset.src = '';
        }
    }
}

// News card handlers
function copyLink(e) {
    const target = e.target;
    if (!target.closest('.right .fa-copy')) return;
    const card = target.closest('.card');
    const link = card.querySelector('#copy-text').value;
    navigator.clipboard.writeText(link)
        .then(some => {
            ui.showAlert('Info', 'Link copied');
        })
        .catch(err => {
            ui.showAlert('Warning', `Text not copied: ${err}`);
        })
}

function toggleFavorite(e) {
    const target = e.target;
    if (!target.closest('.right .fa-heart')) return;
    const title = target.closest('.card').querySelector('.description .title').textContent;

    let targetNewsItem = currentNews.find(item => item.title === title);

    if (target.classList.contains('far')) {
        db.addToFavoriteToDb(targetNewsItem)
            .then(data => {
                addToFavorite(data);
            })
    } else if (target.classList.contains('fas')) {
        const id = target.getAttribute('data-base-Id');
        db.removeFromFavoriteFromDb(id)
            .then(data => {
                removeFromFavorite(data)
            })
    }

    function addToFavorite(data) {
        if (data.status === 'ok') {
            target.classList.replace('far', 'fas');
            ui.showAlert('Success', 'News added to favorite!');
            target.setAttribute('data-base-Id', data.newsId);
        } else {
            ui.showAlert('warning', data.message);
        }
    }

    function removeFromFavorite(data) {
        if (data.status === 'ok') {
            target.classList.replace('fas', 'far');

            let activeNavLink = document.querySelector('.navbar-nav .favorite-news');

            if (activeNavLink.classList.contains('active')) {
                target.closest('.col-4').remove();
            }
            ui.showAlert('Info', '<span>News removed from favorite!</span>');
            target.setAttribute('data-base-Id', '');
        } else {
            ui.showAlert('warning', data.message);
        }
    }
}

function toggleCardDescription(e) {
    const target = e.target;
    const card = target.closest('.col-4 .card');
    if (!card) return;

    const readMore = card.querySelector('.left .read-more');
    const closeDescriptionIcon = card.querySelector('.close-description-icon');
    const cardHeader = card.querySelector('.card-header');
    const description = card.querySelector('.description');

    if (target === readMore) {
        cardHeader.addEventListener('transitionend', open);
        card.classList.add('show-description');
    } else if (target === closeDescriptionIcon) {
        description.addEventListener('transitionend', close);
        description.classList.remove('show');
        closeDescriptionIcon.classList.remove('show');
    }

    function open(e) {
        description.classList.add('show');
        closeDescriptionIcon.classList.add('show');
        cardHeader.removeEventListener('transitionend', open);
    }

    function close(e) {
        card.classList.remove('show-description');
        description.removeEventListener('transitionend', close);
    }

    if (description.scrollHeight > description.offsetHeight) {
        const descriptionContent = description.querySelector('p.content');
        const descriptionHeader = description.querySelector('h3.title');
        closeDescriptionIcon.style.right = '20px';
        descriptionContent.style.padding = '10px 35px';
        descriptionHeader.style.padding = '10px 35px';
    }
}

// login, register, reset handlers
async function loginApp(e) {
    e.preventDefault();
    const target = e.target;
    if (!document.querySelector('.navbar-nav .logIn.active')) return;
    if (!target.closest('#login-form')) return;
    const loginForm = document.querySelector('#login-form');
    const email = loginForm.email;
    const password = loginForm.password;

    if (!validateForm.checkFields({email: email, password: [password]})) return;

    const res = await auth.logIn(email.value, password.value);

    if (res.status === 'ok') {
        window.location.replace('/');
    } else {
        ui.showAlert('Warning', res.message);
    }
}

async function logOutApp(e) {
    const target = e.target;
    if (!target.closest('.navbar-nav .logOut')) return;
    const res = await auth.logOut();
    if (res.status === 'ok') {
        window.location.replace('/login');
    } else {
        ui.showAlert('Warning', res.message);
    }
}

async function registerUser(e) {
    e.preventDefault();
    const target = e.target;
    if (!target.closest) return;
    if (!(target.closest('#register-form'))) return;
    const registerForm = document.querySelector('#register-form');
    const name = registerForm.name;
    const email = registerForm.email;
    const password = registerForm.password;

    if (!validateForm.checkFields({text: name, email: email, password: password})) return;

    const res = await auth.register(name.value, email.value, password.value);

    if (res.status === 'ok') {
        registerForm.reset();
        ui.showAlert('Info', 'Success');
        $('#home-tab').tab('show');
    } else {
        ui.showAlert('Warning', res.message);
    }
}

async function resetPassword(e) {
    e.preventDefault();
    const target = e.target;
    if (!target.closest) return;
    if (!target.closest('#reset-form')) return;
    const resetForm = document.querySelector('#reset-form');
    const email = resetForm.email;

    if(!validateForm.checkFields({email: email})) return;

    const res = await auth.resetPassword(email.value);

    if (res.status === 'ok') {
        resetForm.reset();
        email.blur();
        ui.showAlert('Success', res.message);
        setTimeout(() => {
            window.location.replace('/login');
        }, 4500);
    } else {
        ui.showAlert('Warning', res.message);
    }
}

async function changePassword(e) {
    e.preventDefault();
    const target = e.target;
    if (!target.closest) return;
    if (!target.closest('#reset-password-form')) return;
    const resetPasswordForm = document.querySelector('#reset-password-form');
    const password = resetPasswordForm.password;
    const userId = resetPasswordForm.querySelector('.btn.btn-primary').dataset.userId;
    const token = resetPasswordForm.querySelector('.btn.btn-primary').dataset.token;

    if(!validateForm.checkFields({password: password})) return;

    const res = await auth.changePassword(userId, password.value, token);

    if (res.status === 'ok') {
        resetPasswordForm.reset();
        password.blur();
        ui.showAlert('Success', res.message);

        setTimeout(() => {
            window.location.replace('/login');
        }, 4500);
    } else {
        ui.showAlert('Warning', res.message);
    }
}

// show block with images on login page
function showImages(e) {
    const elem = document.querySelector('.nav-item.active.logIn');
    if (!elem) return;

    Promise.all([
        http.getNewsByCountry('ua', 'general'),
        http.getNewsByResource('google-news'),
        http.getNewsByResource('the-wall-street-journal')
    ])
        .then(data => {
            let res = [];
            data.forEach(resObj => {
                res.push(...resObj.articles);
            });

            const wrapper = document.querySelector('.news-img-block');
            const innerBlock = document.querySelector('.news-img-block-inner');
            const headerHeight = document.querySelector('header').offsetHeight;
            const clientWidth = document.documentElement.clientWidth;

            wrapper.style.top = headerHeight + 'px';
            wrapper.style.height = `calc(100vh - ${headerHeight}px)`;

            let srcArr = res.map(item => {
                return item.urlToImage;
            });

            let i = 1;
            while (i > 0) {
                let div = document.createElement('div');
                div.className = 'img-wrapper';
                let img = document.createElement('img');
                div.appendChild(img);
                innerBlock.insertAdjacentElement('beforeend', div);

                let coords = div.getBoundingClientRect();
                if (coords.left >= clientWidth) {
                    div.remove();
                    break;
                }
            }

            let blocks = document.querySelectorAll('.news-img-block-inner img');
            blocks.forEach((block, idx) => {
                block.src = srcArr[idx];
                block.classList.add('img-show');

                block.onerror = function (e) {
                    block.src = 'img/semantic.png';
                };
            });

            let id = setInterval(changeImages, 2000);

            window.addEventListener("unload", function () {
                clearInterval(id);
            });

            function changeImages() {

                let numSrc = Math.floor(Math.random() * srcArr.length);
                let numBlock = Math.floor(Math.random() * blocks.length);

                blocks[numBlock].classList.remove('img-show');

                blocks[numBlock].addEventListener('transitionend', show);

                function show() {
                    blocks[numBlock].src = srcArr[numSrc];

                    blocks[numBlock].addEventListener('load', helper);

                    function helper() {
                        blocks[numBlock].classList.add('img-show');
                        blocks[numBlock].removeEventListener('transitionend', show);
                        blocks[numBlock].removeEventListener('load', helper);
                    }
                }
            }
        })
        .catch(e => console.log(e));
}

// toggle password input
function togglePassword(e) {
    let target = e.target;
    if (!target.matches('.password-wrapper .fas.fa-eye')) return;
    let wrapperBlock = target.closest('.password-wrapper');
    let input = wrapperBlock.querySelector('input.form-control');
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}



// const and check all code
// styles for forms, chang password form
// add readme md file
