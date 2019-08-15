const express = require("express");
const app = express();
const hb = require("express-handlebars");

const cookieParser = require("cookie-parser");

const db = require("./db");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(express.static("./public"));

app.use("/favicon.ico", (req, res) => res.sendStatus(404));

app.get("/petition", (req, res) => {
    console.log("Petition page");
    res.render("petition", {});
});

app.post("/petition", (req, res) => {
    console.log("POST request");
    console.log("REQUEST:", req.body);

    db.insertData(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            console.log("SUCCESS! Redirecting...");
            res.redirect("/thanks");
        })
        .catch(error => {
            console.log("ERROR:", error);
            res.render("petition", {
                helpers: {
                    errorMessage() {
                        return "error";
                    }
                }
            });
        });
});

app.get("/thanks", (req, res) => {
    console.log("Thanks page");
    res.render("thanks", {});
});

app.get("/signatures", (req, res) => {
    console.log("Signatures page");
    res.render("thanks", {});
});

app.listen(8080, () => console.log("Port 8080: Express server running."));
