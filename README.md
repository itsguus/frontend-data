# Frontend Data
Live on [this link](https://itsguus.github.io/frontend-data/), [Voorbeeld](https://www.youtube.com/watch?v=NlBt-7PuaLk)

De Tech Track gaat dit jaar over "auto's in de stad". Het doel van de opdracht is om interessante patronen te vinden in de data en deze te transformeren in een interactieve datavisualisatie. Het datalab van de Volkskrant kan deze visualisaties vervolgens gebruiken om artiekelen te schrijven over dit onderwerp.

Mijn **onderzoeksvraag** luidt als volgt: 

**Wat is de parkeercapaciteit van parkeergelegenheden in steden en dorpen gedurende de week?**

## The project
![Screenshot](/img/screenshot.png)
Het project is een interactieve barchart waarin parkeercapaciteit per stad gezien kan worden voor elk uur van elke dag.

## Frameworks
Het framework dat ik heb gebruik om de data te renderen is [D3](https://d3js.org/). 

## main
Ik heb de static site generator [Jekyll](https://jekyllrb.com/) gebruikt om te coderen. Ik heb niet veel (lees: geen) Liquid gebruikt, maar ik vind de opbouw van de files prettig werken.

## Data
Alle data die ik heb gebruikt komt van het RDW. Een uitgebreide uitleg over de data van het RDW vind je in de [Research Case](https://github.com/itsguus/frontend-data/wiki/Research-Case).

Ik heb ook reverse geocoding gebruikt via een API van [openstreetmap](https://wiki.openstreetmap.org/wiki/API). Dit heb ik met een [redelijke omweg gedaan.](https://github.com/itsguus/frontend-data/wiki/Reverse-Geocoding)
