const express = require("express");
const router = (exports.router = express.Router());

const db = require("./utils/db");
const { requireNoId } = require("./middleware");

const { hash, compare } = require("./utils/bc");

const chalk = require("chalk");

const orange = chalk.rgb(237, 142, 53);
const blue = chalk.rgb(28, 133, 230);

///// LOGIN /////

router.get("/login", requireNoId, (req, res) => {
    console.log("Login route");
    res.render("login", {
        title: true
    });
});

router.post("/login", requireNoId, (req, res) => {
    console.log("Login POST request");
    db.getPassword(req.body.email)
        .then(check => {
            console.log("getPassword:", check);
            compare(req.body.password, check.password).then(match => {
                if (match === true) {
                    console.log("Is it a match?", blue(match));
                    db.getSignature(check.id)
                        .then(signature => {
                            console.log("getSignature response:", signature);
                            req.session.user = {
                                userId: check.id,
                                first: check.first
                            };
                            if (signature) {
                                req.session.user.signature = true;
                            }
                            console.log("Session user:", req.session.user);
                            res.redirect("/thanks");
                        })
                        .catch(error => {
                            console.log("ERROR:", orange(error));
                            res.render("login", {
                                title: true,
                                error: "Something went wrong. Please try again."
                            });
                        });

                    //
                } else {
                    console.log(orange("Wrong credentials"));
                    res.render("login", {
                        title: true,
                        error: "Incorrect password. Please try again."
                    });
                }
            });
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("login", {
                title: true,
                error:
                    "This email is not registered yet. Please sign up to show your support."
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
    console.log("req.body:", req.body);
    req.session.user = {
        first: req.body.first
    };
    db.registerUser(req.body)
        .then(id => {
            console.log("Id:", id);
            req.session.user.userId = id;
            console.log("SUCCESS! Redirecting...");
            console.log("user_id:", req.session.user.userId);
            res.redirect("/profile");
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("register", {
                title: true,
                error: error
            });
        });
});
