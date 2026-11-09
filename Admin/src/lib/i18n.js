/**
 * Admin panel — turns Roman Urdu strings into proper English.
 * The `AutoEnglish` component (main.jsx) applies this to the whole document,
 * so every page / toast / tooltip becomes English automatically.
 */
export const ADMIN_EN = {
  /* ---------- common ---------- */
  'Add ho gaya ✅': 'Added ✅',
  'Delete ho gaya': 'Deleted',
  'Delete karein?': 'Delete?',
  'Nahi': 'No',
  'Load ho raha hai…': 'Loading…',
  'Numbers load ho rahe hain…': 'Loading numbers…',
  'Backend check ho raha hai…': 'Checking backend…',
  'Ye item hamesha ke liye delete ho jayega.': 'This item will be deleted permanently.',
  'Copy nahi hua — link haath se copy karo': 'Copy failed — copy the link manually',
  'Upload': 'Upload',
  'Upload karo': 'Upload',
  'Title likho': 'Write the title',
  'Texts save karo': 'Save texts',
  'Section ke texts save ho gaye ✅': 'Section texts saved ✅',
  'Section ke texts load nahi hue': 'Section texts did not load',
  'Yeh picture': 'This picture',
  'Abhi ka cover': 'Current cover',

  /* ---------- dashboard / login ---------- */
  'Ek nazar me: users, orders, pending aur revenue.':
    'At a glance: users, orders, pending and revenue.',
  'Login karo — panel dekhne ke liye': 'Log in to view the panel',
  'Access request bhejo': 'Send access request',
  'Access approve ho gaya ✅': 'Access approved ✅',
  'Access chahiye? Invite link se sign up karo, phir admin approve karega.':
    'Need access? Sign up with the invite link, then an admin will approve you.',
  'Invite link copy ho gaya 🔗': 'Invite link copied 🔗',
  'Naya invite link ban gaya': 'New invite link created',
  'Naya link': 'New link',
  'Koi pending request nahi — sab clear hai. Link share karo to request aayegi.':
    'No pending requests — all clear. Share the link to get a request.',
  'Request reject kar di gayi': 'Request rejected',
  'Password chhupao': 'Hide password',
  'Sirf Gmail account se sign up ho sakta hai': 'Sign up is only possible with a Gmail account',
  'Sign up ho gaya — approval ka intezar karo': 'Signed up — wait for approval',
  'Sign up ke baad request admin ke dashboard me aayegi — approve hone par login ho payega.':
    'After signing up the request appears in the admin dashboard — you can log in once approved.',
  'Invite link se aaye ho ✅ — apne': 'You came from the invite link ✅ — sign up with your',
  'Ye link kisi ko bhejo — wo apne': 'Send this link to someone — they will sign up with their',
  'karo. Approve hone ke baad hi wo admin me login kar payega.':
    '. They can log into the admin only after approval.',
  'Abhi koi user signup nahi hua.': 'No user has signed up yet.',

  /* ---------- orders ---------- */
  'Frontend se aaye orders yahan se approve / reject / ship karo.':
    'Approve / reject / ship the orders coming from the frontend here.',
  'Approve karna hai': 'To approve',
  'Ship karo': 'Ship it',
  'Is status me koi order nahi': 'No orders with this status',
  'Abhi koi order nahi aaya': 'No orders yet',
  'Abhi koi order nahi aaya.': 'No orders yet.',
  'Frontend ke cart se “Place order” karo — order seedha yahan aa jayega.':
    'Press “Place order” in the frontend cart — the order appears here.',
  'Sab orders complete ho gaye — neeche "Complete order history" box me hain':
    'All orders are complete — they are in the "Complete order history" box below',
  'Abhi koi complete order nahi — order deliver/reject karne par wo yahan aa jayega.':
    'No completed orders yet — once you deliver or reject an order it appears here.',
  'Complete — sirf dekh sakte hain': 'Complete — view only',
  'Order delete ho gaya': 'Order deleted',
  'Order delete karein?': 'Delete order?',
  'Order reject karein?': 'Reject order?',
  'Orders load nahi hue — backend (port 5000) chalu hai?':
    'Orders did not load — is the backend (port 5000) running?',
  'Order Frontend par scroll ka order hai': 'Order is the scroll order on the frontend',
  'karta hai — wo order yahan aata hai. Approve / Reject / Ship / Delivered sab wahin se hota hai.':
    '— that order comes here. Approve / Reject / Ship / Delivered all happen from there.',
  'Complete order history': 'Complete order history',

  /* ---------- slides ---------- */
  'Slideshow ki pictures — upload, order badlo, delete karo.':
    'Slideshow pictures — upload, reorder, delete.',
  'Abhi koi picture upload nahi hui — Frontend par built-in 5 banners dikh rahe hain. Upar se picture upload karo.':
    'No pictures uploaded yet — the 5 built-in banners are showing on the frontend. Upload a picture above.',
  'Nayi picture upload karo': 'Upload a new picture',
  'Picture upload ho gayi ✅': 'Picture uploaded ✅',
  'Picture select karo': 'Select a picture',
  'Pehle picture select karo': 'Select a picture first',
  'Frontend par ek row me 5 covers dikhte hain; cover par click karne se book khulti hai.':
    'The frontend shows 5 covers per row; clicking a cover opens the book.',
  'Jo pictures yahan upload karoge, wahi Frontend ke Description page par dikhengi.':
    'The pictures you upload here are the ones shown on the frontend Description page.',

  /* ---------- categories ---------- */
  'Ribbon ke orange/gold boxes jo right → left scroll karte hain.':
    'The orange/gold ribbon boxes that scroll right → left.',
  'Frontend par yehi boxes orange/gold ban ke right → left scroll karte hain.':
    'On the frontend these same boxes become orange/gold and scroll right → left.',
  'Abhi koi box nahi hai — Frontend par demo categories dikh rahi hain. Upar se naam add karo.':
    'No boxes yet — demo categories are showing on the frontend. Add a name above.',
  'Box add ho gaya ✅': 'Box added ✅',
  'Naya box / category name': 'New box / category name',
  'Category ka naam likho': 'Enter the category name',
  'Naam par click karke rename kar sakte ho': 'Click a name to rename it',
  'Home par pehli 4 cards dikhengi — naam/prices par click karke badal sakte ho':
    'The first 4 cards appear on Home — click a name/price to change it',

  /* ---------- open book ---------- */
  'Left page picture, right page heading + description. Frontend par page click karke palat\'ta hai.':
    'Left page picture, right page heading + description. On the frontend you click the page to flip it.',
  'Abhi koi book page nahi hai — Frontend par demo books dikh rahi hain. Upar se picture + heading + description add karo.':
    'No book page yet — demo books are showing on the frontend. Add a picture, heading and description above.',
  'Book page add ho gaya ✅': 'Book page added ✅',
  'Naya book page': 'New book page',
  'Book add karo': 'Add book',
  'Book ka cover select karo': 'Select the book cover',
  'Book ka title likho': 'Enter the book title',
  'Left page ki picture select karo': 'Select the left page picture',
  'Heading / Title likho': 'Write the heading / title',
  'Chhoti si description likho…': 'Write a short description…',
  'Chhoti si description — rang, shape aur pehle alfaz…':
    'A short description — colours, shapes and first words…',

  /* ---------- kids book ---------- */
  'Standing kids-book cover aur uske neeche caption.':
    'Standing kids book cover and its caption below.',
  'Frontend par pehli book ke right wale standing kids-book ka cover yahan se aata hai.':
    'The standing kids book to the right of the first book on the frontend gets its cover from here.',
  'Caption save ho gaya ✅': 'Caption saved ✅',
  'Caption upar wale form me likh ke “Caption save” dabao.':
    'Write the caption in the form above and press “Save caption”.',
  'Enter ya Save caption dabao — update ho jayega.':
    'Press Enter or Save caption — it will update.',
  'Kids book ka cover hamesha ke liye delete ho jayega.':
    'The kids book cover will be deleted permanently.',
  'Kids book load nahi hui — backend chalu hai?': 'Kids book did not load — is the backend running?',
  'Cover delete ho gaya': 'Cover deleted',
  'Cover delete karein?': 'Delete cover?',
  'Cover upload ho gaya ✅': 'Cover uploaded ✅',
  'Cover replace ho gaya ✅': 'Cover replaced ✅',
  'Cover upload / replace karo': 'Upload / replace cover',
  'Cover picture select karo': 'Select a cover picture',
  'Pehle cover picture select karo': 'Select the cover picture first',
  'Naya cover (replace)': 'New cover (replace)',
  'Naya cover upload karoge to purana cover (aur uski file) apne aap replace ho jaayega.':
    'If you upload a new cover, the old cover (and its file) is replaced automatically.',

  /* ---------- frames ---------- */
  'Frontend par yeh frames rope se latke hue right → left scroll karte hain.':
    'On the frontend these frames hang from a rope and scroll right → left.',
  'Abhi koi frame nahi hai — Frontend par yeh section chhupa hua hai. 8 pictures upload karo (ek-ek karke).':
    'No frames yet — this section is hidden on the frontend. Upload 8 pictures (one by one).',
  'Frame add ho gaya ✅': 'Frame added ✅',
  'Naya frame': 'New frame',

  /* ---------- products ---------- */
  'Abhi koi product nahi hai — Frontend par demo covers dikh rahe hain. Upar se cover + title add karo.':
    'No products yet — demo covers are showing on the frontend. Add a cover and title above.',
  'Product add ho gaya ✅': 'Product added ✅',
  'Naya product': 'New product',

  /* ---------- reviews ---------- */
  'Frontend par yeh reviews right → left scroll karti hain.':
    'On the frontend these reviews scroll right → left.',
  'Readers ke reviews — slider me scroll hote hain.':
    'Reader reviews — they scroll in a slider.',
  'Abhi koi review nahi hai — Frontend par demo reviews dikh rahi hain. Upar se review add karo.':
    'No reviews yet — demo reviews are showing on the frontend. Add a review above.',
  'Review add ho gayi ✅': 'Review added ✅',
  'Nayi review': 'New review',
  'Reader ka naam likho': 'Enter the reader name',
  'Review likho': 'Write the review',
  'Naam / review par click karke edit — blur par save':
    'Click a name/review to edit — it saves on blur',
  'Books bohat achi thi aur delivery fast…': 'The books were great and delivery was fast…',

  /* ---------- deals ---------- */
  'Deal cards manage karo': 'Manage deal cards',
  'Heading, description aur offer tag': 'Heading, description and offer tag',
  'Home page par slideshow ke neeche 4 deal cards. Purani price par cross lagta hai, nayi price highlight hoti hai.':
    '4 deal cards below the slideshow on Home. The old price is struck through and the new price is highlighted.',
  'Abhi koi deal nahi hai — Home par demo deals dikh rahi hain. Upar se picture + prices add karo.':
    'No deals yet — demo deals are showing on Home. Add a picture and prices above.',
  'Deal add ho gayi ✅': 'Deal added ✅',
  'Deal add karo': 'Add deal',
  'Nayi deal add karo': 'Add a new deal',
  'Purani price (cross wali)': 'Old price (struck through)',
  'Purani price (cross)': 'Old price (struck through)',
  'Nayi price (discount ke baad)': 'New price (after discount)',
  'Nayi price': 'New price',
  'Purani price aur nayi price dono likho': 'Write both the old price and the new price',
  'Ye text Home page ke laal sunburst tag ke andar dikhta hai.':
    'This text appears inside the red sunburst tag on the Home page.',
  'Chuni hui kitaabein — Rs. 1,200 ki jagah sirf Rs. 800…':
    'Handpicked books — Rs. 800 instead of Rs. 1,200…',
  'Slideshow ke neeche “Deal” section ke 4 cards — purani price (cross) aur nayi discounted price. Yahan se upload, price badlo, delete karo.':
    '4 cards of the “Deal” section below the slideshow — old price (struck) and the new discounted price. Upload, change prices and delete from here.',

  /* ---------- home slides / about / hanging book ---------- */
  'Home page ka slideshow yahan se manage hota hai.': 'The Home page slideshow is managed here.',
  'Home slides manage karo': 'Manage home slides',
  'Sirf Home page ka apna slideshow. Description page ke slides se alag — yahan upload karoge to sirf Home par dikhega.':
    'Home page has its own slideshow. Separate from the Description page slides — anything uploaded here shows on Home only.',
  'Abhi koi home slide nahi hai — Home par built-in banners dikh rahe hain. Upar se picture upload karo.':
    'No home slides yet — built-in banners are showing on Home. Upload a picture above.',
  'Home slide upload ho gayi ✅': 'Home slide uploaded ✅',
  'Nayi home slide upload karo': 'Upload a new home slide',
  'About book manage karo': 'Manage about book',
  'About kitaab ke 3 pages — har page ki heading, description aur picture yahan se set karo.':
    "The 3 pages of the About book — set each page's heading, description and picture here.",
  'Home page ki About kitaab ke 3 pages. Har page par heading, description aur picture yahan se set karo.':
    "The 3 pages of the Home About book. Set each page's heading, description and picture here.",
  'Har page par 3 pictures hoti hain (modern collage). Jo picture na chuno, uski purani picture waisi hi rahegi. Max 5 MB each.':
    'Each page holds 3 pictures (modern collage). If you do not choose a picture, its old one stays as is. Max 5 MB each.',
  'Is page par abhi kuch set nahi — Home par default content dikhega. Upar se picture + heading + description save karo.':
    'Nothing set on this page yet — default content shows on Home. Save a picture, heading and description above.',
  'Page dekho': 'View page',
  'Page reset karein?': 'Reset page?',
  'Category sections me rope se latakti kitaab. Cover yahan se upload karo — Description wali kids-book se alag hai.':
    'The book hanging from a rope in the category sections. Upload the cover here — this is different from the kids book on the Description page.',
  'Home page ke category sections me rope se latakti kitaab. Cover yahan se upload karo — Description wali kids-book se alag hai.':
    'The book hanging from a rope in the Home page category sections. Upload the cover here — different from the kids book on the Description page.',
  'Abhi koi cover upload nahi hai — Home page par latakti kitaab nahi dikhegi. Upar se picture upload karo.':
    'No cover uploaded yet — the hanging book will not show on the Home page. Upload a picture above.',
  'Hanging book upload karo': 'Upload hanging book',
  'Hanging book cover upload ho gaya ✅': 'Hanging book cover uploaded ✅',
  'Hanging book ka cover hamesha ke liye delete ho jayega.':
    'The hanging book cover will be deleted permanently.',
  'Abhi koi cover nahi hai — Frontend par ye card chhupa hua hai.':
    'No cover yet — this card is hidden on the frontend.',
  'Home dekho': 'View Home',
  'Home par isi order me dikhengi — title/price par click karke badal sakte ho':
    'They appear on Home in this order — click a title/price to change it',
  'Is category me abhi koi book nahi — Home par demo books dikh rahi hain. Upar se cover + title add karo.':
    'No books in this category yet — demo books are showing on Home. Add a cover and title above.',
  'hai — usi category ki books (cover, title, price) wahan se upload karo.':
    "— upload that category's books (cover, title, price) from there.",
  'hai. Home ki pictures yahan se manage karo — upload, order badlo, delete karo.':
    '. Manage the Home pictures here — upload, reorder, delete.',
  'Description — sab kuch': 'Description — everything',
  'Slides, Categories, Open Book, Kids Book, Frames, Products aur Reviews — frontend Description page ka poora content yahan ek hi jagah.':
    'Slides, Categories, Open Book, Kids Book, Frames, Products and Reviews — the whole frontend Description page content in one place.',

  /* ---------- settings ---------- */
  'Frontend ka address, backend ki health aur admin panel ki info.':
    'Frontend address, backend health and admin panel info.',
  'Panel kholne par email + password maanga jata hai':
    'Opening the panel asks for email + password',

  /* ---------- checkout ---------- */
  'Payment methods add / band karo, aur tax + shipping charges set karo.':
    'Add / disable payment methods, and set tax + shipping charges.',
  'Checkout settings save ho gayi ✅': 'Checkout settings saved ✅',
  'Method hatao': 'Remove method',
  'Tax lagao (checkout total me add hoga)': 'Apply tax (added to the checkout total)',
  'Subtotal par lagta hai — jaise 5% × Rs. 2,000 = Rs. 100':
    'Applies to the subtotal — e.g. 5% × Rs. 2,000 = Rs. 100',
  'Frontend par sirf': 'On the frontend only',
  'wale methods dikhte hain — naya method add karke title likho, save karte hi cart me aa jayega.':
    'methods appear — add a new method, write its title, and it reaches the cart as soon as you save.',
  'Field par click karke edit — blur par save': 'Click a field to edit — it saves on blur',
  'Field par click karke seedha edit — blur par save':
    'Click a field to edit inline — it saves on blur',
  'Ya logo / naam par click karo': 'Or click the logo / name',

  /* ---------- demo category lines ---------- */
  'Chhoti haathon ke liye mazboot board kitaabein': 'Sturdy board books for little hands',
  'Mazedaar kahaniyaan jo bachon ko padhna sikhati hain': 'Fun stories that teach kids to read',
  'Duniya ke baare mein jaanne ke liye': 'To learn about the world',
  'Puzzles, mazes, coloring aur bahut kuch': 'Puzzles, mazes, coloring and much more',
  'Teenagers ke liye novels — dosti, sapne aur suspense':
    'Novels for teens — friendship, dreams and suspense',
  'Bade padhne walon ke liye gehri aur tawil kahaniyaan':
    'Deeper, longer stories for grown-up readers',
  'Orders kholo': 'Open orders',
  'Frontend kholo': 'Open frontend',
  'Abhi koi order nahi aaya hai': 'No orders yet',
  'Yahan koi text nahi': 'No text here',
  'Save karo': 'Save',
  'Bhejo': 'Send',
  'Kholo': 'Open',
}

/** dynamic lines (name / order number ones) */
export const ADMIN_EN_PATTERNS = [
  [
    /^"(.+)" hamesha ke liye delete ho jayega\.$/i,
    (match) => `"${match[1]}" will be deleted permanently.`,
  ],
  [
    /^Order (BR-\d+) reject ho jayega — customer ko tracking par "Rejected" dikhega\.$/i,
    (match) =>
      `Order ${match[1]} will be rejected — the customer will see "Rejected" in tracking.`,
  ],
  [
    /^Order (BR-\d+) hamesha ke liye delete ho jayega\.$/i,
    (match) => `Order ${match[1]} will be deleted permanently.`,
  ],
  [
    /^(BR-\d+) hamesha ke liye delete ho jayega\.$/i,
    (match) => `${match[1]} will be deleted permanently.`,
  ],
  [
    /^Page (\d+) ki picture aur text hamesha ke liye delete ho jayenge\.$/i,
    (match) => `Page ${match[1]}'s picture and text will be deleted permanently.`,
  ],
  [/^Page (\d+) save ho gaya ✅$/i, (match) => `Page ${match[1]} saved ✅`],
  [/^Page (\d+) reset ho gaya$/i, (match) => `Page ${match[1]} reset`],
  [/^Page (\d+) save karo$/i, (match) => `Save page ${match[1]}`],
  [/^(.+) me nayi book add karo$/i, (match) => `Add a new book in ${match[1]}`],
]

/** last-resort fallback — short Roman sentences (only when nothing matched) */
const ADMIN_EN_FALLBACK = [
  [/\bhamesha ke liye delete ho jayega\b/gi, 'will be deleted permanently'],
  [/\bhamesha ke liye delete ho jayegi\b/gi, 'will be deleted permanently'],
  [/\bdelete karein\?/gi, 'Delete?'],
  [/\badd karo\b/gi, 'add'],
  [/\bkaro\b/gi, ''],
  [/\blikho\b/gi, 'write'],
  [/\bdabao\b/gi, 'press'],
]

/** turn one string into English — returned unchanged when there is no match */
export const adminEnglish = (value) => {
  const raw = String(value ?? '')
  const trimmed = raw.trim()
  if (!trimmed) return value

  const key = trimmed.replace(/\s+/g, ' ')
  const hit = ADMIN_EN[key]
  if (hit) return hit

  for (const [pattern, build] of ADMIN_EN_PATTERNS) {
    const match = key.match(pattern)
    if (match) return build(match)
  }

  // only for sentences that start with a Roman verb (keeps user data untouched)
  if (!/^(delete|add|save|upload|select|cover|picture)\b/i.test(key)) return value

  let next = key
  for (const [pattern, replacement] of ADMIN_EN_FALLBACK) {
    next = next.replace(pattern, replacement)
  }
  next = next.replace(/\s{2,}/g, ' ').trim()

  return next === key ? value : next
}
