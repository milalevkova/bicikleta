# 🚲 Bičikleta

## O projektu

**Bičikleta** je web aplikacija za rezervaciju i iznajmljivanje bicikala na području Pule.

Ideja aplikacije je korisnicima omogućiti da na jednostavan način pronađu dostupan bicikl, rezerviraju ga za željeni termin te nakon toga prate svoj najam.

Umjesto da korisnik mora telefonski provjeravati dostupnost bicikla ili dolaziti na lokaciju kako bi saznao postoji li slobodan bicikl, osnovne informacije može provjeriti kroz aplikaciju.

Aplikacija prikazuje dostupne bicikle, njihove podatke, lokaciju i cijenu najma. Nakon registracije i prijave korisniku se omogućuju rezervacija bicikla te pregled vlastitih rezervacija i najmova.

Sustav također sadrži administratorski dio preko kojeg se upravlja biciklima, korisnicima, rezervacijama i najmovima.

---

## Tim

Aplikaciju **Bičikleta** izrađuju:

- **Rea Lakošeljac**
- **Mila Levkova**

---

## Fakultet i kolegij

Projekt se izrađuje u sklopu kolegija **Programsko inženjerstvo** na Fakultetu informatike u Puli.

- [Fakultet informatike u Puli](https://fipu.unipu.hr/)
- [Programsko inženjerstvo](http://ntankovic.unipu.hr/pi)

### Mentor

**doc. dr. sc. Nikola Tanković**

- [ntankovic.unipu.hr](http://ntankovic.unipu.hr/)

---

# Kako Bičikleta funkcionira?

Korištenje aplikacije zamišljeno je kroz nekoliko jednostavnih koraka.

Korisnik prvo može pregledati bicikle koji se nude za najam. Za svaki bicikl prikazuju se osnovne informacije poput naziva, vrste bicikla, lokacije, cijene najma i dostupnosti.

Ako korisnik želi rezervirati bicikl, potrebno je napraviti korisnički račun i prijaviti se u aplikaciju.

Nakon prijave korisnik može odabrati bicikl i željeni termin rezervacije. Rezervacija se sprema u bazu podataka i povezuje s korisnikom koji ju je napravio.

Kada započne korištenje bicikla, pokreće se najam. Tijekom aktivnog najma aplikacija prati trajanje vožnje i cijenu. Nakon završetka najma spremaju se podaci o završenoj vožnji.

Na taj način korisnik na jednom mjestu ima pregled cijelog procesa:

**Pregled bicikla → Rezervacija → Početak najma → Vožnja → Završetak najma**

---

# Vrste korisnika

Aplikacija razlikuje dvije glavne korisničke uloge:

- **korisnik**
- **administrator**

Osim njih postoji i neprijavljeni posjetitelj koji može pregledavati osnovni sadržaj aplikacije.

---

## Neprijavljeni posjetitelj

Osoba koja prvi put otvori aplikaciju ne mora odmah napraviti korisnički račun.

Bez prijave može:

- otvoriti početnu stranicu
- pregledavati bicikle
- pregledati osnovne podatke o biciklima
- otvoriti stranicu za prijavu
- napraviti novi korisnički račun

U navigaciji tada vidi:

**Početna | Bicikli | Prijava | Registracija**

Za rezervaciju i najam bicikla korisnik se mora prijaviti.

---

# Korisnik

Nakon registracije novi račun automatski dobiva ulogu **korisnik**.

Korisnik može koristiti funkcionalnosti vezane uz rezervaciju i najam bicikla.

### Korisnik može:

- registrirati se u aplikaciju
- prijaviti se pomoću e-mail adrese i lozinke
- pregledavati bicikle
- pregledati detalje odabranog bicikla
- vidjeti cijenu najma
- vidjeti lokaciju bicikla
- provjeriti dostupnost
- rezervirati bicikl
- odabrati termin rezervacije
- pregledavati svoje rezervacije
- otkazati rezervaciju
- započeti najam bicikla
- pratiti trajanje aktivnog najma
- pratiti trenutnu cijenu najma
- završiti najam
- pregledavati svoje prethodne najmove
- odjaviti se iz aplikacije

Kada je korisnik prijavljen, njegova navigacija izgleda ovako:

**Početna | Bicikli | Moje rezervacije | Moji najmovi | Odjava**

Korisnik vidi samo **svoje rezervacije i svoje najmove**.

---

# Administrator

Administrator je korisnik koji ima dodatne ovlasti za upravljanje aplikacijom.

Njegova uloga nije rezerviranje bicikala, nego održavanje podataka potrebnih za normalan rad sustava.

Nakon prijave aplikacija provjerava njegovu ulogu. Ako korisnik u bazi ima:

`uloga: "administrator"`

aplikacija ga preusmjerava na administratorski dio.

### Administrator može:

- prijaviti se u aplikaciju
- pristupiti administratorskom dijelu
- pregledavati bicikle
- dodavati nove bicikle
- uređivati postojeće bicikle
- mijenjati naziv bicikla
- mijenjati vrstu bicikla
- mijenjati cijenu najma
- mijenjati lokaciju bicikla
- mijenjati stanje bicikla
- određivati količinu pojedinog bicikla
- pregledavati korisnike
- pregledavati rezervacije
- pregledavati najmove
- upravljati podacima potrebnima za rad sustava
- odjaviti se iz aplikacije

Kada je administrator prijavljen, osnovna navigacija prikazuje:

**Početna | Bicikli | Odjava**

Administratorskim funkcijama pristupa kroz poseban administratorski dio aplikacije.

---

# Bicikli i dostupna količina

Svaki bicikl u aplikaciji ima podatke potrebne korisniku za odabir.

Primjer podataka jednog bicikla:

- naziv
- vrsta
- cijena po satu
- lokacija
- stanje
- količina
- slika

Polje **količina** posebno je važno jer omogućuje da postoji više primjeraka istog bicikla.

Primjer:

Ako administrator postavi:

`količina: 5`

to znači da sustav raspolaže s **5 primjeraka tog bicikla**.

Zbog toga rezervacija jednog primjerka ne znači automatski da bicikl više nije dostupan. Sustav treba uzeti u obzir koliko primjeraka postoji i koliko ih je već rezervirano ili se trenutno koristi.

---

# Rezervacije

Rezervacija omogućuje korisniku da unaprijed odabere bicikl koji želi koristiti.

Rezervacija povezuje:

- korisnika
- bicikl
- datum i vrijeme
- status rezervacije

Nakon izrade rezervacije korisnik je može pronaći u dijelu **Moje rezervacije**.

Time korisnik uvijek ima pregled bicikala koje je rezervirao i termina svojih rezervacija.

---

# Najam bicikla

Rezervacija i najam nisu ista stvar.

**Rezervacija** znači da je korisnik unaprijed rezervirao bicikl.

**Najam** započinje kada korisnik stvarno počne koristiti bicikl.

Kod aktivnog najma aplikacija prati:

- koji korisnik koristi bicikl
- koji bicikl koristi
- vrijeme početka najma
- trajanje najma
- cijenu najma
- status najma

Kada korisnik završi vožnju, najam se završava i spremaju se konačni podaci o vožnji.

Korisnik svoje najmove može pregledavati u dijelu **Moji najmovi**.

---

# Registracija i prijava

Za registraciju i prijavu koristi se **Firebase Authentication**.

Prilikom registracije Firebase izrađuje korisnički račun i svakom korisniku dodjeljuje jedinstveni **UID**.

Taj UID koristi se i za povezivanje korisnika s njegovim podacima u Firestore bazi.

Primjer korisničkog profila:

- ime
- prezime
- e-mail
- telefon
- uloga
- status
- datum registracije

Novi korisnik prilikom registracije automatski dobiva:

`uloga: "korisnik"`

Administrator u bazi ima:

`uloga: "administrator"`

Na temelju te vrijednosti aplikacija zna koje funkcionalnosti i koju navigaciju treba prikazati.

---

# Baza podataka

Za spremanje podataka koristi se **Cloud Firestore**.

Glavni podaci aplikacije organizirani su kroz kolekcije:

### `korisnici`

Sadrži podatke o registriranim korisnicima i njihovim ulogama.

### `bicikli`

Sadrži podatke o biciklima koji se nude za najam.

### `rezervacije`

Sadrži rezervacije koje su korisnici napravili.

### `najmovi`

Sadrži podatke o aktivnim i završenim najmovima bicikala.

---

# Tehnologije

Za razvoj aplikacije koriste se:

- **Vue.js** – izrada korisničkog sučelja
- **Vue Router** – navigacija između stranica
- **Firebase Authentication** – registracija i prijava korisnika
- **Cloud Firestore** – baza podataka
- **HTML**
- **CSS**
- **JavaScript**

Aplikacija je organizirana pomoću Vue komponenti i zasebnih stranica za pojedine funkcionalnosti.

---

# Prototip

Prije i tijekom razvoja aplikacije izrađen je prototip korisničkog sučelja.

Prototip prikazuje izgled i osnovni način korištenja aplikacije, uključujući najvažnije stranice i prijelaze između njih.

Javni prototip dostupan je na poveznici:

[Otvori prototip aplikacije Bičikleta](link)

---

# Planirana zaduženja članova tima

Svaki član tima samostalno dodaje svoja planirana zaduženja u README i radi vlastiti Git commit.

## Rea Lakošeljac

Planirana zaduženja:

- 

## Mila Levkova

Planirana zaduženja:

- 
