const express = require("express");
const router = (exports.router = express.Router());

const db = require("./utils/db");
const {
    requireId,
    requireNoId,
    requireSignature,
    requireNoSignature
} = require("./middleware");

const { hash, compare } = require("./utils/bc");

const chalk = require("chalk");

const orange = chalk.rgb(237, 142, 53);
const blue = chalk.rgb(28, 133, 230);

///// LOGIN /////

router.get("/login", requireNoId, (req, res) => {
    console.log("Login route");
    res.render("login");
});

router.post("/login", requireNoId, (req, res) => {
    console.log("Login POST request");
    db.getPassword(req.body.email)
        .then(check => {
            console.log("getPassword:", check);
            compare(req.body.password, check.password).then(match => {
                if (match === true) {
                    console.log("Is it a match?", blue(match));
                    db.getSignature(check.id).then(user => {
                        req.session.user = {
                            userId: check.id,
                            first: check.first
                        };
                        console.log("USER:", user.rows[0].signature);
                        if (user.rows[0].signature) {
                            req.session.user.signature = true;
                            res.redirect("/thanks");
                        } else {
                            res.redirect("/sign");
                        }
                    });
                } else {
                    console.log(orange("Wrong credentials"));
                    res.render("login", {
                        error: true
                    });
                }
            });
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("login", {
                error: error
            });
        });
});

///// REGISTER /////

router.get("/register", requireNoId, (req, res) => {
    console.log("Register route");
    res.render("register", {
        title: true
    });
});

router.post("/register", requireNoId, (req, res) => {
    console.log("Register POST request");
    hash(req.body.password)
        .then(hash => {
            let user = {
                first: req.body.first,
                last: req.body.last,
                email: req.body.email,
                password: hash
            };
            req.session.user = {
                first: user.first
            };
            db.registerUser(user)
                .then(id => {
                    console.log("Id:", id.rows[0].id);
                    req.session.user.userId = id.rows[0].id;
                    console.log("SUCCESS! Redirecting...");
                    console.log("user_id:", req.session.user.userId);
                    res.redirect("/profile");
                })
                .catch(error => {
                    console.log("ERROR:", orange(error));
                    res.redirect("register");
                });
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("register", {
                title: true,
                error: error
            });
        });
});
