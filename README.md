# Rymdrosten Kafé - Webbaplikation
Den här [webbsidan](https://rymdrosten.netlify.app/start) är publicerad på Netlify. Den använder ett API för att hantera användare, recensioner, menyer och kategorier. API:et är publicerad på Render och NoSQL-databasen är MongoDB.

## Beskrivning
Användare kan se vad Rymdrosten har för meny sorterade i kategorier. Användare kan logga in och lägga upp recensioner. Användare med användarrolerna "admin" eller "root" kan hantera produkter, kategorier, radera andras recensioner och radera användare förutom sig själv eller andra admins, det senare kan endast root göra. Root kan inte radera sig själv. Auth Guard användes för att skydda olika sidor i instrumentpanelen från otillåten tillgång.

URL:en är dynamisk då allt är beroende på vad som står i URL:en. Om det står meny/bakverk då visas alla produkter i kategorin bakverk. Samma om det är en specifik produkt, meny/bakverk/quantum-toast. API:n automatiskt gör om namn till URL-vänligt.

## Översikt av koden
Webbapplikationen är skriven i Angular. Den har nio sidkomponenter, sex interfaces, tre partials, fyra services och en valideringsutillityklass med metoder för inmatningsfält.

Sidkomponenter:
* `cafe-menu` visar alla produkter eller alla produkter i en kategori.
* `cafe-menu-details` visar information om en produkt samt eventuella recensioner.
* `dashboard` för root och admins, val mellan att hantera användare eller produkter/kategorier. Skyddad av auth guard, endast root och admin har tillgång, visas också enbart för dessa användare.
* `editing-menu` för att hantera produkter eller kategorier. Skyddad av auth guard, endast root och admin har tillgång.
* `home` visar en profil över sig själv, recensioner och recensionstatistik.
* `profile` samma som home, men kan endast användas av root och admin, kan se andra användares profiler.
* `start` startsidan som introducerar Rymdrosten.
* `users` för att hantera användare. Skyddad av auth guard, endast root och admin har tillgång.

Interfaces:
* `category` - id, name {normal och slug}, created och updated.
* `pagination` - currentPage, pageSize, totalItems och totalPages.
* `product` - id, name {normal och slug}, inCategory {id, name {normal och slug}}, description, price, rating, created och updated.
* `response` - data, message, success. Används för strukturerad hålla sig till vad som skickas tillbaka från API:n.
* `review` - id, createdBy, rating, message, fullname, product, posted och edited.
* `user` - id, firstname, lastname, role, email, password, registrered och edited.

Partials:
* `form-message` - strukturerat visar felmeddelanden om inmatning eller om all gick bra.
* `main` - håller alla sidor samt footern.
* `sidebar-menu` - navigeringsmenyn.

Services:
* `account` - hanterar registrering, inloggning och kollar om användaren är inloggad. Men också sköter automatiskt uppdatering av om användaren loggas ut automatiskt eller byter namn.
* `cafe` - hanterar menyer och kategorier.
* `review` - hanterar recensioner.
* `user` - hanterar användare samt listar ut profil.

Valideringsutillityklassen grupperar endast massa inmatningsregler i en klass.
