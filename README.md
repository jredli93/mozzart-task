# Projekat - Sportski Mečevi

Od biblioteka je korisno [TanStack Virtual](https://tanstack.com/virtual/latest) za **virtual scroll**.

## Tehnologije

- **React**
- **Tailwind CSS**

## Pokretanje projekta

```bash
npm install
npm run dev
```

U **sidebaru** sa leve strane se nalaze **filteri po sportovima i ligama** koji se renderuju dinamički u zavisnosti od vrednosti API odgovora.

U delu sa **mečevima** odlučio sam se za prikaz podataka u **3 kolone na desktopu** i **jednoj na mobilnom**.  
U situaciji da sam dobijao kvote za meč, na desktopu bi se prikazivali mečevi u jednoj koloni i zauzimali bi celu širinu,  
ali obzirom na podatke koje sam imao u opticaju, odlučio sam se za ovakvo rešenje.

Postoji **pretraga** koja se aktivira nakon što korisnik unese **minimum 3 karaktera**.

**Računanje trajanja meča** sam poredio sa statusom jer su se dešavali slučajevi da je status *live*  
a `matchTime` u prošlosti ili u budućnosti, tako da sam menjao status na osnovu `matchTime` vrednosti iz API poziva.  
Takođe sam za **košarkaške utakmice** računao trajanje meča dodavajući vreme između četvrtina i poluvremena,  
i ukoliko je liga **NBA**, umesto 10 minuta po četvrtini računao sam **12**.

**Favoriti** se pamte po **kompozitnom ključu** koji se sastoji od `id + matchTime`,  
jer sam nailazio na slučajeve da sačuvam meč kao favorit i u narednim API pozivima  
se pojavi meč sa istim ID ali drugačijim informacijama.
