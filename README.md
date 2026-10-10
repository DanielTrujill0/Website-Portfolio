# Customizable portfolio

A static portfolio with a visual editor, project case studies, category filters, responsive navigation, and a single editable content file. Works on GitHub Pages without installing packages or running a build.

All personal details are intentionally blank. The default page uses clearly marked template prompts. No projects, experience, skills, or social profiles have been invented.

## The easiest way to customize

1. Open **editor.html** in your browser from this folder, or visit **your live website URL followed by /editor.html**.
2. Fill in the Introduction, Projects, About, and Contact panels. Fields are optional.
3. Use Appearance to select a preset, adjust colors, choose a heading style, or change corner shapes.
4. Use Sections to hide unused sections and customize their headings.
5. Click **Preview**. The new tab displays your browser's saved draft; edits in the editor update that preview tab.
6. Click **Download content.js**.
7. Move the downloaded file into your portfolio folder, replacing its existing **content.js**. If your browser named it content (1).js, rename it to content.js.
8. Open index.html to check the saved file, then commit and push:

```powershell
git add .
git commit -m "Add customizable portfolio and visual editor"
git push
```

GitHub Pages will deploy your changes using the existing main / root settings. You do not need to configure Pages again.

**Important:** the editor is a browser-local tool, not a hosted admin system. Anyone can open the editor and make their own local draft, but it cannot modify your repository or publish your site. Only replacing content.js and committing/pushing changes updates the shared website. Do not put passwords or other private information in any website file.

Drafts are stored in this browser, so download regularly. Drafts on your computer's file URL and drafts on your hosted website are separate. Some browsers restrict storage for local files; if Preview reports a storage problem, download and replace content.js, then open index.html to preview. Import accepts exported content.js or raw JSON; it parses data without executing imported JavaScript.

## Add project images and a résumé

Put images and PDFs in **assets/**, then enter paths such as:

- assets/portrait.jpg
- assets/tracker-cover.jpg
- assets/tracker-detail.jpg
- assets/resume.pdf

Use exact filename capitalization. Prefer reasonably sized images (around 1600 pixels wide). External images must use an HTTPS URL that points directly to an image; a Google Drive sharing page is not an image URL. Add descriptions for images so screen-reader users can understand them. Missing images show an explanatory fallback.

## Project case studies

In Projects, add a title, category, cover, summary, tools, role, timeline, and status. Add as much of the Overview, Challenge, Process, Outcome, and Lessons sections as you need. Blank sections stay hidden. Add multiple gallery images with captions.

Every titled project gets a page like **project.html?id=camera-tracker**. Set its stable ID under Advanced. Keep IDs unchanged once you share a project URL. Use arrows to reorder projects or gallery images; untitled project entries stay hidden. Category names automatically create homepage filters. Source-code and live-demo links are optional.

Skills, Experience, and Experiments also support adding, removing, and reordering entries.

## Edit files directly

- **content.js** — all text, projects, links, section visibility, and theme settings.
- **styles.css** — layout, spacing, typography, breakpoints, and advanced visual styling. Design tokens are at the top.
- **app.js** — portfolio and case-study rendering.
- **core.js** — content schema, URL validation, and shared helpers.
- **editor.html / editor.js / editor.css** — visual editor.
- **index.html** — homepage shell.
- **project.html** — shared case-study shell.
- **assets/** — your images, PDFs, and favicon.

Keep the `window.PORTFOLIO = { ... };` wrapper in content.js. Text supports line breaks and is rendered as plain text, not HTML. Colors use six-digit hex values. Changing styles.css changes the design directly; the editor overrides only the supported colors, heading font, and corner radius.

No third-party libraries, analytics, accounts, or backend are required. Fonts are stored locally with their licenses; no external font service is contacted. All site links and assets use relative paths for GitHub Pages project hosting. The browser must support modern JavaScript and CSS color-mix (current Chrome, Edge, Firefox, and Safari).

## Future updates

After replacing content.js or editing styles:

```powershell
git add content.js styles.css assets
git commit -m "Update portfolio content"
git push
```

Wait for the Pages deployment to finish in GitHub's Actions tab, then refresh the website. If the old version persists, use Ctrl + Shift + R.


## Sketchbook design & interactions

Warm paper, handwritten headings, taped cards, pencil illustrations, margin doodles, hand-drawn borders, and subtle pixel details replace the 3D dot sculpture. On dotted paper, background dots form a notebook grid and gently react to your cursor. They never morph into a sphere or helix.

- Scroll to draw more of the notebook illustration and move the margin sketches.
- Move your mouse to leave a brief pencil trail. Click to make a small pencil burst.
- Click the sticky note to change its message. Drag it to reposition it, or focus it and use arrow keys. Note positions are temporary.
- Hover project cards for paper lift, links for marker underlines, and the logo for a brief pixel nudge.
- Open case-study gallery images in a larger viewer with previous/next, Escape to close, and focus return.
- Use the footer's Pause motion control for ambient effects. Reduced-motion settings produce static artwork; buttons and image viewing remain usable.

In editor.html > Appearance, choose the Sketchbook palette, Sketchbook heading style, plain/dotted/ruled paper, and pencil/ink/marker line weight. You can still turn individual motion effects off and choose dot density. Download content.js to save these choices to the repository.

The original SVG drawing lives in sketch-art.js. Other graphics and behavior live in interactions.js and the Sketchbook edition section of styles.css. The editor remains a browser-local tool, and all personal details remain blank until you fill them in.


## Typography & new controls

The cursor trail fades segment by segment over **160 milliseconds**. Headings can use Kalam (pencil handwriting), Caveat (loose notes), Patrick Hand (neat handwriting), Lora (editorial serif), DM Sans (clean sans), or a technical monospace. Body text uses DM Sans. These fonts are bundled in assets/fonts with their SIL Open Font Licenses so your choices are consistent across devices. Use Appearance > Heading style to choose a font and view a specimen before exporting.

Titled projects include a search field that searches title, summary, category, and tools. Search combines with category filters. Press **/** to focus the search and **Escape** to clear it. Case studies include links to their filled-in sections. When you add a valid email, Contact includes a Copy email button as well as Say hello. Blank personal fields remain blank.
