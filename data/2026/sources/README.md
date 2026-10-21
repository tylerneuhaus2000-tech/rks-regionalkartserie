# RKS 2026 lap timing sources

R1/R2 original timing files are archived here. The supplied R3 ZIP contains a JSON transcription and matching CSV, but not the three referenced screenshot images. The R3 import is preserved unchanged in `round-3-import.json`, with SHA-256 `7aec56b55540f24a32b42e1c30421a83e8db4b2b7d9ea79377f68a1602390fa9`. Its 200 lap cells were checked against the ZIP's CSV; independent screenshot verification remains open. R3 adapter values are normalized to integer milliseconds in `../round-3.ts`.

| Source | Event | Layout | SHA-256 |
| --- | --- | --- | --- |
| `PHOTO-2026-08-21-18-26-51.jpg` | R1 · HOT 25 · 08.04.2026 | Daytona Essen · Bahn 2 · In & Outdoor | `9795c4d49936f6162a617df52c6e93d8593a7ca1f12da9817d1f4a98854b9a61` |
| `PHOTO-2026-08-21-18-26-51 2.jpg` | R1 · HOT 25 · 08.04.2026 | Daytona Essen · Bahn 2 · In & Outdoor | `3636373a9e16ee0be1017d7459761e5f18951816ae9fe757eebddd9969be2e80` |
| `WhatsApp Scan 2026-08-27 at 19.18.00.pdf` | R2 · HOT 30 · 27.08.2026 | Daytona Essen · Bahn 1 · Indoor | `f5f49deee67be374ffc0a4b42dea1b306d642cfcf5a806ef749df107a90bd85f` |
| `round-3-import.json` | R3 · HOT 25 · 21.10.2026 | Daytona Essen · Bahn 2, exact configuration unconfirmed | `7aec56b55540f24a32b42e1c30421a83e8db4b2b7d9ea79377f68a1602390fa9` |

The printed R1 sheets contain 212 recorded laps, R2 contains 236, and the R3 transcription contains 200. Empty cells after a driver's classified lap count are not missing transcriptions. The sources do not contain a Lap 0 or lap-by-lap positions. R3 official total race times are absent from the supplied import, so no totals are reconstructed from recorded lap sums.

## Best-lap validation

The automated audit compares each classified driver's minimum recorded lap against the supplied classification best lap across all three completed rounds. The values are kept separate and a mismatch is reported rather than normalized.

| Event | Driver | Official classification best | Fastest recorded lap | Lap | Resolution |
| --- | --- | ---: | ---: | ---: | --- |
| R1 · HOT 25 | Henry | 1:27.50 | 1:26.69 | 3 | Preserve both source values. Official R1 classification remains 1:27.50; lap-based analysis may use 1:26.69 only as the fastest recorded lap. |

R2 and R3 have no classification-best versus recorded-minimum discrepancies in the available transcriptions. The check is covered by `auditLapTimes2026()` and the season tests.
