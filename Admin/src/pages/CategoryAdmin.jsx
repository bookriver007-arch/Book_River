import HomeCategoryBooksAdmin from './HomeCategoryBooksAdmin.jsx'

/**
 * Admin category page (`/category/<slug>`) — yahan SIRF us category ke
 * PRODUCTS hain (upload / edit / order / delete). Baaki kuch nahi.
 * Ye bilkul wahi editor hai jo `/home-books/<slug>` par hai.
 */
export default function CategoryAdmin() {
  return <HomeCategoryBooksAdmin />
}


