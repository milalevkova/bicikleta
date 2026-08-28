# Bičikleta

Bičikleta je web aplikacija za rezervaciju i najam bicikala na području Pule. Projekt je izrađen u Vue 3 i koristi Firebase Authentication za prijavu korisnika te Cloud Firestore za spremanje podataka.

## Glavne funkcionalnosti

### Korisnik

- registracija i prijava
- pregled i filtriranje bicikala
- pregled detalja bicikla
- provjera dostupnosti za odabrani termin
- rezervacija bicikla
- otkazivanje aktivne rezervacije
- pokretanje najma u rezerviranom terminu
- prikaz trajanja i trenutne cijene najma
- završavanje najma
- pregled vlastitih rezervacija i najmova
- uređivanje profila
- dodavanje recenzije nakon završenog najma

### Administrator

- pregled ukupnog broja bicikala, korisnika, aktivnih rezervacija i najmova
- pregled ukupne zarade
- dodavanje i uređivanje bicikala
- upravljanje količinom bicikala
- aktiviranje i deaktiviranje modela bicikla
- blokiranje i aktiviranje korisnika
- pregled svih rezervacija i najmova

## Tehnologije

- Vue 3
- Vue Router
- Firebase Authentication
- Cloud Firestore

## Firestore kolekcije

- `korisnici`
- `bicikli`
- `rezervacije`
- `najmovi`
- `recenzije`

## Firebase

Firebase Authentication koristi se za registraciju i prijavu korisnika.

Cloud Firestore koristi se za spremanje podataka o korisnicima, biciklima, rezervacijama, najmovima i recenzijama.

Sigurnosna pravila Firestore baze postavljena su izravno u Firebase Console.

## Pokretanje projekta

```bash
npm install
npm run dev
```
