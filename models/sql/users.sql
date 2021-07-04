create table users (
  "id" serial primary key,
  "username" varchar(64) not null,
  "password" varchar(64) not null,
  "modified" date,
  "height" real,
  "birthday" date,
  "fields" varchar(255),
  "order" varchar(4),
  "theme" varchar(16),
  "persist" boolean,
  "protected" boolean
)
