CREATE TABLE preferences (
    preference TEXT NOT NULL
);

ALTER TABLE preferences
    ADD COLUMN
        user_id INTEGER 
            REFERENCES users(id)
            ON DELETE CASCADE NOT NULL;