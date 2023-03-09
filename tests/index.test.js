const supertest = require("supertest");
const { app } = require("../index");

const db = require("../utils/db");
jest.mock("../utils/db");

const cookieSession = require("cookie-session");

// When the input is good, the user is redirected to the thank you page
test("POST /sign - if signature is valid, redirect to /thanks", () => {
    const reqBody = "signature=true";
    cookieSession.mockSessionOnce({
        user: {
            userId: 2
        }
    });

    db.addSignature = jest.fn().mockResolvedValueOnce("x");
    db.addSignature.mockImplementationOnce(() => Promise.resolve());
    return supertest(app)
        .post("/sign")
        .send(reqBody)
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

// When the input is bad, the response body contains an error message
test("POST /sign - if input is bad, the response body contains an error message", () => {
    const mockRequest = () => {
        return {
            body: { signature: true }
        };
    };
    const req = mockRequest();
    cookieSession.mockSessionOnce({
        user: {
            userId: "x"
        }
    });
    return supertest(app)
        .post("/sign")
        .then(res => {
            expect(req.body.signature).toBe(true);
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain("Something went wrong.");
        });
});

// Users who are logged out are redirected to the registration page when they attempt to go to the petition page

test("GET /sign - if user's not logged in, redirects to index page", () => {
    return supertest(app)
        .get("/sign")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/");
        });
});

// Users who are logged in are redirected to the thanks page when they attempt to go to either the registration page or the login page

test("GET /register - if user's logged in, redirects to /thanks", () => {
    cookieSession.mockSessionOnce({
        user: true
    });
    return supertest(app)
        .get("/register")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("GET /login - if user's logged in, redirects to /thanks", () => {
    cookieSession.mockSessionOnce({
        user: true
    });
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

// Users who are logged in are redirected to the sign page when they attempt to go to thanks but haven't signed yet
test("GET /thanks - if user's logged in but hasn't signed, redirects to /sign", () => {
    cookieSession.mockSessionOnce({
        user: true
    });
    return supertest(app)
        .get("/thanks")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/sign");
        });
});

// Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature
test("GET /sign - if user's logged in and has signed, redirects to /sign", () => {
    cookieSession.mockSessionOnce({
        user: {
            signature: true
        }
    });
    return supertest(app)
        .get("/sign")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

// Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to either the thank you page or the signers page

test("GET /supporters - if user's logged in but hasn't signed, redirects to /sign", () => {
    cookieSession.mockSessionOnce({
        user: true
    });
    return supertest(app)
        .get("/supporters")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/sign");
        });
});
