CREATE TABLE artists (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    img TEXT NOT NULL
);

ALTER TABLE artists
    ADD COLUMN
        user_id INTEGER 
            REFERENCES users(id)
            ON DELETE CASCADE NOT NULL;