# Schermlezertest

De automatische tests (axe, toetsenbord, Playwright) vangen veel, maar niet wat een
schermlezer echt zegt. Deze ronde doe ik met de hand op [papier.dionbm.nl](https://papier.dionbm.nl),
voor elke minor-release.

| Combinatie | Waarom |
|---|---|
| NVDA + Firefox (Windows) | Meest gebruikte combinatie op Windows |
| NVDA + Chrome (Windows) | Andere toegankelijkheidsboom dan Firefox |
| VoiceOver + Safari (macOS) | Safari focust knoppen anders, zie de focusfix in 0.4.0 |
| VoiceOver + Safari (iOS) | Aanraken in plaats van toetsenbord |

Noteer per stap: **ok**, of wat er werd voorgelezen en wat je verwachtte.

## Algemeen

- [ ] De kopstructuur (H in NVDA, rotor in VoiceOver) volgt de pagina: één h1, secties als h2.
- [ ] Landmarks: banner, hoofdnavigatie, main, contentinfo, en de kruimelpad- en pagineringsnavigatie met hun naam.
- [ ] "Naar de inhoud" springt naar de hoofdinhoud.

## Per component

| Component | Doe | Verwacht |
|---|---|---|
| Button (laden) | Druk op "Opslaan" en blijf erop | "Opslaan…, knop, niet beschikbaar" of "bezet"; de focus blijft op de knop |
| IconButton | Tab naar een icoonknop | Alleen de naam, bv. "Volgende plaat, knop" |
| Link extern | Tab naar een externe link | Naam plus "opent in een nieuw tabblad" |
| TextField met fout | Tab naar het e-mailveld met fout | Label, "ongeldig", daarna fout en hint |
| TextField prefix/suffix | Tab naar "Prijs in euro" | Het label noemt de eenheid; het €-teken wordt niet los voorgelezen |
| Select | Open met Alt+pijl omlaag | De native lijst; de gekozen optie wordt genoemd |
| Combobox | Typ "bjork" | "1 resultaat"; pijl omlaag leest "Vespertine, Björk · 2001"; Enter kiest |
| Combobox, niets gevonden | Typ "xyz" | "Geen resultaten" |
| Checkbox, Switch | Spatie | Status "aangevinkt" of "aan" wordt direct gemeld |
| RadioGroup | Pijltjes in de groep | Groepsnaam (legend) bij binnenkomen; per optie naam en beschrijving |
| SegmentedControl | Pijltjes bij Periode | "Maand, keuzerondje, 2 van 4" |
| Slider | Pijl rechts op Volume | De waarde met eenheid, bv. "31%" |
| Tabs | Pijltjes | "Vandaag, tab, 2 van 4, geselecteerd"; Tab gaat naar het paneel |
| Disclosure | Enter | "Uitgevouwen" of "samengevouwen" |
| Dialog | Open en sluit met Escape | Titel en beschrijving bij openen; focus terug op de opener |
| AlertDialog | Open "Uit collectie halen" | "Waarschuwing" of "alertdialoog" met titel; focus op Annuleren |
| Sheet | Open "Navigatie" | De verborgen titel "Navigatie" wordt toch genoemd |
| Tooltip | Tab naar een knop met tooltip | Naam, daarna de beschrijving uit de tooltip |
| Menu | Pijl omlaag op "Acties" | "Menu", eerste item met focus; Escape keert terug naar de knop |
| Toast | Klik "Toevoegen" bij Toast | "Plaat toegevoegd" wordt één keer voorgelezen, zonder dat de focus verplaatst |
| Notice | Lees de fout-notice | Gemeld als waarschuwing (role="alert"), de andere als status |
| Progress | Lees de voortgang | Naam en waarde, bv. "Hoezen ophalen, 2 van 5" |
| Table | Tabelnavigatie (Ctrl+Alt+pijlen) | Kolomkoppen worden bij elke cel genoemd |
| Breadcrumb | Lees het kruimelpad | "Kruimelpad, navigatie, lijst 4 items"; laatste item "huidige pagina" |
| Pagination | Tab door de pagina's | "Pagina 4, huidige pagina"; weggelaten pagina's (…) worden overgeslagen |

## Van rechts naar links

- [ ] Met `dir="rtl"` op `<html>`: leesvolgorde en pijltjesrichting in RadioGroup, Tabs en SegmentedControl kloppen.
