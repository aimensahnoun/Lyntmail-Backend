BEGIN TRANSACTION;

CREATE TABLE stats(
   campaign_name varchar(100) not null,
   date date not null , 
   href varchar(50) not null,
   subscribed_to varChar(225) not null
);

COMMIT;