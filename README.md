# Digibenz Technologies website

A responsive static website built with HTML, CSS and JavaScript. Open `index.html` for the homepage.

## Website sections

- About Digibenz, services and industry pages
- Portfolio galleries for Website Design, Social Media, Branding, Packaging and Banner work
- Blog articles, contact form and legal policy pages

Portfolio artwork is stored locally under `assets/portfolio/` so it loads with the site files.

## Contact form

The contact and service enquiry forms send submissions to the Supabase Edge Function `submit-website-enquiry`. The function stores the enquiries in the configured Supabase project. Name, mobile number and email are required; business name and message are optional. Keep Supabase service-role credentials on the server and out of the browser code.

The Supabase project reference is `isezeiucecnxteiiqdzd`. Configure the Edge Function allowed origins for the production domain before deployment.

## Preview and deployment

For a local preview, serve this directory as a static site with `index.html` as the entry page. Keep the relative directory structure intact so page links, portfolio assets and styles resolve.
