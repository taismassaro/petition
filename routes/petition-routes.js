const express = require("express");
const router = (exports.router = express.Router());

const db = require("../utils/db");
const {
    requireId,
    requireSignature,
    requireNoSignature
} = require("../utils/middleware");

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
                    error: {
                        default: true
                    }
                });
            });
    } else {
        res.render("sign", {
            error: {
                signerror: true
            }
        });
    }
});

///// THANKS /////

router.get("/thanks", requireId, requireSignature, (req, res) => {
    console.log("Thanks page");
    db.getSignature(req.session.user.userId)
        .then(signature => {
            db.getCount()
                .then(count => {
                    req.session.count = count;
                    console.log("Count:", count);
                    res.render("thanks", {
                        user: req.session.user,
                        signature: signature.signature,
                        count: req.session.count
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

router.post("/thanks", requireId, (req, res) => {
    console.log("Thanks POST request");
    console.log("userId", req.session.user.userId);
    console.log("req.body", req.body.btn);
    db.deleteSignature(req.session.user.userId)
        .then(result => {
            req.session.user.signature = null;
            console.log("POST result:", result);
            res.redirect("/sign");
        })
        .catch(error => {
            console.log("ERROR", orange(error));
            res.render("thanks", {
                error: {
                    default: true
                }
            });
        });
});

///// SIGNATURES /////

router.get("/supporters", requireId, requireSignature, (req, res) => {
    console.log("Signatures page");
    db.getSigners()
        .then(signers => {
            console.log("Signers:", signers);
            res.render("supporters", {
                route: req.url,
                showcity: true,
                user: req.session.user,
                signers: signers,
                helpers: {
                    incremented(index) {
                        if (index !== undefined) {
                            console.log("index:", index);
                            index++;
                            if (index < 10) {
                                return "0" + index;
                            } else {
                                return index;
                            }
                        } else {
                            return "01";
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
});

router.get("/supporters/:city", requireId, requireSignature, (req, res) => {
    console.log("Signatures by city page");
    console.log("req.params:", req.params);
    const city = req.params.city;
    db.getSignersByCity(city)
        .then(signersbycity => {
            console.log("Signers:", signersbycity);
            res.render("supporters", {
                user: req.session.user,
                signature: true,
                count: req.session.count,
                city: city,
                signers: signersbycity,
                helpers: {
                    incremented(index) {
                        if (index !== undefined) {
                            console.log("index:", index);
                            index++;
                            if (index < 10) {
                                return "0" + index;
                            } else {
                                return index;
                            }
                        } else {
                            return "01";
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
});
