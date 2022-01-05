const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// database varaible is cool
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


// the seed function to make some fake data
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // YOUR USER ID
            author: '5fc5c84a2f78f704a665d95e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  _id: '5fd8a81bd19dec0fa915b28d',
                  url: 'https://res.cloudinary.com/dfiig1gol/image/upload/v1608034329/LifeUnderStars/juy9zbpegthj0rotevbi.jpg',
                  filename: 'LifeUnderStars/juy9zbpegthj0rotevbi'
                },
                {
                  _id: '5fd8a81bd19dec0fa915b28e',
                  url: 'https://res.cloudinary.com/dfiig1gol/image/upload/v1608034330/LifeUnderStars/bmy0bwpd6mre9cscc9z4.jpg',
                  filename: 'LifeUnderStars/bmy0bwpd6mre9cscc9z4'
                }
              ]

        })
        await camp.save();
    }
}

/*
    close the connection right after the server
    test command: node index.js
    author: 'Saksham Kshatri'
    description: 'This is the seeds file for the Official LIfe under stars'
*/
seedDB().then(() => {
    mongoose.connection.close();
})
