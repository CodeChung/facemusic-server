ALTER TABLE entries
    DROP COLUMN user_id;

ALTER TABLE entries
    DROP COLUMN emotion_id;

DROP TABLE IF EXISTS entries;