BEGIN TRANSACTION;

CREATE EXTENSION citext;

CREATE TABLE link(
    href varchar(40) primary key,
    campaign_name citext not null,
    campaign_type varchar(100) not null,
    is_active boolean not null,
    list_id varchar(225),
    owner_id varchar(100) not null,
    unique (campaign_name , owner_id , campaign_type)
);

COMMIT;
