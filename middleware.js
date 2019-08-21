///// CHECK LOGIN /////

exports.requireId = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    next();
};

exports.requireNoId = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/thanks");
    }
    next();
};

///// CHECK SIGNATURE /////

exports.requireSignature = (req, res, next) => {
    if (!req.session.user.signature) {
        return res.redirect("/sign");
    }
    next();
};
exports.requireNoSignature = (req, res, next) => {
    if (req.session.user.signature) {
        return res.redirect("/thanks");
    }
    next();
};
