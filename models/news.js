const {Schema, model} = require('mongoose');

const news = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String
    },
    source: {
        type: Object
    },
    content: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    publishedAt: {
        type: String
    },
    url: {
        type: String
    },
    urlToImage: {
        type: String
    }
})

module.exports = model('News', news);

