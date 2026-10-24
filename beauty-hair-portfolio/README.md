# BEAUTY HAIR® — Design + Front-End Portfolio Case Study

A responsive, interactive landing page concept for a beauty salon and curated beauty shop. The project explores a playful Y2K-inspired visual language, editorial layouts, high-contrast typography and small e-commerce interactions.

> **Portfolio concept only.** The brand, product catalog, prices, contact details and booking flow are illustrative. No real orders, payments or appointments are processed.

## Project goals
- Translate a visual identity into a responsive web experience.
- Combine graphic design decisions with semantic, maintainable front-end code.
- Demonstrate interactive UI patterns without a framework or external JavaScript dependencies.
- Keep the experience usable on mobile and with keyboard navigation.

## Stack
- HTML5 semantic markup
- CSS3 custom properties, Grid, Flexbox, responsive breakpoints and reduced-motion support
- Vanilla JavaScript (ES6+)
- Google Fonts (Space Grotesk + DM Mono)
- Unsplash image URLs for placeholder photography

## Features
- Responsive navigation with mobile menu
- Product category filters and live search
- Favorite toggles with accessible state
- Client-side shopping bag with quantity controls, removal and subtotal
- Booking request modal with form validation and date minimum
- Booking form prepares an email using `mailto:`; no server or calendar integration
- Keyboard Escape handling, focus-visible styles, skip link, status announcements
- Empty state for product search
- SEO description and Open Graph metadata

## Run locally
1. Download and extract the project ZIP.
2. Open the folder in VS Code.
3. Open `index.html` in a browser, or use VS Code Live Server.

No build step or package installation is required.

## Before publishing
- Replace the illustrative products, prices, contact email and social links with verified information.
- Replace the `.example` email before testing the booking flow.
- Confirm image licensing and replace remote images with optimized local assets if needed.
- Test the page on current Chrome, Firefox, Safari and mobile screen sizes.
- If real booking or checkout is required, connect a secure backend/provider; do not collect payment data in this static demo.

## Suggested portfolio case study structure
1. **Brief:** design a distinctive, inclusive beauty brand digital presence.
2. **Visual direction:** Y2K references, pink/lilac/acid-yellow palette, editorial photography, mono labels and expressive typography.
3. **Design system:** palette, type scale, spacing, buttons, cards, borders and interaction states.
4. **Implementation:** semantic HTML, responsive CSS, accessible controls and vanilla JS interactions.
5. **Validation:** document browser/device checks, accessibility checks and what you changed based on findings.
6. **Next iteration:** real booking provider, inventory/checkout integration, product detail pages, analytics with consent and a content management workflow.

## File structure
- `index.html` — page structure and content
- `style.css` — design system, responsive layout and component states
- `script.js` — filtering, favorites, cart and booking form interactions
- `README.md` — setup and case study notes
