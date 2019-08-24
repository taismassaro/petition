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
        res.render("profile");
    }
});

router.post("/profile", requireId, (req, res) => {
    let user = req.session.user;
    console.log("Profile POST request");
    console.log("Request:", req.body);
    db.addProfile(user.userId, req.body)
        .then(() => {
            req.session.user.logged = true;
            res.redirect("/sign");
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("profile", {
                error: "try again"
            });
        });
});

///// EDIT PROFILE /////

router.get("/edit", requireId, (req, res) => {
    console.log("Edit route");
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
                error: "try again"
            });
        });
});

router.post("/edit", requireId, (req, res) => {
    let user = req.session.user;
    console.log("Edit POST request");
    console.log("Request:", req.body);
    console.log("User:", user);

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
                error: "try again"
            });
        });
});
