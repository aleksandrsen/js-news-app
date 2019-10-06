const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    favoriteNews: [{ type: Schema.Types.ObjectId, ref: 'News' }]
});

userSchema.methods.addToFavoriteNews = function (newsId) {
    this.favoriteNews.push(newsId);
    return this.save();
};

module.exports = model('User', userSchema);

