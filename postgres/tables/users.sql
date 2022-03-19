BEGIN TRANSACTION;

CREATE TABLE users(
    id varchar(100) primary key,
    full_name varchar(225) not null,
    email varchar(320) not null unique,	
    api_key varchar(225),
    quota bigInt not null,
    subscriber_count bigint not null,
    subscription_type varchar(100) not null
);

COMMIT;