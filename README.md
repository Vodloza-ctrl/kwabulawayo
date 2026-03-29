
# kwaBulawayo redesigned static site

This rebuild now includes:

- redesigned `index.html`, `listings.html`, `about.html`, `contact.html`, and `404.html`
- shared styling in `assets/css/styles.css`
- listing rendering and filtering in `assets/js/app.js`
- structured directory data in `assets/js/listings-data.js`
- generated detail pages for all 87 listing URLs referenced in `sitemap.xml`
- Google Maps search and directions links on listing cards and detail pages
- graceful fallback placeholders where a Cloudflare image is not yet assigned

## Image setup

Current hero support is configured for `https://images.kwabulawayo.com/...`.
You can assign direct image URLs per listing inside `assets/js/listings-data.js` by filling the `heroImage` field.

## Notes

To avoid publishing incorrect business details, the generated listing descriptions stay intentionally general until exact addresses, contacts, and hours are verified.
