const spicedPg = require("spiced-pg");
const { petitionUser, petitionPass } = require("./secrets.json");

const db = spicedPg(
    `postgres:${petitionUser}:${petitionPass}@localhost:5432/petition`
);

exports.insertData = (first, last, signature) => {
    console.log("Inserting data.");
    return db.query(
        `INSERT INTO petition (first, last, signature)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [first, last, signature]
    );
};

exports.getUser = id => {
    console.log("Get user signature");
    return db.query(`SELECT first,signature FROM petition WHERE id = $1`, [id]);
};

exports.getSigners = () => {
    return db.query(`SELECT * FROM petition`);
};

exports.getCount = () => {
    return db.query(`SELECT COUNT(*) FROM petition`);
};
