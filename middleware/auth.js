module.exports = function (req, res, next) {
    if (!req.session.isAuthenicated) {
        return res.redirect('/login');
    }

    next();
};