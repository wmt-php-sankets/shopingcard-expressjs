var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shoping-card', { useNewUrlParser: true, useUnifiedTopology: true });

var products = [new Product({
    imagePath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png',
    title: 'Gothics Video Game',
    description: 'Awasome video!!!!',
    price: 10
}), new Product({
    imagePath: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Call_of_Duty_Black_Ops_4_official_box_art.jpg',
    title: 'call of duty',
    description: 'Awasome video!!!! lorem  is cpv fdfdkn jfpej omrp vrrem njer',
    price: 10
}), new Product({
    imagePath: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Ludo-1.jpg',
    title: 'Lodo King',
    description: 'Awasome video!!!!',
    price: 10
}), new Product({
    imagePath: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Eden_Gardens_under_floodlights_during_a_match.jpg',
    title: 'cricket Video Game',
    description: 'Awasome video!!!!',
    price: 10
})];
var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function (err, result) {
        console.log(err)
            if (err) {
            throw err
        }
        done++;
        if (done === products.length) {
            exit();
        }
    });
}
function exit() {
    mongoose.disconnect();
}
