--
-- PostgreSQL database dump
--

\restrict uhUR1KJhRhJEAxducrZYz3tQnHvqneMHmyp3wOYjYB98lboxdEYS07PDx8FBAzX

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: case_studies; Type: TABLE; Schema: public; Owner: flwf34
--

CREATE TABLE public.case_studies (
    id integer NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    body text NOT NULL,
    is_gated boolean NOT NULL
);


ALTER TABLE public.case_studies OWNER TO flwf34;

--
-- Name: case_studies_id_seq; Type: SEQUENCE; Schema: public; Owner: flwf34
--

CREATE SEQUENCE public.case_studies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_studies_id_seq OWNER TO flwf34;

--
-- Name: case_studies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: flwf34
--

ALTER SEQUENCE public.case_studies_id_seq OWNED BY public.case_studies.id;


--
-- Name: case_studies id; Type: DEFAULT; Schema: public; Owner: flwf34
--

ALTER TABLE ONLY public.case_studies ALTER COLUMN id SET DEFAULT nextval('public.case_studies_id_seq'::regclass);


--
-- Data for Name: case_studies; Type: TABLE DATA; Schema: public; Owner: flwf34
--

COPY public.case_studies (id, title, summary, body, is_gated) FROM stdin;
1	First case study (the title)	This is the summary of the first case study.	This is the body text!	f
2	My second case study	This case study requires prior approval.	This is the body text for the gated case study -- you got it!	t
\.


--
-- Name: case_studies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: flwf34
--

SELECT pg_catalog.setval('public.case_studies_id_seq', 2, true);


--
-- Name: case_studies case_studies_pkey; Type: CONSTRAINT; Schema: public; Owner: flwf34
--

ALTER TABLE ONLY public.case_studies
    ADD CONSTRAINT case_studies_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict uhUR1KJhRhJEAxducrZYz3tQnHvqneMHmyp3wOYjYB98lboxdEYS07PDx8FBAzX

