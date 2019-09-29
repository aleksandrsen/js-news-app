class UI {
    constructor () {
        this.newsContainer = document.querySelector('.news-container');

    }



    addNews(news, index) {
        let template = `
            <div class="col-4">
                <div class="news-item animateNews">
                    <div class="news-wrapper">
                        <img src="${news.urlToImage !== null ? news.urlToImage : 'img/not-found.jpg'}" alt="">
                        <div class="news-content">
                            <h3 class="news-title">${news.title}</h3>
                            <div class="controls">
                                <a href="${news.url}" class="source">View source<i class="fas fa-chevron-right"></i></a>

                                <button class="copy-link" data-toggle="tooltip" data-placement="top" title="Copy link" data-link="${news.url}"><i class="fas fa-copy"></i></button>
                                
                                <button class="addFavorite" data-toggle="tooltip" data-placement="top" title="Add to favorite" data-index="${index}"><i class="far fa-heart"></i></button>
                                
                                <button class="description-btn" data-toggle="tooltip" data-placement="top" title="View description"><i class="fas fa-ellipsis-v"></i></button>
                                
                            </div>
                            <!--/controls-->
                        </div>
                        <!--/news-content-->
                    </div>
                    <div class="news-description">
                        <div class="close-description"><i class="fas fa-times"></i></div>
                        ${news.description !== null ? news.description + '.' : 'Description not found!!!'}
                    </div>
                </div>
                <!--/news-item-->
            </div>
            <!--/col-4-->
        `;

        this.newsContainer.insertAdjacentHTML('beforeend', template);
    }

    addFavoriteNews(news, id) {
        let template = `
            <div class="col-4">
                <div class="news-item">
                    <div class="news-wrapper">
                        <img src="${news.urlToImage !== null ? news.urlToImage : 'img/not-found.jpg'}" alt="">
                        <div class="news-content">
                            <h3 class="news-title">${news.title}</h3>
                            <div class="controls">
                                <a href="${news.url}" class="source">View source<i class="fas fa-chevron-right"></i></a>

                                <button class="copy-link" data-toggle="tooltip" data-placement="top" title="Copy link" data-link="${news.url}"><i class="fas fa-copy"></i></button>
                                
                                <button class="addFavorite" data-toggle="tooltip" data-placement="top" title="Add to favorite" data-id="${id}"><i class="fas fa-heart"></i></button>
                                
                                <button class="description-btn" data-toggle="tooltip" data-placement="top" title="View description"><i class="fas fa-ellipsis-v"></i></button>
                                
                            </div>
                            <!--/controls-->
                        </div>
                        <!--/news-content-->
                    </div>
                    <div class="news-description">
                        <div class="close-description"><i class="fas fa-times"></i></div>
                        ${news.description !== null ? news.description + '.' : 'Description not found!!!'}
                    </div>
                </div>
                <!--/news-item-->
            </div>
            <!--/col-4-->
        `;

        this.newsContainer.insertAdjacentHTML('beforeend', template);
    }

    clearContainer() {
        this.newsContainer.innerHTML = '';
    }


    showAlert(title, text) {
        let template = `
            <div class="my-alert animate ${title === 'Success' ? 'success' : 'error'}">
                <div class="alert-title">${title}</div>
                <div class="alert-text">${text}</div>
            </div>`;

        document.body.insertAdjacentHTML('afterbegin', template);

        let alert = document.querySelector('.my-alert');
        alert.addEventListener('mouseover', function (e) {
            this.style.animationPlayState = 'paused';
            this.style.opacity = '1';
        });

        alert.addEventListener('mouseout', function (e) {
            this.style.animationPlayState = 'running';
            this.style.opacity = '0';
        })
    }


    showDescription(e) {
        let target = e.target;
        if (!target.closest('.description-btn')) return;
        if (document.querySelector('.news-item.active')) {
            document.querySelector('.news-item.active').classList.remove('active');
        }
        target.closest('.news-item').classList.add('active');
    }

    hideDescription(e) {
        let target = e.target;
        if (!target.closest('.close-description')) return;
        target.closest('.news-item').classList.remove('active');
    }

}

