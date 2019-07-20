CREATE TABLE IF NOT EXISTS entries (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY,
    date_created TIMESTAMP NOT NULL DEFAULT now(),
    notes TEXT,
    img TEXT NOT NULL,
    song TEXT
);

ALTER TABLE entries
    ADD COLUMN
        user_id INTEGER 
            REFERENCES users(id)
            ON DELETE CASCADE NOT NULL;