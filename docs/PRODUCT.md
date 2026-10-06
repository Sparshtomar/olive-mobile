# Olive - product plan

## The problem, in one line

People don't fail at eating well because they lack data - they fail because logging is tedious and the data never tells them anything they can act on. Olive makes logging nearly effortless and turns logs (plus lab reports) into one clear "what to do next".

## Who it's for

Someone who has a goal (lose a few kilos, fix high cholesterol, manage pre-diabetes) and has tried a calorie app before and quit within two weeks because logging took too long.

## Principles

1. **Logging must take < 15 seconds.** Photo, voice or a sentence of text - Olive does the parsing. The user only confirms.
2. **AI proposes, the user disposes.** Every AI output (meal items, lab values) lands in an editable review step before it is saved. Health data that is silently wrong is worse than no data.
3. **One number that matters.** Home answers "how am I doing today?" in a glance: calories left, and the one nutrient your reports say to watch.
4. **Calm, not clinical.** A coach, not a hospital dashboard. No red alarms for being 50 kcal over.

## The four flows (and why these four)

| #   | Flow                                                           | Why it's core                                                                                                                          |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Goal setup** (onboarding)                                    | Every number in the app is relative to a goal. Without it calories are meaningless.                                                    |
| 2   | **Log a meal** - photo / voice / text → AI → review → save     | The habit loop. If this is slow, nothing else matters. Most polish goes here.                                                          |
| 3   | **Today** - progress vs goal, timeline, insights, streak       | Turns logs into understanding ("you're consistently low on protein at breakfast").                                                     |
| 4   | **Health reports** - upload → extract markers → review → track | Connects lab results to daily food: a high LDL becomes a daily saturated-fat budget that Today tracks. This is Olive's differentiator. |

### Flow 1 - Goal setup

- Steps: name → body basics (sex, age, height, weight) → activity level → goal (lose / maintain / gain) + pace.
- Live preview of the daily target while choosing pace, with the math explained (Mifflin-St Jeor BMR × activity − deficit).
- Guard rails: target never below 1200 kcal (F) / 1500 kcal (M); aggressive pace shows a gentle warning.
- "Explore with demo data" - loads a seeded user with 2 weeks of meals and two lab reports so a reviewer can feel the full product in 5 seconds.
- Goal is editable later from Home (sheet), not a separate profile screen.

### Flow 2 - Log a meal

- One "+" entry point; a sheet offers **Camera**, **Gallery**, **Voice** (hold to talk), **Type it**.
- Meal slot (breakfast / lunch / snack / dinner) auto-picked from time of day, changeable.
- AI returns items with portion, grams, calories and macros (+ fiber, sugar, sodium, saturated fat) and a confidence.
- Review screen: adjust each item's portion with a stepper (½×, 1×, 1½×, 2×…), delete items, add a missed item by text, low-confidence items are flagged.
- Edge cases: no food in photo, blurry photo, empty/inaudible voice note, mic/camera permission denied (explain + open settings), offline (logging disabled with a clear banner, data still viewable), AI rate-limited (automatic model fallback, then a friendly retry), duplicate save taps (idempotent), editing/deleting a saved meal, logging for a past day.

### Flow 3 - Today

- Calorie ring (eaten / remaining / over), protein-carbs-fat bars.
- Report-driven **Focus** card: e.g. "Saturated fat 9 / 13 g" when LDL is high.
- Meal timeline grouped by slot, tap to edit.
- Date strip to look back at previous days; 7-day trend vs target.
- Rule-based **Insights** ("3 of the last 5 days you ate 60% of calories after 6 pm"). Deterministic rules > LLM here: cheap, testable, never hallucinates.
- Streak of days with at least one logged meal; small celebration when you close a day within target.

### Flow 4 - Health reports

- Upload PDF or photo of a lab report.
- AI extracts markers and normalises them to a known catalog (LDL, HDL, total cholesterol, triglycerides, HbA1c, fasting glucose, vitamin D, B12, haemoglobin, TSH, creatinine, uric acid). Unknown markers are kept but not tracked.
- Review step to correct any value before saving; report date is editable (lab date ≠ upload date).
- Marker list with status (low / normal / high) against reference range and trend across reports.
- Out-of-range markers that diet can influence generate **nutrition focus targets** used on Today.
- Edge cases: not a lab report, unreadable scan, password-protected PDF, file too large, a marker with a different unit (mg/dL vs mmol/L).

## Deliberately cut

| Cut                            | Why                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Login / auth                   | Not the problem being evaluated. Anonymous device user + seeded demo users. API is shaped so auth can be added as a plugin. |
| Profile screen                 | Goal editing lives on Home.                                                                                                 |
| Free-form chat                 | A chatbot is easy to build and hard to make useful. Voice logging already covers "talk to Olive" for the core job.          |
| Water, sleep, steps, wearables | Dilutes the food + reports story.                                                                                           |
| Barcode scanning               | Photo covers packaged food reasonably well.                                                                                 |

## Delight

- Olive, a small mascot whose expression reflects the day (sleepy before first log, happy within target, gently concerned when well over).
- Haptics + a subtle burst when a day is closed within target; streak flame.
- Copy written like a friend, not a form.
