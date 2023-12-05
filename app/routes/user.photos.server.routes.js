const UserPhotos = require('../controllers/user.photos.server.controller');

module.exports = function(app){
    app.route('/api/v1/users/:id/photo')
        .get(UserPhotos.retrievePhoto)
        .put(UserPhotos.putPhoto)
        .delete(UserPhotos.deletePhoto);

};

