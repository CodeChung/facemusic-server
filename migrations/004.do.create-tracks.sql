CREATE TABLE tracks (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    img TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    
);

ALTER TABLE artists
    ADD COLUMN
        user_id INTEGER 
            REFERENCES users(id)
            ON DELETE CASCADE NOT NULL;