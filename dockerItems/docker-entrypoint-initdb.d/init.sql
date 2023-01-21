CREATE TABLE document (
	id SERIAL PRIMARY KEY,
	name TEXT,
	path TEXT,
	status INTEGER
);

CREATE TABLE document_type (
	id SERIAL PRIMARY KEY,
	name TEXT
);

CREATE TABLE predict (
	id SERIAL PRIMARY KEY,
	document_id INTEGER REFERENCES document(id),
	type_id INTEGER REFERENCES document_type(id),
	extra_info text
);

CREATE TABLE email_doctype_rel (
	id SERIAL PRIMARY KEY,
	type_id INTEGER REFERENCES document_type(id),
	email TEXT
);