///// SET UP /////

const express = require("express");
const hb = require("express-handlebars");

// do not require id
const primaryRoutes = require("./routes/primary-routes"); // login, register
// require id
const profileRoutes = require("./routes/profile-routes"); // profile, edit
const petitionRoutes = require("./routes/petition-routes"); // sign, thanks, supporters

const db = require("./utils/db");

const cookieSession = require("cookie-session");

const csurf = require("csurf");

const chalk = require("chalk");

const orange = chalk.rgb(237, 142, 53);
const blue = chalk.rgb(28, 133, 230);

const app = (exports.app = express());

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

let sigCount;

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
    console.log(`req.session in ${req.url}`, req.session);
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

///// ROUTES /////

app.use(primaryRoutes.router); // login, register
app.use(profileRoutes.router); // profile, edit
app.use(petitionRoutes.router); // sign, thanks, supporters

///// INDEX /////

app.get("/", (req, res) => {
    console.log("Root route");
    console.log("User cookies:", req.session.user);
    if (req.session.user) {
        db.getCount()
            .then(count => {
                console.log("Count:", count);
                res.render("index", {
                    user: req.session.user,
                    logged: true,
                    count: count
                });
            })
            .catch(error => {
                console.log("ERROR", error);
            });
    } else {
        res.render("index");
    }
});

///// LOGOUT /////
app.get("/logout", (req, res) => {
    console.log("Root route");
    req.session.user = null;
    res.redirect("/");
});

app.get("*", (req, res) => {
    res.redirect("/");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log(`Express server running.`)
    );
}
