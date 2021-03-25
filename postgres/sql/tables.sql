CREATE TABLE users
(
    user_id VARCHAR(100) NOT NULL,
    disp_name VARCHAR(50) NOT NULL,
	img_url VARCHAR(100),
	last_checked_in TIMESTAMP,
	PRIMARY KEY (user_id)
);

CREATE TABLE songs 
(
	song_id VARCHAR(100) NOT NULL,
	song_name VARCHAR(100) NOT NULL,
	song_artist VARCHAR(100) NOT NULL,
	song_href VARCHAR(100) NOT NULL,
	img_url VARCHAR(100) NOT NULL
);

CREATE TABLE checkins
(
	id SERIAL PRIMARY KEY,
	user_id VARCHAR(100) NOT NULL,
	song_id VARCHAR(100) NOT NULL,
	context_type VARCHAR(10),
	context_name VARCHAR(100),
	context_desc VARCHAR(500),
	context_href VARCHAR(100),
	checkin_time TIMESTAMP,
    checkin_token VARCHAR(200),
	CONSTRAINT uid
		FOREIGN KEY (user_id)
		REFERENCES users (user_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
);

CREATE TABLE friends (
	user_id1 VARCHAR(100) NOT NULL,
	user_id2 VARCHAR(100) NOT NULL,
	CONSTRAINT uid1
		FOREIGN KEY (user_id1)
		REFERENCES users (user_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT uid2 
		FOREIGN KEY (user_id2)
		REFERENCES users (user_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)

CREATE TABLE friend_reqs (
	user_id1 VARCHAR(100) NOT NULL,
	user_id2 VARCHAR(100) NOT NULL,
	CONSTRAINT uid1
		FOREIGN KEY (user_id1)
		REFERENCES users (user_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT uid2 
		FOREIGN KEY (user_id2)
		REFERENCES users (user_id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
)