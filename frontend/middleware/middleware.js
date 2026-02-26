exports.isAuth = (req, res, next) => {

    const isLoggedIn = req.session.user?.role === 'Trader' || req.session.user?.role === 'Admin';
    
    if (!isLoggedIn) {
        return res.redirect('/');
    }

    next();
}