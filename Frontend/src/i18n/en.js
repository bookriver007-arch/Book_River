/**
 * English dictionary — UI ka Roman-Urdu text English me badal deta hai.
 * Key = jo screen par likha hota hai (Roman), value = proper English.
 * Language = English par ye map chalta hai; Urdu dictionary (`ur.js`) alag hai.
 */
export const EN = {
  /* ---------- general ---------- */
  'Ho gaya!': 'Done!',
  'Kuch galat hua': 'Something went wrong',
  'Kuch galat ho gaya — dobara try karein': 'Something went wrong — please try again',
  'Copy nahi hua': 'Copy failed',
  'Band karo': 'Close',
  'Abhi on hai': 'Currently on',
  'Din ke liye': 'For daytime',
  'Raat ke liye': 'For night',
  'Device jaisa': 'Same as device',
  'Books load ho rahi hain…': 'Loading books…',
  'Koi book nahi mili': 'No books found',
  'Category nahi mili': 'Category not found',
  'Ye category maujood nahi hai — navbar se koi doosri choose karein.':
    'This category does not exist — choose another from the navbar.',
  'Books dekho': 'Browse books',
  'Aur books dekho': 'See more books',
  'Sab Kuch Ek Jagah': 'Everything in One Place',
  'Book River par kya kya milta hai — ek nazar mein.': "What's on Book River — at a glance.",
  'Kids Book Villa · Online Book Store': 'Kids Book Villa · Online Book Store',

  /* ---------- confirm dialogs / forms (round 2) ---------- */
  'Confirm karein?': 'Please confirm',
  Nahi: 'No',
  'Haan, hatao': 'Yes, remove',
  'Haan, delete': 'Yes, delete',
  abhi: 'now',
  'Haan, khali karo': 'Yes, clear it',
  'Address hata dein?': 'Remove address?',
  'Order hatao?': 'Remove order?',
  'Cart se hatao?': 'Remove from cart?',
  'Wishlist se hatao?': 'Remove from wishlist?',
  'Cart khali karein?': 'Clear the cart?',
  'Wishlist khali karein?': 'Clear the wishlist?',
  'Old orders khali karein?': 'Clear old orders?',
  'Saved order list se saare orders hat jayenge (orders server par safe hain).':
    'All orders will be removed from the saved list (orders stay safe on the server).',
  'Saved delivery address delete ho jayega.': 'The saved delivery address will be deleted.',
  'Ye cheez delete ho jayegi — wapas nahi aayegi.':
    'This item will be deleted — it will not come back.',

  /* ---------- account / forms ---------- */
  'Poora naam': 'Full name',
  'Naya password': 'New password',
  'Password daalo': 'Enter password',
  'Password chhupao': 'Hide password',
  'Track karo': 'Track order',
  'Saari notifications band': 'All notifications off',
  'Light, dark ya system — jo comfortable ho':
    'Light, dark or system — whichever is comfortable',
  'Cash on delivery, card ya mobile wallet — jo aasan ho':
    'Cash on delivery, card or mobile wallet — whichever is easier',

  /* ---------- category taglines ---------- */
  'Chhoti haathon ke liye mazboot board kitaabein — rang, shape aur pehle alfaz.':
    'Sturdy board books for little hands — colours, shapes and first words.',
  'Mazedaar kahaniyaan jo bachon ko padhna sikhati hain.':
    'Fun stories that teach kids to read.',
  'Duniya ke baare mein jaanne ke liye — science, history aur uske aage.':
    'To learn about the world — science, history and beyond.',
  'Puzzles, mazes, coloring aur bahut kuch — haathon ko masroof rakho.':
    'Puzzles, mazes, colouring and much more — keep little hands busy.',
  'Teenagers ke liye novels — dosti, sapne aur suspense.':
    'Novels for teens — friendship, dreams and suspense.',
  'Bade padhne walon ke liye gehri aur tawil kahaniyaan.':
    'Deeper, longer stories for grown-up readers.',
  'Saari books cart se nikal jayengi.': 'All books will be removed from the cart.',
  Mazboot: 'Strong',

  /* ---------- cart / checkout ---------- */
  'Cart abhi khali hai — koi bhi book add karo.': 'Your cart is empty — add any book to continue.',
  'Cart khali hai': 'Your cart is empty',
  'Cart khali kar di 🧺': 'Cart cleared 🧺',
  'Cart cleared 🧺': 'Cart cleared 🧺',
  'Cart me add ho gayi': 'Added to cart',
  'Cart me add ho gayi 🛒': 'Added to cart 🛒',
  'Cart se hata di 🗑️': 'Removed from cart 🗑️',
  'Cart se hatao': 'Remove from cart',
  'Koi bhi book kholo aur “Add to cart” dabao — wo seedha yahan aa jayegi.':
    'Open any book and tap “Add to cart” — it appears right here.',
  'Cash on Delivery · Rs. 999+ par shipping free': 'Cash on Delivery · Free shipping over Rs. 999',
  'Checkout adhoora hai': 'Checkout is incomplete',
  'Poora naam likho': 'Enter your full name',
  'Sahi phone number likho (03xx xxxxxxx)': 'Enter a valid phone number (03xx xxxxxxx)',
  'Ghar ka pata likho': 'Enter your home address',
  'Sheher likho': 'Enter your city',
  'Card number sahi nahi hai': 'Card number is not valid',
  'Card par likha naam likho': 'Enter the name printed on the card',
  'Expiry MM/YY — aage ki date': 'Expiry MM/YY — a future date',
  'CVV 3 ya 4 digit': 'CVV must be 3 or 4 digits',
  'Mobile number 03xx xxxxxxx': 'Mobile number must be 03xx xxxxxxx',
  'Transaction ID / reference likho': 'Enter the transaction ID / reference',
  'Order lag raha hai…': 'Placing your order…',
  'Order place ho gaya 🎉': 'Order placed 🎉',
  'Order save nahi hua': 'Order could not be saved',
  'Order milne par cash dein': 'Pay cash on delivery',
  'Order ghar pahunchne par rider ko cash dein — koi advance nahi.':
    'Pay cash to the rider when your order arrives — no advance needed.',
  'Order place karne ke baad admin isi number par WhatsApp/call karega — payment confirm hone par order approve hoga.':
    'After you place the order, our team will WhatsApp/call this number — the order is approved once payment is confirmed.',
  'IBFT / online transfer ke baad bank ki di hui transaction ID yahan likho — admin verify karke order approve karega.':
    'After the IBFT / online transfer, enter the transaction ID from your bank — the admin verifies it and approves the order.',
  'Card number sirf check hota hai — server par sirf last 4 digits jate hain, CVV kabhi save nahi hota.':
    'The card number is only validated — only the last 4 digits reach the server, the CVV is never stored.',
  'Ye pata order ke saath admin ko jayega — Settings se bhi aa jata hai.':
    'This address goes with your order — it also fills in from Settings.',
  'House / street / area': 'House / street / area',
  'Books check karo': 'Review your books',
  'Kahan bhejna hai': 'Where to deliver',
  'Kaise dena hai': 'How you will pay',
  'Delivery address': 'Delivery address',
  'Jaldi chuno': 'Quick pick',

  /* ---------- wishlist / track ---------- */
  'Wishlist abhi khali hai': 'Your wishlist is empty',
  'Wishlist khali kar di 💔': 'Wishlist cleared 💔',
  'Wishlist khali kar di 🧺': 'Wishlist cleared 🧺',
  'Wishlist cleared 💔': 'Wishlist cleared 💔',
  'Wishlist me daalo': 'Add to wishlist',
  'Wishlist se hatao': 'Remove from wishlist',
  'Wishlist se hata di 💔': 'Removed from wishlist 💔',
  'Wishlist me save ho gayi ❤️': 'Saved to wishlist ❤️',
  'Wishlist update ho gayi': 'Wishlist updated',
  'Abhi kuch save nahi kiya — kisi bhi kitaab par ❤️ dabao.':
    'Nothing saved yet — tap ❤️ on any book.',
  'Saved books par price drop ya stock alert': 'Price drop or stock alerts on saved books',
  'Order tracking — status dekho': 'Order tracking — check status',
  'Order number likho — jaise BR-123456': 'Enter your order number — e.g. BR-123456',
  'Order number daalo — pata chal jayega order approve hua, ship hua ya reject.':
    'Enter your order number to see if the order was approved, shipped or rejected.',
  'Order number haath se likh lo': 'Write your order number down',
  'Order number copy ho gaya 📋': 'Order number copied 📋',
  'Order nahi mila': 'Order not found',
  'Status har 20 second me apne aap update hota hai':
    'Status refreshes automatically every 20 seconds',
  'Status refresh ho raha hai…': 'Refreshing status…',
  'Order raste me hai': 'Your order is on the way',
  'Ghar pahunch gaya': 'Delivered',
  'Aapka order mil gaya': 'Your order has arrived',
  'Admin ne approve kar diya': 'Approved by the admin',
  'Admin ne ye order accept nahi kiya.': 'The admin did not accept this order.',
  'Ye order reject ho gaya': 'This order was rejected',
  'Order number': 'Order number',

  /* ---------- auth ---------- */
  'Welcome back! Apne account mein daakhil hon.': 'Welcome back! Sign in to your account.',
  'Nayi account banao — apni pasand ki kitaabein save karo.':
    'Create an account — save the books you love.',
  'Login nahi hua': 'Login failed',
  'Signup nahi hua': 'Sign up failed',
  'jaise Ali Raza': 'e.g. Ali Raza',
  'Naam khaali nahi ho sakta': 'Name cannot be empty',
  'Apna naam likho phir save karo': 'Write your name, then save',
  'Ghar ka pata likho phir save karo': 'Write your home address, then save',
  'Address khaali hai': 'Address is empty',
  'Address hata diya 🗑️': 'Address removed 🗑️',
  'Dobara likh sakte ho': 'You can write it again any time',
  'Check the phone number': 'Check the phone number',
  'Phone number check karo': 'Check the phone number',
  'Sahi mobile number likho (jaise 0301 3367008)':
    'Enter a valid mobile number (e.g. 0301 3367008)',
  'Jisko delivery karni hai': 'Who receives the parcel',
  'Lene wale ka naam': 'Receiver name',

  /* ---------- settings ---------- */
  'Aapki basic info — naam aur contact': 'Your basic info — name and contact',
  'Email change nahi hoti — change karwane ke liye support se rabta karo.':
    'Email cannot be changed — contact support if you need to update it.',
  'Profile save ho gaya ✅': 'Profile saved ✅',
  'Profile save nahi hua': 'Profile could not be saved',
  'Password badlo aur account safe rakho': 'Change your password and keep your account safe',
  'Purana password': 'Current password',
  'Purana password daalo': 'Enter your current password',
  'Naya password dobara': 'Type the new password again',
  'Phir se likho': 'Type it again',
  'Kam se kam 6 characters': 'At least 6 characters',
  'Kam se kam 6 characters likho': 'Use at least 6 characters',
  'Naya password chhota hai': 'New password is too short',
  'Password match nahi kar rahe': 'Passwords do not match',
  'Dono naye password same likho': 'Type the same new password in both fields',
  'Dono password same hain': 'Passwords match',
  'Password badal gaya 🔐': 'Password updated 🔐',
  'Password nahi badla': 'Password could not be changed',
  'Agli baar naye password se login karo': 'Use the new password next time you log in',
  'Password last change': 'Password last changed',
  'Kabhi change nahi hua': 'Never changed',
  'Is device par login ho': 'This device is logged in',
  'Logout karne se sirf ye session band hoga (dusre devices affect nahi honge).':
    'Logging out ends this session only — other devices stay signed in.',
  'Checkout par ye address apne aap bhar jayega':
    'This address fills in automatically at checkout',
  'Delivery address save ho gaya 📍': 'Delivery address saved 📍',
  'Save hua': 'Saved',
  'Save ho gaya': 'Saved',
  'Save ho raha…': 'Saving…',
  'Save karna baaki hai': 'Unsaved changes',
  'Confirm karne ke liye dobara dabao': 'Tap again to confirm',

  /* ---------- privacy & data ---------- */
  'Aapka data aapke control me': 'Your data, under your control',
  'Apna data download karo': 'Download your data',
  'Profile, cart, wishlist, address aur preferences — ek JSON file me':
    'Profile, cart, wishlist, address and preferences in one JSON file',
  'Data download ho gaya 📦': 'Data downloaded 📦',
  'JSON file mil gayi': 'Your JSON file is ready',
  'Account delete karo': 'Delete account',
  'Account delete ho gaya': 'Account deleted',
  'Account delete nahi hua': 'Account could not be deleted',
  'Account delete karne se profile, wishlist aur saved settings hamesha ke liye chale jayenge. Purane orders delivery/returns ke liye record me rehte hain.':
    'Deleting your account removes your profile, wishlist and saved settings permanently. Past orders stay in our records for delivery and returns.',
  'Confirm karne ke liye DELETE likho': 'Type DELETE to confirm',
  'Haan, permanently delete karo': 'Yes, delete permanently',
  'Apna current password': 'Your current password',

  /* ---------- notifications ---------- */
  'Kis cheez ki khabar chahiye — choose karo': 'Choose what you want to hear about',
  'Order confirm, ship aur delivered hone par alert':
    'Alerts when your order is confirmed, shipped or delivered',
  'Discount, sale aur naye deal cards ki khabar': 'Discounts, sales and new deal cards',
  'Mahine ki nayi kitaabein email par': 'New books of the month by email',
  'Ek tap me sab off ho jayengi': 'Turns off every notification at once',
  'Is device par save hua (offline)': 'Saved on this device (offline)',
  'Account me save ho gaya': 'Saved to your account',
  'Account me bhi save ho gaya': 'Saved to your account too',

  /* ---------- language & region ---------- */
  'App ki bhasha aur number format': 'App language and number format',
  'Ye bhasha turant is settings screen par apply hoti hai.':
    'Applies to this settings screen immediately.',
  'Poore store me har price ka grouping badal jata hai.':
    'Changes how every price is grouped across the store.',
  'Payment Pakistani Rupees (PKR) me hoti hai — COD, JazzCash, EasyPaisa ya bank transfer.':
    'Payments are in Pakistani Rupees (PKR) — COD, JazzCash, EasyPaisa or bank transfer.',
  'Preference save ho gayi ⚙️': 'Preference saved ⚙️',
  'Mobile account se payment': 'Pay from your mobile account',

  /* ---------- about ---------- */
  'Book River — app info aur shortcuts': 'Book River — app info and shortcuts',
  'Profile, password, address, theme, notifications aur data — sab kuch ek jagah.':
    'Profile, password, address, theme, notifications and data — all in one place.',
  'Rabta karo': 'Contact us',
  'Quantity kam karo': 'Decrease quantity',
  'Search clear karo ya doosra naam try karo.': 'Clear the search or try another name.',

  /* ---------- old orders (track page) ---------- */
  'Old orders': 'Old orders',
  'Abhi koi purana order nahi': 'No old orders yet',
  'Jab bhi koi order track karoge (ya order place karoge), wo yahan save ho jayega — baad me yahin se check kar lena.':
    'Whenever you track or place an order it is saved here — check it again later.',
  'List se hatao': 'Remove from list',
  'Old orders list khali kar di 🗑️': 'Old orders list cleared 🗑️',

  /* ---------- home / description ---------- */
  'Aaj ki best deals': "Today's best deals",
  'Fresh off the shelf — nayi nayi books, sabse pehle aapke liye.':
    'Fresh off the shelf — brand new books, first for you.',
  'Nayi kitaabein har hafte — sabse pehle aapke liye shelf par.':
    'New books every week — first on your shelf.',
  'Chuni hui kitaabein — Rs. 1,200 ki jagah sirf Rs. 800, aur bhi bahut kuch. Sirf is hafte ke liye, stock khatam hone se pehle.':
    'Handpicked books — Rs. 800 instead of Rs. 1,200, and much more. This week only, before stock runs out.',
  'Cover par click karo — book khul kar poori details dikhayegi.':
    'Click the cover — the book opens with full details.',
  'Asli readers ke asli reviews — jo unhe sabse zyada pasand aaya.':
    'Real reviews from real readers — what they loved most.',
  'Har book readers ne khud chuni hai — genuine reviews ke saath.':
    'Every book is handpicked by readers — with genuine reviews.',
  'Fiction, science, history, business aur poetry — har shelf par kuch naya.':
    'Fiction, science, history, business and poetry — something new on every shelf.',
  'Order karo aur ghar baithe books receive karo — quick aur safe.':
    'Order and get books at your door — quick and safe.',
  'Picture books, fairy tales aur story time — chhote readers ke liye.':
    'Picture books, fairy tales and story time — for little readers.',
  'Mazedaar kahaniyaan jo bachon ko padhna sikhati hain':
    'Fun stories that teach kids to read',
  'Puzzles, mazes, coloring aur bahut kuch': 'Puzzles, mazes, coloring and much more',
  'Duniya ke baare mein jaanne ke liye': 'To learn about the world',
  'Teenagers ke liye novels — dosti, sapne aur suspense':
    'Novels for teens — friendship, dreams and suspense',
  'Bade padhne walon ke liye gehri aur tawil kahaniyaan':
    'Deeper, longer stories for grown-up readers',
  'Chhoti haathon ke liye mazboot board kitaabein': 'Sturdy board books for little hands',
  'Encrypted checkout — aapki payment details hamesha safe rehti hain.':
    'Encrypted checkout — your payment details stay safe.',
  'Book River ki handpicked list sach mein achi hai. History books ka selection mera favourite hai.':
    'Book River’s handpicked list is genuinely great. The history selection is my favourite.',
  'Checkout simple tha aur order tracking clear. Books ka quality original — 100% recommended.':
    'Checkout was simple and tracking was clear. Original quality books — 100% recommended.',
  'Ordered three books on Friday, sab Sunday tak aa gayin. Packing bhi bohat achi thi — books bilkul nayi!':
    'Ordered three books on Friday and all arrived by Sunday. Packing was excellent — the books were brand new!',
  'Poetry collection bohat thoughtful hai. Prices bhi reasonable — aur delivery fast.':
    'The poetry collection is very thoughtful. Prices are reasonable too — and delivery was fast.',
  'Nayi books har hafte update hoti hain. "New Launches" section se hi sabse pehle order karta hoon.':
    'New books drop every week. I always order first from the “New Launches” section.',
  'The kids section is lovely. My daughter ab har hafte nayi picture book maangti hai. Great collection!':
    'The kids section is lovely. My daughter now asks for a new picture book every week. Great collection!',
}

/** dynamic (numbers wali) lines — Roman -> English */
export const EN_PATTERNS = [
  [/^(\d+) books? cart me — checkout karke order place karo\.?$/i, (m) => `${m[1]} ${Number(m[1]) === 1 ? 'book' : 'books'} in your cart — checkout to place the order.`],
  [/^(\d+) books? cart me$/i, (m) => `${m[1]} ${Number(m[1]) === 1 ? 'book' : 'books'} in your cart`],
  [/^(\d+) books? saved$/i, (m) => `${m[1]} ${Number(m[1]) === 1 ? 'book' : 'books'} saved`],
  [/^Save hua · (.+)$/i, (m) => `Saved · ${m[1]}`],

  /* ---------- dynamic lines (names / codes / counts) ---------- */
  [/^(.+) — checkout ke liye taiyar$/i, (m) => `${m[1]} — ready for checkout`],
  [/^(.+) ki detail dekho$/i, (m) => `View details of ${m[1]}`],
  [/^(.+) — details dekho$/i, (m) => `${m[1]} — view details`],
  [/^(.+) cart se nikal jayegi\.$/i, (m) => `${m[1]} will be removed from the cart.`],
  [/^(.+) wishlist se nikal jayegi\.$/i, (m) => `${m[1]} will be removed from the wishlist.`],
  [/^(.+) list se nikal jayega\.$/i, (m) => `${m[1]} will be removed from the list.`],
  [/^(.+) cart se hatao$/i, (m) => `Remove ${m[1]} from cart`],
  [/^(.+) wishlist se hatao$/i, (m) => `Remove ${m[1]} from wishlist`],
  [/^(.+) hatao$/i, (m) => `Remove ${m[1]}`],
  [/^(.+) — backend chalu hai\? dobara try karo$/i, (m) => `${m[1]} — is the backend running? Please try again.`],
  [/^(.+) ko place hua$/i, (m) => `Placed on ${m[1]}`],
  [/^(.+) ke naam par$/i, (m) => `Delivered to ${m[1]}`],
  [/^(\d+) books? saved — dil chaahe to cart me daal do\.?$/i, (m) => `${m[1]} ${Number(m[1]) === 1 ? 'book' : 'books'} saved — add them to the cart whenever you like.`],
]

