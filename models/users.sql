create table users (
  "id" serial primary key,
  "username" varchar(64) not null,
  "password" varchar(64) not null,
  "modified" date,
  "height" real,
  "gender" char,
  "birthday" date,
  "fields" varchar(255)
)
