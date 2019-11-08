export default class DB {
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