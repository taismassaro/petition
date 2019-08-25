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

const { hash, compare } = require("./bc");

const chalk = require("chalk");
const orange = chalk.rgb(237, 142, 53);
const blue = chalk.rgb(28, 133, 230);

///// REGISTRATION /////

exports.registerUser = user => {
    console.log("Registering user data.");

    return hash(user.password).then(hash => {
        return db
            .query(
                `INSERT INTO users (first, last, email, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [user.first, user.last, user.email, hash]
            )
            .then(id => {
                return id.rows[0].id;
            });
    });
};

exports.addProfile = (userId, userInfo) => {
    console.log("Adding user profile.");
    console.log("City:", onlyLetters(userInfo.city));
    return db.query(
        `INSERT INTO user_details (user_id, age, city, url)
        VALUES ($1, $2, $3, $4)`,
        [
            userId,
            userInfo.age || null,
            onlyLetters(userInfo.city),
            checkUrl(userInfo.url)
        ]
    );
};

function onlyLetters(str) {
    return str.replace(/[^a-zA-Z]/, "");
}

function checkUrl(url) {
    if (url !== "") {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        } else {
            return "http://" + url;
        }
    }
}

///// LOGIN /////

exports.getPassword = email => {
    console.log("Checking credentials.");
    return db
        .query(`SELECT * FROM users WHERE email = $1`, [email])
        .then(check => {
            return check.rows[0];
        });
};

exports.getSignature = id => {
    console.log("Get user signature");
    return db
        .query(`SELECT user_id, signature FROM signatures WHERE user_id = $1`, [
            id
        ])
        .then(signature => {
            return signature.rows[0];
        });
};

///// EDIT PROFILE /////

exports.getUser = userId => {
    return db
        .query(
            `SELECT first, last, email, age, city, url FROM users
        JOIN user_details
        ON id = user_details.user_id
        WHERE id = $1`,
            [userId]
        )
        .then(userInfo => {
            return userInfo.rows[0];
        });
};

exports.updateProfile = (userId, userInfo) => {
    console.log("Updating user profile.");
    console.log("User info:", userInfo);

    return updateUserDb(userId, userInfo);
};

function updateUserDb(userId, userInfo) {
    if (userInfo.password) {
        hash(userInfo.password)
            .then(hash => {
                db.query(
                    `UPDATE users SET first = $2, last = $3, email = $4, password = $5 WHERE id = $1`,
                    [
                        userId,
                        userInfo.first,
                        userInfo.last,
                        userInfo.email,
                        hash
                    ]
                );
            })
            .catch(error => {
                console.log("ERROR:", blue(error));
            });
    } else {
        db.query(
            `UPDATE users SET first = $2, last = $3, email = $4 WHERE id = $1`,
            [userId, userInfo.first, userInfo.last, userInfo.email]
        );
    }
    return updateDetailsDb(userId, userInfo);
}
function updateDetailsDb(userId, userInfo) {
    return db.query(
        `INSERT INTO user_details (user_id, age , city, url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $2, city = $3, url = $4`,
        [
            userId,
            userInfo.age || null,
            onlyLetters(userInfo.city),
            checkUrl(userInfo.url)
        ]
    );
}

///// SIGN /////

exports.addSignature = (userId, signature) => {
    console.log("Adding user's signature.");
    return db.query(
        `INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING user_id`,
        [userId, signature]
    );
};

exports.deleteSignature = userId => {
    console.log("Deleting user's signature.");
    return db.query(
        `DELETE FROM signatures
        WHERE user_id = $1`,
        [userId]
    );
};

///// SUPPORTERS /////

exports.getSigners = () => {
    return db
        .query(
            `SELECT id, first, last, age, city, url FROM users
        JOIN user_details
        ON id = user_details.user_id
        WHERE id IN (SELECT user_id FROM signatures WHERE signatures.user_id = id)`
        )
        .then(signers => {
            return signers.rows;
        });
};

exports.getSignersByCity = city => {
    return db
        .query(
            `SELECT id, first, last, age, city, url FROM users
        JOIN user_details
        ON id = user_details.user_id
        WHERE LOWER(city) = LOWER($1)`,
            [city]
        )
        .then(signers => {
            return signers.rows;
        });
};

///// DELETE PROFILE /////
exports.deleteProfile = userId => {
    console.log("Deleting user's profile.");
    return deleteUserDb(userId);
};
function deleteUserDb(userId) {
    return db
        .query(
            `DELETE FROM signatures
        WHERE user_id = $1`,
            [userId]
        )
        .then(() => {
            return db.query(
                `DELETE FROM user_details
        WHERE user_id = $1`,
                [userId]
            );
        })
        .then(() => {
            return db.query(
                `DELETE FROM users
            WHERE id = $1`,
                [userId]
            );
        });
}

///// UTIL /////

exports.getCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`).then(count => {
        return count.rows[0].count;
    });
};
