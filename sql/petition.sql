DROP TABLE IF EXISTS petition;

CREATE TABLE petition(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    signature VARCHAR NOT NULL CHECK (signature != '')
);

INSERT INTO petition (first, last, signature) VALUES ('Leonardo DiCaprio', 41, 1);
