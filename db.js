const spicedPg = require("spiced-pg");
const { petitionUser, petitionPass } = require("./secrets.json");

const db = spicedPg(
    `postgres:${petitionUser}:${petitionPass}@localhost:5432/cities`
);

exports.insertData = (first, last, signature) => {
    console.log("It's here.");
    db.query(
        `INSERT INTO petition (first, last, signature)
        VALUES ($1, $2, $3)`,
        [first, last, signature]
    ).then(result => {
        return result;
    });
};
