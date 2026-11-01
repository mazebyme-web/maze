/* FIX THIS - the only file you edit to plug in your designs.
   1. Upload your images to assets/fix/ (WebP or JPG, around 1600px on the long side).
   2. Replace each  src: null  with the file path, e.g.  src: 'assets/fix/c1-a.webp'
   3. Write a short alt text for every image (what the design shows, in Hebrew or English).
   4. Set  correct  to 'a' or 'b' (challenge 1), to an option id (challenge 2), or leave null for a neutral reveal.
   Images with  src: null  show a labelled placeholder. Nothing is cropped or stretched. */
window.FIX_CONFIG = {
  c1: {
    a: { src: null, alt: '' },
    b: { src: null, alt: '' },
    correct: null,                       // 'a' or 'b'
    quote: "Good design doesn't need to shout. It needs to be understood.",
    why: 'כאן יופיע הסבר קצר על ההחלטה העיצובית: מה העין רואה קודם, ולמה זה עובד.'   // PLACEHOLDER COPY, replace
  },
  c2: {
    image: { src: null, alt: '' },
    options: [
      { id: 'message', text: 'A clearer message' },
      { id: 'hierarchy', text: 'A stronger visual hierarchy' },
      { id: 'action', text: 'A reason to take action' }
    ],
    correct: null,                       // 'message' | 'hierarchy' | 'action'
    why: 'כאן יופיע ההסבר: מה חסר בעיצוב הזה, ומה שינוי קטן אחד היה עושה.'          // PLACEHOLDER COPY, replace
  },
  c3: {
    before: { src: null, alt: '' },
    after: { src: null, alt: '' }
  }
};
