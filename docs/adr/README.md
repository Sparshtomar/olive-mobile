# Architecture decision records

One file per decision that shaped the app and would be expensive to reverse. Each
records the context, the decision, what it costs, and the **trigger** that would make us
revisit it. A decision without a trigger is dogma.

| #    | Decision                                                                                  | Status   |
| ---- | ----------------------------------------------------------------------------------------- | -------- |
| 0001 | [Server state in TanStack Query, UI state in Zustand, no Redux](0001-state-management.md) | Accepted |
| 0002 | [The shared Zod package is the DTO layer](0002-shared-zod-contract.md)                    | Accepted |
| 0003 | [Features own their screens; `ui` and `lib` are domain-free](0003-feature-slices.md)      | Accepted |
| 0004 | [One `Sheet`: bottom sheet on phones, dialog on desktop](0004-adaptive-sheet.md)          | Accepted |
| 0005 | [Design tokens with a light and a dark palette; dark first](0005-design-tokens.md)        | Accepted |
| 0006 | [User-like testing drives the web build in a real browser](0006-browser-smoke-test.md)    | Accepted |
| 0007 | [First-run hints are declared as data next to each screen](0007-declarative-hints.md)     | Accepted |

The API's decisions live in [olive-server/docs/adr](https://github.com/Sparshtomar/olive-server/tree/main/docs/adr).
