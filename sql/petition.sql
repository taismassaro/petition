DROP TABLE IF EXISTS user_details CASCADE;
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(50) NOT NULL CHECK (first != ''),
    last VARCHAR(50) NOT NULL CHECK (last != ''),
    email VARCHAR(100) NOT NULL UNIQUE CHECK (email != ''),
    password VARCHAR(100) NOT NULL CHECK (password != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_details(
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INTEGER CHECK (age > 0),
    city VARCHAR(100),
    url VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures(
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature VARCHAR NOT NULL CHECK (signature != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
