export default class Http {
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