CREATE IF NOT EXISTS TABLE users (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY,
    password TEXT NOT NULL
);