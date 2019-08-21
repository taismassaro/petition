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

///// CANVAS SIGNING /////

router.get("/sign", requireId, requireNoSignature, (req, res) => {
    let user = req.session.user;
    console.log("Signature route");
    res.render("sign", {
        user: user
    });
});

router.post("/sign", requireId, requireNoSignature, (req, res) => {
    console.log("Signature POST request");
    if (req.body.signature) {
        req.session.user.signature = true;
        console.log("Session user:", req.session.user);
        db.addSignature(req.session.user.userId, req.body.signature)
            .then(() => {
                res.redirect("/thanks");
            })
            .catch(error => {
                console.log("ERROR:", orange(error));
                res.render("sign", {
                    error: error
                });
            });
    } else {
        res.render("sign", {
            error: true
        });
    }
});

///// THANKS /////

router.get("/thanks", requireId, requireSignature, (req, res) => {
    console.log("Thanks page");
    db.getSignature(req.session.user.userId)
        .then(signature => {
            console.log("Signature:", signature);
            db.getCount()
                .then(count => {
                    console.log("Count:", count);
                    res.render("thanks", {
                        user: req.session.user,
                        signature: signature.rows[0].signature,
                        count: count.rows[0].count
                    });
                })
                .catch(error => {
                    console.log("ERROR", error);
                });
        })
        .catch(error => {
            console.log("ERROR", error);
        });
});

///// SIGNATURES /////

router.get("/supporters", requireId, requireSignature, (req, res) => {
    console.log("Signatures page");
    db.getSigners()
        .then(signers => {
            console.log("Signers:", signers.rows);
            res.render("supporters", {
                route: req.url,
                user: req.session.user,
                signers: signers.rows,
                helpers: {
                    incremented(index) {
                        console.log(index);
                        index++;
                        if (index < 10) {
                            return "0" + index;
                        } else {
                            return index;
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
});
