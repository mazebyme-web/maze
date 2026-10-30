/* MAZE archive data. To add a project: copy one object, change the fields, drop images in assets/projects/<id>/.
   type: A featured case · B compact deliverable · C wide digital set · D typographic/experimental
   images: [{src, alt}] - leave [] until real files exist (a labelled placeholder is shown).
   client: only fill in when the client approved disclosure. */
window.MAZE_PROJECTS = [
  { id: 'law-firm-identity', n: '01', type: 'A', cats: ['identity', 'digital'],
    title: 'Law firm - identity & digital', client: null, label: 'Branding · Website · Digital business card',
    desc: 'מיתוג ועיצוב דיגיטלי למשרד עורכת דין.',
    deliverables: [], images: [], pending: true,
    needs: ['Logo and identity boards', 'Typography and colour specification', 'Brand applications (mockups)', 'Digital business card and website screenshots', 'Client approval to show the name']
  },
  { id: 'print-slot', n: '02', type: 'B', cats: ['print'],
    title: 'Print deliverable', client: null, label: 'Slot reserved · e.g. a sticker or single graphic',
    desc: 'כאן יוצג עיצוב אחד ממוקד.', deliverables: [], images: [], pending: true,
    needs: ['One photo or mockup of the finished piece', 'What it is and where it was used']
  },
  { id: 'digital-slot', n: '03', type: 'C', cats: ['digital'],
    title: 'Digital banners', client: null, label: 'Slot reserved · set of banner variations',
    desc: 'כאן תוצג סדרה של באנרים ונכסים דיגיטליים.', deliverables: [], images: [], pending: true,
    needs: ['3–6 banner variations (PNG/WebP)', 'Sizes and where they ran', 'Optional: desktop and mobile versions']
  },
  { id: 'maze-type', n: '04', type: 'D', cats: ['experimental'],
    title: 'Good design opens doors', client: null, label: 'MAZE own typographic study',
    desc: 'ניסוי טיפוגרפי של MAZE עצמה, לא עבודה של לקוח.', deliverables: ['Typographic composition'], images: [], pending: false,
    needs: []
  }
];
