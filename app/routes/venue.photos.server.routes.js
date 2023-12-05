const VenuePhotos = require('../controllers/venue.photos.server.controller');

module.exports = function(app){
    app.route('/api/v1/venues/:id/photos')
        .post(VenuePhotos.postPhoto);

    app.route('/api/v1/venues/:id/photos/:photoFilename')
        .get(VenuePhotos.getPhoto)
        .delete(VenuePhotos.deletePhoto);

    app.route('/api/v1/venues/:id/photos/:photoFilename/setPrimary')
        .post(VenuePhotos.setPrimary);

};
