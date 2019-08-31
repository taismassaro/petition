const express = require("express");
const router = (exports.router = express.Router());

const db = require("../utils/db");
const { requireId } = require("../utils/middleware");

const chalk = require("chalk");

const orange = chalk.rgb(237, 142, 53);
const blue = chalk.rgb(28, 133, 230);

///// SET PROFILE /////

router.get("/profile", requireId, (req, res) => {
    console.log("Profile route");
    if (req.session.user.logged) {
        res.redirect("/edit");
    } else {
        res.render("profile", {
            nonav: true
        });
    }
});

router.post("/profile", requireId, (req, res) => {
    let user = req.session.user;
    console.log("Profile POST request");
    console.log("Request:", req.body);
    db.addProfile(user.userId, req.body)
        .then(() => {
            req.session.first = req.body.first;
            req.session.user.logged = true;
            res.redirect("/sign");
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("profile", {
                error: {
                    default: true
                }
            });
        });
});

///// EDIT PROFILE /////

router.get("/edit", requireId, (req, res) => {
    console.log("Edit route");

    if (!req.session.user.logged) {
        res.redirect("/profile");
    } else {
        console.log("User cookie:", req.session.user);
        let user = req.session.user;
        db.getUser(user.userId)
            .then(userInfo => {
                console.log("userInfo:", userInfo);
                res.render("edit", {
                    user: userInfo,
                    signature: true,
                    count: req.session.count
                });
            })
            .catch(error => {
                console.log("ERROR:", orange(error));
                res.render("edit", {
                    error: {
                        default: true
                    }
                });
            });
    }
});

router.post("/edit", requireId, (req, res) => {
    let user = req.session.user;
    console.log("Edit POST request");
    console.log("Request:", req.body);
    console.log("User:", user);
    if (req.body.btn === "update") {
        db.updateProfile(user.userId, req.body)
            .then(() => {
                if (user.signature) {
                    res.redirect("/thanks");
                } else {
                    res.redirect("/sign");
                }
            })
            .catch(error => {
                console.log("ERROR:", orange(error));
                res.render("edit", {
                    user: req.session.user,
                    error: {
                        default: true
                    }
                });
            });
    } else if (req.body.btn === "delete") {
        res.redirect("/delete");
    }
});
router.get("/delete", requireId, (req, res) => {
    res.render("delete", {
        user: req.session.user
    });
});

router.post("/delete", requireId, (req, res) => {
    if (req.body.btn === "yes") {
        db.deleteProfile(req.session.user.userId)
            .then(() => {
                req.session.user = null;
                res.render("delete", {
                    user: req.session.user,
                    sad: true,
                    redirect: "<meta http-equiv='refresh' content='1;url=/'>"
                });
            })
            .catch(error => {
                console.log("ERROR", orange(error));
                res.render("delete", {
                    error: {
                        default: true
                    }
                });
            });
    } else if (req.body.btn === "no") {
        res.redirect("/edit");
    }
});
