# RKS 2026 lap timing sources

These are the three original files supplied for the 2026 race-lap archive. The transcription in `../lap-times.ts` keeps every visible timing value in integer milliseconds and points back to the corresponding source file.

| Source | Event | Layout | SHA-256 |
| --- | --- | --- | --- |
| `PHOTO-2026-08-21-18-26-51.jpg` | R1 · HOT 25 · 08.04.2026 | Daytona Essen · Bahn 2 · In & Outdoor | `9795c4d49936f6162a617df52c6e93d8593a7ca1f12da9817d1f4a98854b9a61` |
| `PHOTO-2026-08-21-18-26-51 2.jpg` | R1 · HOT 25 · 08.04.2026 | Daytona Essen · Bahn 2 · In & Outdoor | `3636373a9e16ee0be1017d7459761e5f18951816ae9fe757eebddd9969be2e80` |
| `WhatsApp Scan 2026-08-27 at 19.18.00.pdf` | R2 · HOT 30 · 27.08.2026 | Daytona Essen · Bahn 1 · Indoor | `f5f49deee67be374ffc0a4b42dea1b306d642cfcf5a806ef749df107a90bd85f` |

The printed R1 sheets contain 212 recorded laps and the R2 sheet contains 236. Empty cells after a driver's classified lap count are not missing transcriptions. The sheets do not contain a Lap 0 or lap-by-lap positions.

## Best-lap validation

The automated audit compares each classified driver's minimum recorded lap against the official best lap in the event classification. It checks every driver in both completed rounds. The values are kept separate and a mismatch is reported rather than normalized.

| Event | Driver | Official classification best | Fastest recorded lap | Lap | Resolution |
| --- | --- | ---: | ---: | ---: | --- |
| R1 · HOT 25 | Henry | 1:27.50 | 1:26.69 | 3 | Preserve both source values. Official R1 classification remains 1:27.50; lap-based analysis may use 1:26.69 only as the fastest recorded lap. |

R2 has no official-best versus recorded-minimum discrepancies. The check is covered by `auditLapTimes2026()` and the season tests.
