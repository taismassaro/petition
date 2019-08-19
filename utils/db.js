const spicedPg = require("spiced-pg");
const { petitionUser, petitionPass } = require("../secrets.json");

const db = spicedPg(
    `postgres:${petitionUser}:${petitionPass}@localhost:5432/petition`
);

exports.registerUser = user => {
    console.log("Registering user data.");
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [user.first, user.last, user.email, user.password]
    );
};
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
        `SELECT id, first, last FROM users WHERE id IN (SELECT user_id FROM signatures WHERE user_id = id)`
    );
};

exports.getCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};
