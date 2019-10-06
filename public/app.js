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

    async addToFavoriteToDb(newsItem) {
        let response = await fetch('/addToFavorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(newsItem)
        });
        let res = response.json();
        return res;
    }

    async removeFromFavorite(id) {
        let response = await fetch('/removeFromFavorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({id: id})
        });
        let res = response.json();
        return res;
    }

    async getFavoriteNews() {
        let response = await fetch('/get-favorite-news');
        let res = await response.json();
        return res;
    };
}

class UI {
    constructor(newsContainer) {
        this.newsContainer = document.querySelector('.row.news-container');
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
            }, 5 * timeOut)
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

            timeOut += 500;
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
                <button type="button" class="close" data-dismiss="alert">&#10005;</button>
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
        if(!smallSpinner) return;
        smallSpinner.remove();
    }
}

// Init classes
const http = new Http();
const ui = new UI();

// Global arrays for news resources
let currentNews; // this variable will be contain news that will be on page in current moment
let favoriteBtn = document.querySelector('.navbar-nav .favorite-news');
favoriteBtn.addEventListener('click', showFavoriteNews);

async function showFavoriteNews(e) {
    e.preventDefault();
    ui.showSpinner();
    const favoriteNews = await http.getFavoriteNews();
    if (!favoriteNews.length) return;
    ui.cleanNewsContainer();
    ui.showNews(favoriteNews);
}


const countriesArr = [
    {
        name: 'Argentina',
        code: 'ar',
        id: 'country'
    },
    {
        name: 'Australia',
        code: 'ar',
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
const searchingList  = document.querySelector('.searching-list'); // header
const searchingInput = document.querySelector('header input.form-control'); // header
// Card buttons
const showModalBtn = $('.show-modal-wrapper');
const closeModalBtn = $('.close-icon-modal');
// Forms
const countryForm = document.querySelector('#country-form'); // modal
const newsSourceForm = document.querySelector('#source-form'); // modal
const searchNewsForm = document.querySelector('.search-news-form'); // header

// Add events
window.addEventListener('load', e => {
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
    // searchNewsByCountry(e);
});

window.addEventListener('scroll', showVisible);

document.addEventListener('click', closeSearchingList);

// Header form events
searchingInput.addEventListener('input', displayMatches);

searchingInput.addEventListener('input', searching);

searchingInput.addEventListener('keyup', (e) => setSearchingListValue());

searchNewsForm.addEventListener('submit', searchNewsByRequest);
// Modal events
showModalBtn.on('click', ui.showModal);

closeModalBtn.on('click', ui.hideModal);

countryForm.addEventListener('submit', searchNewsByCountry);

newsSourceForm.addEventListener('submit', searchNewsByNewsResource);

// Card events
newsContainer.addEventListener('click', addToFavorite);

newsContainer.addEventListener('click', copyLink);

newsContainer.addEventListener('click', toggleCardDescription);

newsContainer.addEventListener('click', toggleCardDescription);


// Events handlers
// Header form handlers
function closeSearchingList(e) {
    let target = e.target;
    if(target.closest('.searching-list') || target.closest('.search-news-form .btn.btn-secondary')) return;

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
    const matchArray = findMatches(this.value, countriesResourcesArr);

    const html = matchArray.map(({name, code, id}) => {
        return `
        <li data-name = "${name}" data-code = "${code}" data-id = "${id}">
            ${name} ${id === 'resource' ? '<span class="hint">resource</span>' : ui.returnSmallSpinner()}
        </li>
        `;
    }).slice(0, 10).join('');

    searchingList.innerHTML = html;

    matchArray.forEach(({name, id}, idx) => {
        if (id === "resource") return;
        if (idx > 10) return;

        http.getFlag(name)
            .then(url => {
                let elem = document.querySelector(`.searching-list li[data-name="${name}"]`);
                if(!elem) return;

                ui.deleteSmallSpinner();

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
    let lis = document.querySelectorAll('.searching-list li');
    if(!lis[0]) return;
    let i = 0;
    let max = lis.length;

    // highLight active item
    lis[0].classList.add('active');
    lis.forEach(li => {
        li.addEventListener('mouseenter', e => {
            let target = e.target;
            for(let j = 0; j < lis.length; j++) {
                lis[j].classList.remove('active');
            }
            target.classList.add('active');

            let activeIdx = [].findIndex.call(lis, (li) => {
                return li.classList.contains('active');
            });

            i = activeIdx;
        });

        li.addEventListener('click', (e) => {
            setSearchingListValue();
            let event = new Event('submit');
            searchNewsForm.dispatchEvent(event);
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

function setSearchingListValue() {
    let active = document.querySelector('.searching-list li.active');
    if (active) {
        searchingInput.setAttribute('data-code', active.dataset.code);
        searchingInput.setAttribute('data-id', active.dataset.id);
    } else {
        searchingInput.setAttribute('data-code', '');
        searchingInput.setAttribute('data-id', '');
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
                checkNews(data.articles.length);
                return;
            }
            ui.showAlert('Warning', 'We could\'nt find any news for this request!');
        })
        .catch(err => {
            ui.showAlert('Warning', err);
            ui.cleanNewsContainer();
        });
}

function searchNewsByCountry(e) {
    let countryValue = document.querySelector('#country').value;
    let categoryValue = document.querySelector('#category').value;
    searchHelper(e, http.getNewsByCountry, countryValue, categoryValue);
    countryForm.reset();
}

function searchNewsByNewsResource(e) {
    let newsSourceValue = document.querySelector('#resource').value;
    searchHelper(e, http.getNewsByResource, newsSourceValue);
    newsSourceForm.reset();
}

function searchNewsByRequest(e) {
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
    let target = e.target;
    if (!target.closest('.right .fa-copy')) return;
    let card = target.closest('.card');
    let link = card.querySelector('#copy-text').value;
    navigator.clipboard.writeText(link)
        .then(some => {
            ui.showAlert('Info', 'Link copied');
        })
        .catch(err => {
            ui.showAlert('Warning', `Text not copied: ${err}`);
        })
}

function addToFavorite(e) {
    const target = e.target;
    if (!target.closest('.right .fa-heart')) return;
    const title = target.closest('.card').querySelector('.description .title').textContent;

    if (!currentNews.length) return;
    let targetNewsItem = currentNews.find(item => item.title === title);

    if(target.classList.contains('far')) {
        http.addToFavoriteToDb(targetNewsItem)
            .then(data => {
                if(data.status === 'ok') {
                    target.classList.replace('far', 'fas');
                    ui.showAlert('Success', 'News added to favorite!');
                    target.setAttribute('data-base-Id', data.newsId);
                } else {
                    ui.showAlert('warning', data.message);
                }
            })
            .catch(err => {
                ui.showAlert('warning', err);
            })
    } else if (target.classList.contains('fas')) {
        const id = target.getAttribute('data-base-Id');
        http.removeFromFavorite(id)
            .then(data => {
                if(data.status === 'ok') {
                    target.classList.replace('fas', 'far');
                    ui.showAlert('Success', '<span style="color: #b40000">News removed from favorite!</span>');
                    target.setAttribute('data-base-Id', '');
                } else {
                    ui.showAlert('warning', data.message);
                }
            })
            .catch(err => {
                ui.showAlert('warning', err);
            })

    }

}

function toggleCardDescription(e) {
    const target = e.target;
    const card = target.closest('.col-4 .card');
    if(!card) return;

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
        descriptionContent.style.padding = '10px 30px';
        descriptionHeader.style.padding = '10px 30px';
    }
}

function readMore(e) {
    const target = e.target;
    if (!target.closest('.left .read-more')) return;

    const card = target.closest('.card');
    const cardHeader = card.querySelector('.card-header');
    const description = card.querySelector('.description');
    const closeDescriptionIcon = card.querySelector('.close-description-icon');

    card.classList.add('show-description');

    cardHeader.addEventListener('transitionend', open);

    function open(e) {
        description.classList.add('show');
        closeDescriptionIcon.classList.add('show');
        cardHeader.removeEventListener('transitionend', open);
    }
}

function closeDescription(e) {
    const target = e.target;
    if (!target.closest('.card.show-description')) return;
    if (!target.closest('.card .close-description-icon')) return;

    const card = target.closest('.card.show-description');
    const cardHeader = card.querySelector('.card-header');
    const description = card.querySelector('.description');
    const closeDescriptionIcon = card.querySelector('.close-description-icon');

    description.classList.remove('show');
    closeDescriptionIcon.classList.remove('show');

    description.addEventListener('transitionend', close);

    function close(e) {
        card.classList.remove('show-description');
        description.removeEventListener('transitionend', close);
    }
}

async function checkNews(length) {
    const favoriteNews = await http.getFavoriteNews();
    let time = length * 500 + 1000;

    let timerId = setInterval(() => {
            let titles = document.querySelectorAll('.card .description .title');
            titles.forEach(title => {
                let text = title.textContent;
                favoriteNews.forEach(favoriteNewsItem => {
                    if(favoriteNewsItem.title === text) {
                        let heart = title.closest('.card').querySelector('.fa-heart');
                        heart.classList.replace('far', 'fas');
                        heart.setAttribute('data-base-Id', favoriteNewsItem._id);
                    }
                })
            })
    }, 1000);

    setTimeout(() => clearInterval(timerId), time);
}

/// try, catch в app.js
// check, remove