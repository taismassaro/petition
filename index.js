///// SET UP /////

const express = require("express");
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
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

///// ROUTES /////

app.get("/", (req, res) => {
    // req.session starts as an empty object
    console.log("Root route");
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    console.log("Petition route");
    res.render("petition", {});
});

app.post("/petition", (req, res) => {
    console.log("POST request");

    db.insertData(req.body.first, req.body.last, req.body.signature)
        .then(id => {
            console.log("Id:", id.rows[0].id);
            req.session.userSignature = id.rows[0].id;
            console.log("SUCCESS! Redirecting...");
            console.log("userSignature:", req.session.userSignature);
            res.redirect("/petition/thanks");
        })
        .catch(error => {
            console.log("ERROR:", error);
            res.render("petition", {
                error: error
            });
        });
});

app.get("/petition/thanks", (req, res) => {
    console.log("Thanks page");
    if (req.session.userSignature) {
        console.log("User signed");
        db.getUser(req.session.userSignature)
            .then(user => {
                db.getCount()
                    .then(count => {
                        console.log("Count:", count);
                        res.render("thanks", {
                            user: user.rows[0],
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
    }
});

app.get("/petition/signatures", (req, res) => {
    console.log("Signatures page");
    db.getSigners()
        .then(signers => {
            console.log("Signers:", signers.rows);
            res.render("signatures", {
                signers: signers.rows
            });
        })
        .catch(error => {
            console.log(error);
        });
});

app.listen(8080, () => console.log("Port 8080: Express server running."));
