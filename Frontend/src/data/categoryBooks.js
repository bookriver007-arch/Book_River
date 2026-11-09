/**
 * Home page ke category sections ke books.
 * Titles/prices wahi hain jo frontend ke `/category/:slug` page par dikhte hain
 * (Category.jsx). Covers built-in banners se aate hain.
 */

const COVERS = [
  '/banners/fiction.svg',
  '/banners/poetry.svg',
  '/banners/history.svg',
  '/banners/science.svg',
  '/banners/business.svg',
]

const RAW = [
  {
    slug: 'board-books',
    label: 'Board Books',
    tagline: 'Chhoti haathon ke liye mazboot board kitaabein — rang, shape aur pehle alfaz.',
    books: [
      { title: 'My First Shapes', author: 'R. Ali', price: 'Rs. 450' },
      { title: 'Animal Friends', author: 'S. Noor', price: 'Rs. 490' },
      { title: 'Colors Around Me', author: 'A. Hameed', price: 'Rs. 470' },
      { title: 'Bedtime Rhymes', author: 'M. Zara', price: 'Rs. 520' },
      { title: 'Counting 1–10', author: 'F. Iqbal', price: 'Rs. 430' },
    ],
  },
  {
    slug: 'kids-story-books',
    label: 'Kids Story Books',
    tagline: 'Mazedaar kahaniyaan jo bachon ko padhna sikhati hain.',
    books: [
      { title: 'The Paper Boat Club', author: 'Hira S.', price: 'Rs. 890' },
      { title: 'Moonlight Adventures', author: 'A. R. Khan', price: 'Rs. 750' },
      { title: 'The Brave Little Sparrow', author: 'Sana Iqbal', price: 'Rs. 690' },
      { title: 'Forest of Whispers', author: 'T. H. Malik', price: 'Rs. 820' },
      { title: 'Gul and the Giant Kite', author: 'Omar J.', price: 'Rs. 710' },
    ],
  },
  {
    slug: 'knowledge-books',
    label: 'Knowledge Books',
    tagline: 'Duniya ke baare mein jaanne ke liye — science, history aur uske aage.',
    books: [
      { title: 'Small Machines, Big Ideas', author: 'Omar J.', price: 'Rs. 1,320' },
      { title: 'Empires of Paper', author: 'T. H. Malik', price: 'Rs. 1,390' },
      { title: 'The Human Body Atlas', author: 'Dr. S. Rauf', price: 'Rs. 1,650' },
      { title: 'Space in Pictures', author: 'N. Ahmed', price: 'Rs. 1,480' },
      { title: 'Wonders of the Ocean', author: 'H. Rauf', price: 'Rs. 1,390' },
    ],
  },
  {
    slug: 'activity-books',
    label: 'Activity Books',
    tagline: 'Puzzles, mazes, coloring aur bahut kuch — haathon ko masroof rakho.',
    books: [
      { title: 'Maze Mania', author: 'I. Zaid', price: 'Rs. 560' },
      { title: 'Coloring Safari', author: 'M. Zara', price: 'Rs. 520' },
      { title: 'Brain Games for Kids', author: 'F. Iqbal', price: 'Rs. 640' },
      { title: 'Sticker Fun World', author: 'R. Ali', price: 'Rs. 480' },
      { title: 'Dot-to-Dot Animals', author: 'S. Noor', price: 'Rs. 510' },
    ],
  },
  {
    slug: 'teen-fiction',
    label: 'Teen Fiction',
    tagline: 'Teenagers ke liye novels — dosti, sapne aur suspense.',
    books: [
      { title: 'The Silent River', author: 'A. R. Khan', price: 'Rs. 1,150' },
      { title: 'Poems at Midnight', author: 'Sana Iqbal', price: 'Rs. 890' },
      { title: 'After the Last Bell', author: 'N. Ahmed', price: 'Rs. 980' },
      { title: 'The Notebook Club', author: 'Hira S.', price: 'Rs. 940' },
      { title: 'City of Small Lights', author: 'Omar J.', price: 'Rs. 1,020' },
    ],
  },
  {
    slug: 'adult-novels',
    label: 'Adult Novels',
    tagline: 'Bade padhne walon ke liye gehri aur tawil kahaniyaan.',
    books: [
      { title: 'The Quiet Deal', author: 'H. Rauf', price: 'Rs. 1,050' },
      { title: 'Empires of Paper', author: 'T. H. Malik', price: 'Rs. 1,390' },
      { title: 'A House by the River', author: 'A. R. Khan', price: 'Rs. 1,240' },
      { title: 'The Long Monsoon', author: 'Sana Iqbal', price: 'Rs. 1,180' },
      { title: 'Letters Never Sent', author: 'Dr. S. Rauf', price: 'Rs. 1,090' },
    ],
  },
]

/** har book ko cover image mil jaata hai */
export const HOME_CATEGORIES = RAW.map((category) => ({
  ...category,
  books: category.books.map((book, i) => ({ ...book, image: COVERS[i % COVERS.length] })),
}))
