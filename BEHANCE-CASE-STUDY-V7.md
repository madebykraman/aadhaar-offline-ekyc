# eKYC Viewer — Behance Case Study V7

## Your document. Your device.

A privacy-first reader for Aadhaar Offline eKYC files, designed around one simple idea: the document should stay where the document already is.

**Independent product experiment · 2026 · Live · Open source · Free**

### Role
Product design, UX/UI, interaction design, frontend engineering, creative direction.

### Visual direction
The case study is deliberately product-led. It uses the same Inter-based typography, dark surfaces, blue interaction accent, green local-processing state, red error state, thin borders and restrained spacing as the actual eKYC Viewer. Product screenshots are evidence, not decorative mockups.

### Portfolio data policy
All case-study visuals use synthetic demo data only. No real Aadhaar number, address, phone number, email, portrait or identity record should appear in portfolio assets.

---

## 01 — Cover
**Your document. Your device.**

## 02 — Project snapshot
A tiny problem became a complete product experiment across UX, UI, interaction design and frontend implementation.

## 03 — Problem
Opening the file was harder than understanding the data. The native format exposes encrypted ZIPs, Share Codes and XML structure that ordinary readers should never need to learn.

## 04 — Design question
How might we make the file feel readable? The interface should absorb the complexity instead of making the user learn the format.

## 05 — Constraint
Privacy became the product architecture. No document upload, account, database, server-side document parsing or document analytics.

## 06 — Flow
**Select file → Unlock locally → Read record → Clear session.** Every additional feature is judged against this path.

## 07 — Information architecture
Identity first. Personal details second. Sensitive contact hashes third. Technical metadata last.

## 08 — Content model
Not every field deserves the same visual weight. Primary information is readable at a glance. Sensitive values are deliberately concealed. Technical structure is progressively disclosed.

## 09 — Visual direction
Inter, near-black surfaces, one cool interaction accent, restrained status colours, thin borders and generous spacing. The system is quiet so the record can speak.

## 10 — Final product shell
A reader, not a dashboard. The import surface is the first decision, not a homepage full of features.

## 11 — Import
The first interaction answers one question: what can I open here? ZIP and XML are treated as the same job. Share Code only appears when the package actually requires it.

## 12 — Identity record
Once opened, the interface stops talking about the file and starts talking about the person. The identity record becomes the hero.

## 13 — Sensitive data
Mask first. Reveal deliberately. Availability is not the same as exposure.

## 14 — Long content
Address is a reading surface. It should wrap naturally rather than become a compressed metadata row.

## 15 — Technical metadata
Advanced information belongs behind a door. Metadata remains available for people who actually need to inspect it without hijacking the primary reading experience.

## 16 — Error states
The happy path is not the product. Incorrect Share Code, unsupported encryption, invalid XML and incomplete packages all receive human-readable explanations.

## 17 — Mobile
Designed for the device where the problem happened. Large touch targets, safe-area aware spacing, readable long content and no horizontal overflow.

## 18 — Accessibility
Privacy and clarity are accessibility decisions too: readable contrast, visible focus, large targets, keyboard-compatible import, reduced motion and clear error copy.

## 19 — Build
Static frontend. Browser-side parsing. In-memory processing. No document API. The implementation follows the same constraint as the interface.

## 20 — Outcome
I didn't set out to build an Aadhaar product. I wanted to open one file. The solution became an exercise in restraint: remove the upload, account, dashboard and unnecessary exposure. Keep the document and the person reading it.

---

## Important disclaimer

The eKYC Viewer is an independent utility and is not affiliated with or endorsed by UIDAI. It is a local viewer, not a UIDAI verification service, and should not be described as cryptographically verifying an identity record merely because a file can be parsed.

Do not publish real Aadhaar documents, Share Codes or other sensitive identity information in portfolio screenshots, demos, issues or repository assets.
