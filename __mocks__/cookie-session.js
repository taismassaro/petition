let tempSession,
    session = {};

module.exports = () => (req, res, next) => {
    req.session = tempSession || session;
    tempSession = null;
    next();
};

// creates a cookie that can be applied to all tests
module.exports.mockSession = sess => (session = sess);

// creates a fake cookie that only exists for one test
// gives you more control by having to set the cookie for each test
module.exports.mockSessionOnce = sess => (tempSession = sess);
