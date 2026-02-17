// Reviews module
import { CONFIG } from './config.js';
import { secureFetch, CacheManager, escapeHTML } from './utils.js';
import { showToast } from './ui.js';

const reviewsCache = new CacheManager(CONFIG.CACHE_KEYS.REVIEWS);
let reviews = [];

export async function loadReviews() {
  // Try API first
  try {
    const res = await secureFetch(`${CONFIG.API_BASE}/reviews`, { method: 'GET' });
    if (res.ok) {
      reviews = await res.json();
      reviewsCache.set(reviews, 3600);
      displayReviews();
      return;
    }
  } catch (e) {
    console.warn('Failed to load reviews from API:', e.message);
  }

  // Fallback to cache
  const cached = reviewsCache.get();
  reviews = cached || [];
  displayReviews();
}

export async function saveReviewToAPI(review) {
  try {
    const res = await secureFetch(`${CONFIG.API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        reviews.push(review);
        reviewsCache.clear();
        await loadReviews();
        showToast('Review submitted successfully!', 'success');
        return true;
      }
    }
  } catch (e) {
    console.warn('Failed to save review:', e.message);
  }

  showToast('Failed to submit review. Try again later.', 'error');
  return false;
}

export function displayReviews() {
  const reviewsContainer = document.querySelector('.reviews-container');
  if (!reviewsContainer) return;

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<p class="no-reviews">No reviews yet. Be the first!</p>';
    return;
  }

  reviewsContainer.innerHTML = reviews.map(review => `
    <article class="review-card" itemscope itemtype="https://schema.org/Review">
      <div class="review-header">
        <span class="reviewer-name" itemprop="author">${escapeHTML(review.reviewer_name)}</span>
        <span class="review-rating" role="img" aria-label="${review.rating} out of 5 stars">
          ${'⭐'.repeat(review.rating)}
        </span>
      </div>
      <p class="review-text" itemprop="reviewBody">${escapeHTML(review.review_text)}</p>
      <time class="review-date" itemprop="datePublished">${new Date(review.date).toLocaleDateString()}</time>
    </article>
  `).join('');
}

export function initReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const review = {
      reviewer_name: document.getElementById('reviewerName').value,
      review_text: document.getElementById('reviewText').value,
      rating: parseInt(document.getElementById('rating').value),
      date: new Date().toISOString()
    };

    const success = await saveReviewToAPI(review);
    if (success) {
      form.reset();
    }
  });
}
