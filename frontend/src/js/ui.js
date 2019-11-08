// export default class UI {
//     constructor() {
//         this.newsContainer = document.querySelector('.row.news-container');
//         this.timers = [];
//     }
//
//     static formatDate(dateString) {
//         const date = new Date(dateString);
//
//         let formatter = new Intl.DateTimeFormat("ru", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//             hour: "numeric",
//             minute: "numeric"
//         });
//         return formatter.format(date);
//     }
//
//     static formatAuthor(author) {
//         if (!author) return '......';
//         return author.length < 28 ? author : author.slice(0, 25) + '.....';
//     }
//
//     static clearTimeout() {
//         ui.timers.forEach(timerId => clearTimeout(timerId));
//         ui.timers = [];
//     }
//
//     showNews(news) {
//         let timeOut = 0;
//         if (news.length <= 3) {
//             document.body.style.overflowY = 'scroll';
//             setTimeout(() => {
//                 document.body.style.overflowY = 'auto';
//             }, 1200)
//         } else if (news.length > 3) {
//             document.body.style.overflowY = 'scroll';
//         }
//
//         news.forEach((newsItem, idx) => {
//             let {
//                 author,
//                 description,
//                 publishedAt,
//                 source,
//                 title,
//                 url,
//                 urlToImage
//             } = newsItem;
//
//             if (!author && !description && !title) return;
//
//             let timerID = setTimeout(() => {
//                 const template = `
//                  <div class="col-4 animated fadeInUp fast">
//                     <div class="card news-item text-white bg-primary">
//                         <div class="close-description-icon">&#10005;</div>
//                         <div class="description">
//                             <h3 class="title">${title}</h3>
//                             <p class="content">${description}</p>
//                         </div>
//                         <!--/description-->
//                         <div class="card-header">
//                             <img
//                                 src="${idx < 9 ? urlToImage : 'img/lazy-grey.jpg'}"
//                                 data-src="${urlToImage || 'img/img-error.jpg'}" alt="${title}"
//                                 onerror="this.src = 'img/img-error.jpg'"
//                             >
//                             <h3 class="card-title">
//                                ${title.length < 130 ? title : title.slice(0, 127) + '...'}
//                             </h3>
//                             <div class="news-info">
//                                 <span>
//                                     <a href="http://${source.name}" target="_blank">
//                                         ${UI.formatAuthor(author)}
//                                     </a>
//                                 </span>
//                                 <span>${UI.formatDate(publishedAt)}</span>
//                             </div>
//                             <!--/news-info-->
//                         </div>
//                         <!--/card-header-->
//                         <div class="card-body">
//                             <div class="left">
//                                 <a href="${url}" class="btn btn-primary" target="_blank">View in source</a>
//                                 <button type="button" class="btn btn-primary read-more">Read more</button>
//                             </div>
//                             <!--/left-->
//                             <div class="right">
//                                 <i class="far fa-copy"
//                                    data-toggle="tooltip"
//                                    data-placement="top"
//                                    title="Copy link">
//                                 </i>
//                                 <i class="${newsItem._id ? 'fas' : 'far'} fa-heart"
//                                     ${newsItem._id ? `data-base-Id=${newsItem._id}` : ''}
//                                    data-toggle="tooltip"
//                                    data-placement="top"
//                                    title="Add to favorite">
//                                    <input type="text" value="${url}" id="copy-text">
//                                 </i>
//                             </div>
//                             <!--/right-->
//                         </div>
//                         <!--/card-body-->
//                     </div>
//                     <!--/card-->
//                 </div>
//                 <!--/col-4-->`;
//
//                 this.newsContainer.insertAdjacentHTML('beforeend', template);
//
//                 $('[data-toggle="tooltip"]').tooltip();
//
//             }, timeOut);
//
//             timeOut += 300;
//             this.timers.push(timerID);
//         });
//     }
//
//     cleanNewsContainer() {
//         UI.clearTimeout(this.timers);
//         this.newsContainer.innerHTML = '';
//     }
//
//     showAlert(type, message) {
//         let messageType = type.toLowerCase();
//
//         const template = `
//             <div class="alert alert-dismissible alert-${messageType} animated">
//                 ${messageType === "info" ? '' : '<button type="button" class="close" data-dismiss="alert">&#10005;</button>'}
//                 ${messageType === "info" ? '' : `<p class=\"alert-header\">${messageType === 'warning' ? 'Error' : type}</p>`}
//                 <p class="alert-content">${message}</p>
//             </div>`;
//
//         const oldAlert = document.querySelector('.alert');
//         if (oldAlert) oldAlert.remove();
//
//         document.body.insertAdjacentHTML('afterbegin', template);
//
//         const alert = document.querySelector('.alert');
//         alert.classList.add('fadeInUp');
//
//         alert.addEventListener('animationend', show);
//
//         function show() {
//             alert.classList.replace('fadeInUp', 'fadeOutUp');
//             alert.classList.add('delay-2s');
//             alert.removeEventListener('animationend', show);
//             alert.addEventListener('animationend', remove);
//         }
//
//         function remove() {
//             alert.remove();
//             alert.removeEventListener('animationend', remove);
//         }
//     }
//
//     showSpinner() {
//         let template = `
//         <div class="lds-css ng-scope">
//             <div class="lds-spin">
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//             </div>
//         </div>`;
//
//         this.newsContainer.insertAdjacentHTML('afterbegin', template);
//     }
//
//     showModal(e) {
//         let countNews = document.querySelectorAll('.news-container .card') || 0;
//         $('.modal').modal('show');
//         if (countNews.length > 3) {
//             document.body.style.paddingRight = '0';
//         }
//     }
//
//     hideModal(e) {
//         $('.modal').modal('hide');
//     }
//
//     returnSmallSpinner() {
//         return (`
//         <div class="lds-css ng-scope">
//             <div class="lds-spin">
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//                 <div>
//                     <div></div>
//                 </div>
//             </div>
//         </div>
//         `);
//     }
//
//     deleteSmallSpinner() {
//         const smallSpinner = document.querySelector('header .searching-list .lds-css');
//         if (!smallSpinner) return;
//         smallSpinner.remove();
//     }
// }