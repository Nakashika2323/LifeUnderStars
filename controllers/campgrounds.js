const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// creating new campground function()...
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({ 
        query: req.body.campground.location, 
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground); 
    campground.geometry = geoData.body.features[0].geometry; 
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); 
    campground.author = req.user._id;
    await campground.save();
    console.log(campground); 
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

// TODO: private campgrounds from the URL
module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // CONDITION CHECKING 
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // if the campground is found
    res.render('campgrounds/show', { campground });
}

// code to render the edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // to see whats going with the checkbox data
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); 
    campground.images.push(...imgs); 
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) { 
            // delete image from cloudiary with a filename
            await cloudinary.uploader.destroy(filename);  
        }
        await campground.updateOne({ $pull : {images: {filename: {$in: req.body.deleteImages } } } }); 
        console.log(campground); 
    }
    req.flash('success', 'Successfully updated campground!');
    // redirect user to the show page
    res.redirect(`/campgrounds/${campground._id}`) 
}


// logic to delete the campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds'); 
}


