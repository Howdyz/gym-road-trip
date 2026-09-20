# Gym Road Trip

Find a gym to work out in anywhere in the US while you're traveling.
Installable PWA — works on phone and desktop. No build step, no API keys, no backend.

## Run locally

    python3 serve_safe.py 8488

Then open http://localhost:8488

`serve_safe.py` 404s dot-prefixed paths so the local preview matches what a
static host actually serves.

## Layout & install

Phone-first but responsive: a single column up to 800px, a two-up result grid
above that. Hover styling is switched off under `@media (hover:none)` so touch
devices get press states instead, and tap targets clear 48px. An install banner
appears on first visit — a real `beforeinstallprompt` on Android and desktop
Chrome, Share-sheet instructions on iOS, which has no install event.

**Geolocation requires HTTPS** on every platform. It will not work from a plain
`http://` host other than localhost — which is why this is served from Pages.

## How it works

- **Location**: browser Geolocation API, with a Nominatim city/ZIP search as fallback
  (also lets you scout a stop before you get there).
- **Gyms**: OpenStreetMap via the Overpass API — free, no key, no rate-limit signup.
  Falls back to a second Overpass mirror if the first is down.
- **Navigation**: hands off to the phone's own maps app via a Google Maps
  directions URL, so turn-by-turn happens in the app that does it best.
- **Offline**: `sw.js` caches the shell so the app opens without signal.
  Gym lookups are never cached — stale results would be worse than none.

## Gym vs. studio

OSM lumps yoga, pilates, climbing and martial-arts studios in with weight gyms.
`isStudio()` in index.html splits them using the `sport` tag where it exists
(~1/3 of records) and the name otherwise. Studios are hidden by default behind
the checkbox. CrossFit boxes count as gyms — travelers drop in on them.

## Data coverage — the honest numbers

Measured against live Overpass, Sept 2026:

| | metro (Denver bbox) | rural (150mi of I-80, NE) |
|---|---|---|
| gyms found | 193 | 5 |
| have a phone number | 40% | 2 of 5 |
| have a street address | 76% | — |
| have opening hours | 21% | — |

Metros are well covered. **Rural stretches are thin** — that's OSM's blind spot,
and it's exactly where a road-tripper needs this most. Gyms without a phone
number get a "look it up" link to Maps instead.

## Swapping in a commercial data source

`fetchGyms(origin, radiusMiles)` is the only function that talks to a gym API.
It returns a Promise of objects shaped:

    {name, lat, lon, phone, website, hours, address, brand, sport, studio}

Replace that one function with a Google Places (Nearby Search, `type=gym`) call
and everything else — distance, sorting, filtering, cards, navigation — works
unchanged. Places needs a billed API key, and the key must live behind a small
backend proxy rather than in this file.
