# eKYC Viewer

**Your document. Your device.** A small, independent PWA for opening Aadhaar Offline eKYC XML and ZIP packages in the browser. It is a reading utility, not a verification service and is not affiliated with UIDAI.

## What it does

- Opens an Offline eKYC XML directly.
- Opens the traditional encrypted ZIP locally with its Share Code, using ZIPCrypto and the browser's built-in `DecompressionStream` for DEFLATE entries.
- Parses identity fields, formatted address, reference ID, optional photo, and hashed contact attributes.
- Keeps contact hashes masked until explicitly revealed, and provides scoped copy controls plus a clear-session action.
- Works as an installable PWA with offline asset caching and a network-first app-shell update strategy.

## Privacy model

There is no server application, API route, upload endpoint, database, analytics, advertising, cookie banner, login, or document telemetry. The deployed site is static files only. File bytes and Share Codes are handled in page memory by `app.js`; they are not written to local storage, IndexedDB, the service-worker cache, or a server. Refreshing, leaving, or using **Clear session** removes the record from the active page session.

The service worker caches only application assets (`index.html`, CSS, JavaScript, manifest, and icon), never imported files. The service worker uses a versioned cache and network-first HTML so a newer published app shell can replace an older cached shell promptly.

## Important limitations

- This viewer does **not** cryptographically validate a UIDAI XML signature and must not be described as a UIDAI verification service.
- ZIP support covers the legacy ZIPCrypto + stored/DEFLATE formats used by the intended Offline eKYC flow. A browser without `DecompressionStream` can still open an XML but may not unpack a DEFLATE ZIP.
- The tool displays data present in the document. It does not determine whether a document is current, authentic, or acceptable for any transaction.
- Treat the original document and Share Code as sensitive. Do not use this repository, issue tracker, or public demo to share either.

## Local use

This is a dependency-free static site. Serve the repository with any HTTPS-capable static host (or a local static web server), then open `index.html`. Service workers need a secure context in production; `localhost` also qualifies during development.

To configure an optional support link, set `supportUrl` near the top of `app.js` to an approved Buy Me a Coffee URL. Leaving it blank (the default) means the support link does not render.

## Deployment

Vercel can deploy this repository as a static project with no build command. `vercel.json` deliberately adds a restrictive content-security policy, no-referrer behavior, disabled unused browser capabilities, and no-cache treatment for the service worker. Do not add an API, analytics SDK, remote font, image host, or tag manager without revisiting both this privacy model and the CSP.

## QA

Use only [`tests/fixtures/synthetic-ekyc.xml`](tests/fixtures/synthetic-ekyc.xml) for functional testing. Check the XML import, both hash reveal controls, every copy control, clear session, reduced-motion preference, keyboard activation of the import target, and an iPhone-width viewport for horizontal overflow. The fixture is intentionally fictional and contains no real personal data.

## Case study notes

### Problem

Offline eKYC is practical but not human-readable in its native form: an encrypted ZIP containing XML. Opening a file should not require users to surrender it to a third party simply to see what they already own.

### Constraints and research

The design starts from the Offline eKYC model: files can contain identity attributes, address, a portrait, hashes and reference data, while the Share Code unlocks the package. The essential constraint is privacy—any server-side parsing, retention, error logging, analytics, or sharing would undermine the purpose.

### UX and visual decisions

The experience is iPhone-first: a single clear action, a calm reading surface, explicit local-processing language at every sensitive moment, native-feeling typography, generous touch targets, a reduced-motion mode, and no horizontal overflow at narrow widths. The workflow separates **select**, **unlock**, **read**, and **clear**. Sensitive hash values are masked by default, and the unsupported verification claim is made directly in the record view.

### Technical approach and outcome

The browser reads XML with `DOMParser`, decrypts supported ZIPs in memory, inflates file data with `DecompressionStream`, and renders only the fields needed for a clear identity record. It has no backend. The outcome is a compact, portable document utility whose privacy statement is enforced by its architecture rather than a promise alone.
