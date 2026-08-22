CREATE DATABASE bicikleta;
USE bicikleta;


CREATE TABLE korisnik (
id INTEGER NOT NULL AUTO_INCREMENT,
ime VARCHAR(20) NOT NULL,
prezime VARCHAR(20) NOT NULL,
oib CHAR(11),
email VARCHAR(50) UNIQUE,
lozinka VARCHAR(255),
PRIMARY KEY (id)
);

CREATE TABLE bicikl (
id INTEGER NOT NULL AUTO_INCREMENT,
oznaka VARCHAR(10) NOT NULL,
vrsta VARCHAR(20) NOT NULL,
datum_kupnje DATETIME NOT NULL,
cijena_najma NUMERIC(10,2) NOT NULL,
status VARCHAR(20) DEFAULT 'dostupan',
PRIMARY KEY (id)
);

CREATE TABLE zaposlenik (
id INTEGER NOT NULL AUTO_INCREMENT,
ime VARCHAR(20) NOT NULL,
prezime VARCHAR(20) NOT NULL,
datum_zaposlenja DATETIME NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE oprema (
id INTEGER NOT NULL AUTO_INCREMENT,
naziv VARCHAR(20) NOT NULL,
cijena NUMERIC(10,2) NOT NULL,
PRIMARY KEY (id)
);

CREATE TABLE najam (
id INTEGER NOT NULL AUTO_INCREMENT,
id_bicikl INTEGER NOT NULL,
id_korisnik INTEGER NOT NULL,
  id_zaposlenik INTEGER NOT NULL,
datum_pocetak DATETIME NOT NULL,
datum_kraj DATETIME NOT NULL,
status VARCHAR(20) DEFAULT 'aktivan',
PRIMARY KEY (id),
FOREIGN KEY (id_bicikl) REFERENCES bicikl (id),
FOREIGN KEY (id_korisnik) REFERENCES korisnik (id),
FOREIGN KEY (id_zaposlenik) REFERENCES zaposlenik (id)
);

CREATE TABLE stavka_najam (
id INTEGER NOT NULL AUTO_INCREMENT,
id_najam INTEGER NOT NULL,
id_oprema INTEGER NOT NULL,
kolicina INTEGER NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (id_najam) REFERENCES najam (id),
FOREIGN KEY (id_oprema) REFERENCES oprema (id),
UNIQUE (id_najam, id_oprema)
);

INSERT INTO bicikl (oznaka, vrsta, datum_kupnje, cijena_najma, status)
VALUES
('B1', 'MTB', '2024-01-10 10:00:00', 5.00, 'dostupan'),
('B2', 'City', '2023-06-15 12:00:00', 3.50, 'dostupan'),
('B3', 'Road', '2022-09-05 09:30:00', 4.00, 'iznajmljen'),
('B4', 'E-Bike', '2025-02-20 14:00:00', 7.50, 'dostupan');

SELECT * FROM bicikl;

