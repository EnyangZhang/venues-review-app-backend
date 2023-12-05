const User = require('../controllers/user.server.controller');


module.exports = function(app){
    app.route('/api/v1/users')
        .post(User.register);

    app.route('/api/v1/users/login')
        .post(User.login);

    app.route('/api/v1/users/logout')
        .post(User.logout);

    app.route('/api/v1/users/:id')
        .get(User.userInfo);

    app.route('/api/v1/users/:id')
        .patch(User.changeInfo);

};
