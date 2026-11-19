create table greetings (
  id serial primary key,
  message text not null
);

insert into greetings (message) values
  ('Hello from Supabase'),
  ('Row two'),
  ('Row three');



create table case_studies (
  id serial primary key,
  title text not null,
  summary text not null,
  body text not null,
  is_gated boolean not null
);

insert into case_studies (title, summary, body, is_gated) values
  (
    'First case study (the title)',
    'This is the summary of the first case study.',
    'This is the body text!',
    false
  ),
  (
    'My second case study',
    'This case study requires prior approval.',
    'This is the body text for the gated case study -- you got it!',
    true
  );