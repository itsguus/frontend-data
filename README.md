# Frontend Data
Live on [this link](https://itsguus.github.io/frontend-data/).

[De barchart van Curran heb ik als voorbeeld gebruikt.](https://www.youtube.com/watch?v=NlBt-7PuaLk)

De Tech Track gaat dit jaar over "auto's in de stad". Het doel van de opdracht is om interessante patronen te vinden in de data en deze te transformeren in een interactieve datavisualisatie. Het datalab van de Volkskrant kan deze visualisaties vervolgens gebruiken om artiekelen te schrijven over dit onderwerp.

Mijn **onderzoeksvraag** luidt als volgt: 

**Wat is de parkeercapaciteit van parkeergelegenheden in steden en dorpen gedurende de week?**

## The project
![Screenshot](/img/screenshot.png)

Het project is een interactieve barchart waarin parkeercapaciteit per stad gezien kan worden voor elk uur van elke dag. Aan de linkerkant van de visualisatie heb je de barchart. Aan de rechter kant heb je je inputs. Hier kun je bovenin een dag en een tijd kiezen. Hieronder kun je alle steden aanvinken die je in de visualisatie wilt zien. Deze worden dan ingeladen.

## Frameworks
Het framework dat ik heb gebruik om de data te renderen is [D3](https://d3js.org/). 

## main
Ik heb de static site generator [Jekyll](https://jekyllrb.com/) gebruikt om te coderen. Ik heb niet veel (lees: geen) Liquid gebruikt, maar ik vind de opbouw van de files prettig werken.

## Data
Alle data die ik heb gebruikt komt van het RDW. 

### **Dataset:** [RDW Open Data Geometrie Gebied](https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-GEOMETRIE-GEBIED/nsk3-v9n7)

_Hiermee kan ik kijken welke areaID in welke stad ligt._

**Belangrijke kolommen:**
* AreaID
* GeoDataAsText

### **Dataset:** [RDW Open Data Parking Toegang](https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-PARKING-TOEGANG/edv8-qiyg)

_Hier kun je per AreaID kijken wanneer je hier wel of niet in kunt._

**Belangrijke kolommen:**
* AreaID
* Days (day of the week) 
* EnterFrom (tijd in 24h)
* EnterUntil  (tijd in 24h)

### **Dataset:** [RDW Open Data Parkeren Specificaties Parkeergebied](https://opendata.rdw.nl/Parkeren/Open-Data-Parkeren-SPECIFICATIES-PARKEERGEBIED/b3us-f26s)


_Deze dataset bevat een capaciteit per parkeeradres. Hierin staat ook of het laadpalen bevat. Misschien is het ook leuk om hier een toggle voor te maken in de uiteindelijke visualisatie._

**Belangrijke kolommen:**
* Capacity
* ChargingPointCapacity

## Reverse geocoding
Ik heb ook reverse geocoding gebruikt via een API van [openstreetmap](https://wiki.openstreetmap.org/wiki/API). Dit heb ik met een [redelijke omweg gedaan.](https://github.com/itsguus/frontend-data/wiki/Reverse-Geocoding)

## Installatie
Navigaar naar de gewenste directory. Zet de volgende code in je terminal.
```
git clone https://github.com/itsguus/functional-programming

cd functional-programming

npm start

jekyll serve
```
De site staat nu lokaal op 127.0.0.1:4000
