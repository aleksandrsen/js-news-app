const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExp: Date,
    favoriteNews: [{ type: Schema.Types.ObjectId, ref: 'News' }]
});

userSchema.methods.addToFavoriteNews = function (newsId) {
    this.favoriteNews.push(newsId);
    return this.save();
};

userSchema.methods.removeFromFavorite = function (newsId) {
    let favoriteNews = [...this.favoriteNews];
    let idx = favoriteNews.findIndex(item => item.toString() === newsId.toString());
    favoriteNews.splice(idx, 1);
    this.favoriteNews = favoriteNews;
    return this.save();
};

module.exports = model('User', userSchema);