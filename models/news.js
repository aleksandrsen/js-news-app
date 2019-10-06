const {Schema, model} = require('mongoose');

const newsSchema = new Schema({
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
        type: String
    },
    publishedAt: {
        type: String
    },
    url: {
        type: String
    },
    urlToImage: {
        type: String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = model('News', newsSchema);

