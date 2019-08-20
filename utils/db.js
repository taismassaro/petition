const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { petitionUser, petitionPass } = require("../secrets.json");
    db = spicedPg(
        `postgres:${petitionUser}:${petitionPass}@localhost:5432/petition`
    );
}

exports.registerUser = user => {
    console.log("Registering user data.");
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [user.first, user.last, user.email, user.password]
    );
};

exports.addProfile = (userId, userInfo) => {
    console.log("Adding user profile.");
    return db.query(
        `INSERT INTO user_details (user_id, age, city, url)
        VALUES ($1, $2, $3, $4)`,
        [userId, userInfo.age || null, userInfo.city, checkUrl(userInfo.url)]
    );
};
function checkUrl(url) {
    if (!url.startsWith("http://") || !url.startsWith("https://")) {
        return "http://" + url;
    } else {
        return url;
    }
}
exports.getPassword = email => {
    console.log("Checking credentials.");
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then(check => {
            return check.rows[0];
        });
};

exports.addSignature = (userId, signature) => {
    console.log("Adding user's signature.");
    return db.query(
        `INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING user_id`,
        [userId, signature]
    );
};

exports.getSignature = id => {
    console.log("Get user signature");
    return db.query(
        `SELECT user_id, signature FROM signatures WHERE user_id = $1`,
        [id]
    );
};

exports.getSigners = () => {
    return db.query(
        `SELECT id, first, last, age, city, url FROM users
        JOIN user_details
        ON id = user_details.user_id
        WHERE user_details.user_id IN (SELECT user_id FROM signatures WHERE signatures.user_id = user_details.user_id)`
    );
};

exports.getCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};
