# ShopLedger guidance

## Stack
- Node.js CommonJS application using Express and body-parser.
- Browser UI is static HTML, CSS, and JavaScript served from `public/`.
- Application data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/products.js` — product listing and active coupon endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon lookup, validation, discount calculation, and active coupon listing.
- `lib/dates.js` — local date formatting, date-key normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, deductions, releases, and summary.
- `lib/invoice.js` — invoice figure calculation and printable invoice HTML rendering.
- `lib/ledger.js` — customer lookup/listing, Khata debits/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — subtotal, coupon discount delegation, and checkout tax/total calculation.
- `lib/reports.js` — dashboard summary and comparison of stored orders with invoice figures.
- `lib/store.js` — synchronous JSON database read/write and audit-log append.
- `lib/tax.js` — item GST rate lookup and CGST/SGST split.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test`. No test files are currently present; `npm test` is a placeholder script.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
