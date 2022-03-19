BEGIN TRANSACTION;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE subscriber(
   sub_id uuid primary key default uuid_generate_v4(),
   campaign_name varchar(100) not null,
   date date not null , 
   email varchar(320) not null, 
   full_name varchar(225) not null,
   href varchar(50) not null,
   phone_number varchar(50),
   subscribed_to varChar(225) not null,
   unique(email, href)
);

COMMIT;