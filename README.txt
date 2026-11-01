MAZE - FIX THIS upgrade

FILES IN THIS ZIP (add or replace in the repo, same folders):
  index.html              replace (only the FIX THIS section and 3 new tags in the head/scripts changed)
  css/fixthis.css         NEW
  js/fixthis.js           NEW
  js/fixthis-config.js    NEW  <- the only file you edit to plug in your designs
  js/main.js              replace (the old FIX THIS code was removed from it; everything else is unchanged)

DO NOT REPLACE: css/styles.css, js/archive.js, js/projects.js, privacy.html, accessibility.html, assets/logo/

WHERE TO PUT YOUR IMAGES:
  Create the folder assets/fix/ in the repo (GitHub: Add file > Upload files, and type assets/fix/ before the file name,
  or just drag a folder named fix into assets/). Suggested names:
    c1-a.webp, c1-b.webp      challenge 1 (two designs)
    c2.webp                   challenge 2 (one design)
    c3-before.webp, c3-after.webp   challenge 3 (before / after)
  WebP or JPG, about 1600px on the long side. Do not crop or add text; the site shows them exactly as supplied.

HOW TO CONNECT THEM:
  Open js/fixthis-config.js on GitHub (pencil icon), replace each  src: null  with the path
  (for example src: 'assets/fix/c1-a.webp'), add alt text, set  correct  if you want an "OUR PICK" mark, and rewrite the
  Hebrew explanations. Commit. Images left as null show a labelled placeholder.

HOW TO UPLOAD THIS UPDATE:
  Repo > Add file > Upload files > drag index.html, css and js from this zip > Commit changes. Wait 1-2 minutes, hard refresh.
