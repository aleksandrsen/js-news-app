export default class Auth {
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