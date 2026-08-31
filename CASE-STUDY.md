# eKYC Viewer

## Your document. Your device.

A privacy-first interface for opening Aadhaar Offline eKYC files locally in the browser.

**Role:** Product design, UX/UI, frontend, interaction design  
**Type:** Independent product experiment  
**Year:** 2026  
**Status:** Live, open source, free to use

---

## 01. I just wanted to open a file.

An Aadhaar Offline eKYC package is useful, but its native format is not designed for casual reading. A user may receive an encrypted ZIP, unlock it with a Share Code, and find an XML containing identity information, address, a portrait, hashes and reference data.

The problem was deliberately small:

> Make the information readable without requiring the document to be uploaded somewhere else.

This was not an attempt to replace UIDAI, build an identity platform, or create another KYC workflow. It was a focused utility for a very specific moment: **I already have the file. I just want to read it.**

---

## 02. The constraint became the concept.

The most important product decision came before the visual design.

**The document should not need a server.**

The complete flow is designed around local processing:

```text
Aadhaar ZIP / XML
        ↓
   Select locally
        ↓
 Share Code, if needed
        ↓
 Local ZIP decryption
        ↓
    XML parsing
        ↓
 Readable identity record
        ↓
      Clear
```

No document upload. No account. No database. No analytics. No document telemetry.

Privacy is therefore not a badge placed beside the interface. It is a property of the architecture.

---

## 03. Designing the mental model

The file structure is technical. The user's goal is not.

The interface translates the underlying structure into four simple actions:

**Select → Unlock → Read → Clear**

The user does not need to understand XML nodes, ZIP entries or compression methods to get a readable record.

The interface should understand the file for them.

---

## 04. From machine-readable to human-readable

The raw document contains structured fields. The product turns them into a reading experience:

- identity name
- date of birth
- gender
- reference ID
- formatted address
- portrait
- mobile hash
- email hash
- technical metadata

The address is reconstructed into a natural reading order instead of exposing the underlying field structure.

The result feels closer to a document than a developer console.

---

## 05. Designing for sensitive information

Not every piece of available information deserves equal visual prominence.

Contact hashes are masked by default.

```text
MOBILE HASH                         Show
••••••••••••••••

EMAIL HASH                          Show
••••••••••••••••
```

Only an explicit action reveals them. Copy controls are scoped to individual fields rather than exposing everything through one accidental tap.

This is a small interaction, but it captures the broader principle:

> Availability is not the same thing as exposure.

---

## 06. Designing the states

The product is more than the happy path.

```text
EMPTY
  ↓
FILE SELECTED
  ↓
ZIP DETECTED
  ↓
SHARE CODE
  ↓
DECRYPTING
  ↓
PARSING
  ↓
IDENTITY RECORD
  ↓
CLEAR SESSION
```

There are explicit failure states for invalid XML, incomplete ZIPs, unsupported compression, missing Share Codes and incorrect Share Codes.

The interface always explains what is happening locally instead of making a sensitive operation feel like an opaque upload.

---

## 07. The identity record

The record view is intentionally calm.

A compact portrait card establishes identity first. Personal details follow as individual reading surfaces. Technical metadata is deliberately collapsed until it is needed.

The hierarchy is:

**Who is this? → What information is here? → What technical details exist?**

That keeps the primary task readable without hiding the underlying information.

---

## 08. Verification is not parsing

One of the most important product decisions was what **not** to claim.

The viewer parses and displays the document. It does not present itself as a UIDAI verification service and does not claim that a displayed record is authentic merely because it opened successfully.

The interface therefore uses language such as **Parsed locally** and **Opened locally**, not **Verified**.

That distinction keeps the product honest about its actual capabilities.

---

## 09. Visual language

The visual system is intentionally closer to a premium document utility than a government portal or fintech dashboard.

**Canvas**  
Near-black background with restrained surface separation.

**Typography**  
Large editorial display type, compact uppercase labels and monospace treatment for technical identifiers.

**Colour**  
A cool blue accent establishes interaction hierarchy. Green is reserved for local-processing and success states. Red is reserved for errors and destructive actions.

**Shape**  
Soft, generous radii with thin borders keep dense information from feeling like a spreadsheet.

**Motion**  
Short state transitions communicate selection, parsing, success, reveal and clearing without becoming decoration.

The visual principle is simple:

> **Quiet interface. Loud hierarchy.**

---

## 10. iPhone first

The product was designed around the device where the original problem occurred.

That meant treating mobile as the primary interface rather than a collapsed desktop layout.

Key decisions:

- large touch targets
- safe-area aware spacing
- no horizontal overflow
- compact navigation
- one-handed import flow
- readable long addresses
- masked sensitive values
- reduced-motion support
- keyboard-accessible file selection
- installable PWA behaviour

The desktop version follows the same system without changing the mental model.

---

## 11. Technical approach

The project is intentionally dependency-light and static.

`DOMParser` handles XML parsing in the browser. Supported legacy ZIP packages are decrypted in memory using ZIPCrypto and decompressed with the browser's `DecompressionStream` where available. The parsed record is rendered directly into the page.

The deployed product has no application backend.

The service worker caches only application assets and never imported documents.

The result is a portable static utility that can be deployed on a conventional static host without creating an identity-data processing service.

---

## 12. What I learned

The interesting part was not making a pretty viewer.

It was discovering how much product design happens outside the visual layer.

The strongest decisions were constraints:

**Don't upload the file.**  
**Don't retain the file.**  
**Don't expose hashes by default.**  
**Don't call parsing verification.**  
**Don't make the user understand the XML.**  
**Don't add a feature unless it improves the one job.**

The final interface is the visible result of those decisions.

---

## 13. Outcome

A small problem became a complete product experiment covering research, information architecture, UX, UI, interaction design, frontend engineering, privacy architecture and product communication.

The project is intentionally free and independent.

**Live:** eKYC Viewer  
**Source:** GitHub  
**Support:** optional Buy Me a Coffee link, with no payment requirement

> I didn't set out to build an Aadhaar product.
>
> I wanted to open one file.
>
> The solution turned out to be less about adding functionality and more about removing everything that didn't need to happen.
>
> No upload. No account. No dashboard. No server.
>
> Just the file, the device and a better interface.

---

## Privacy and attribution note

This is an independent utility and is not affiliated with or endorsed by UIDAI. It is a local viewer, not a UIDAI verification service. Do not upload real Aadhaar documents, Share Codes or other sensitive identity information to public issue trackers or project demos.

The visual case-study assets should use synthetic or redacted data only.
