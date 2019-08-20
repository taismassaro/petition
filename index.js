///// SET UP /////

const express = require("express");
const hb = require("express-handlebars");

const db = require("./utils/db");
const cookieSession = require("cookie-session");

const { hash, compare } = require("./utils/bc");
const csurf = require("csurf");

const chalk = require("chalk");

const orange = chalk.rgb(237, 142, 53);
const blue = chalk.rgb(28, 133, 230);

const app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

///// MIDDLEWARE /////

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(
    cookieSession({
        secret: "Priorities.",
        maxAge: 1000 * 60 * 60 * 24
    })
);

app.use(express.static("./public"));

app.use("/favicon.ico", (req, res) => res.sendStatus(404));

///// SECURITY MEASURES /////

app.use(csurf());
app.use(function(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

///// CHECK LOGIN /////
app.use((req, res, next) => {
    // if user is not logged in
    if (!req.session.user) {
        //if safe route
        if (["/", "/petition/register", "/petition/login"].includes(req.url)) {
            next();
        } else {
            res.redirect("/");
        }
    } else {
        if (["/", "/petition/register", "/petition/login"].includes(req.url)) {
            if (req.session.user.signature) {
                res.redirect("/petition/thanks");
            } else {
                res.redirect("/petition/sign");
            }
        } else {
            next();
        }
    }
});

///// ROUTES /////

///// INDEX /////

app.get("/", (req, res) => {
    console.log("Root route");
    res.render("index");
});

///// LOGIN /////

app.get("/petition/login", (req, res) => {
    console.log("Login route");
    res.render("login");
});

app.post("/petition/login", (req, res) => {
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
                            res.redirect("/petition/thanks");
                        } else {
                            res.redirect("/petition/sign");
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

///// LOGOUT /////
app.get("/petition/logout", (req, res) => {
    console.log("Root route");
    req.session.user = null;
    res.redirect("/");
});

///// REGISTER /////

app.get("/petition/register", (req, res) => {
    console.log("Register route");
    res.render("register");
});

app.post("/petition/register", (req, res) => {
    console.log("Register POST request");
    hash(req.body.password)
        .then(hash => {
            req.session.user = {
                first: req.body.first,
                last: req.body.last,
                email: req.body.email,
                password: hash
            };
            db.registerUser(req.session.user)
                .then(id => {
                    console.log("Id:", id.rows[0].id);
                    req.session.user.userId = id.rows[0].id;
                    console.log("SUCCESS! Redirecting...");
                    console.log("user_id:", req.session.user.userId);
                    res.redirect("/petition/profile");
                })
                .catch(error => {
                    console.log("ERROR:", orange(error));
                    res.render("register", {
                        error: error
                    });
                });
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("register", {
                error: error
            });
        });
});

///// PROFILE /////

app.get("/petition/profile", (req, res) => {
    console.log("Profile route");
    res.render("profile");
});

app.post("/petition/profile", (req, res) => {
    let user = req.session.user;
    console.log("Profile POST request");
    console.log("Request:", req.body);
    // console.log(checkUrl(req.body.url));
    db.addProfile(user.userId, req.body)
        .then(() => {
            res.redirect("/petition/sign");
        })
        .catch(error => {
            console.log("ERROR:", orange(error));
            res.render("profile", {
                error: "try again"
            });
        });
});

///// CANVAS SIGNING /////

app.get("/petition/sign", (req, res) => {
    console.log("Signature route");
    res.render("sign");
});

app.post("/petition/sign", (req, res) => {
    console.log("Signature POST request");
    if (req.body.signature) {
        req.session.user.signature = true;
        console.log("Session user:", req.session.user);
        db.addSignature(req.session.user.userId, req.body.signature)
            .then(() => {
                res.redirect("/petition/thanks");
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

app.get("/petition/thanks", (req, res) => {
    console.log("Thanks page");
    console.log("Session user:", req.session);
    if (req.session.user.signature) {
        console.log("User signed");
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
    } else {
        res.redirect("/");
    }
});

///// SIGNATURES /////

app.get("/petition/signatures", (req, res) => {
    console.log("Signatures page");
    if (req.session.user) {
        db.getSigners()
            .then(signers => {
                console.log("Signers:", signers.rows);
                res.render("signatures", {
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
    } else {
        res.redirect("/");
    }
});

app.listen(process.env.PORT || 8080, () =>
    console.log(`Express server running.`)
);
