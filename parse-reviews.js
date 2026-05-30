#!/usr/bin/env node
/**
 * parse-reviews.js
 * Parses Google Maps reviews HTML and outputs structured JSON.
 *
 * Usage:
 *   node parse-reviews.js reviews.html > reviews.json
 *   cat reviews.html | node parse-reviews.js > reviews.json
 */

const fs = require('fs');

// Read input: from file arg or stdin
const input = process.argv[2]
  ? fs.readFileSync(process.argv[2], 'utf8')
  : fs.readFileSync('/dev/stdin', 'utf8');

/**
 * Infer Local Guide level from the reviewer profile image URL.
 * Google encodes the badge tier as `mo-baN-br100` in the img src.
 * Returns "Local Guide Level N" or null if not a Local Guide.
 */
function extractLocalGuideLevel(reviewerImgSrc) {
  const match = reviewerImgSrc.match(/mo-ba(\d+)-br100/);
  if (match) {
    return `Local Guide Level ${match[1]}`;
  }
  return null;
}

/**
 * Count filled star spans to determine rating.
 * Filled stars have class "elGi1d", empty ones have "gnOR4e".
 */
function extractRating(ratingBlock) {
  // Try aria-label first (fastest, most reliable)
  const ariaMatch = ratingBlock.match(/aria-label="(\d+) estrellas?"/);
  if (ariaMatch) return parseInt(ariaMatch[1], 10);

  // Fallback: count filled stars
  const filled = (ratingBlock.match(/elGi1d/g) || []).length;
  return filled > 0 ? filled : null;
}

/**
 * Extract the reviewer's text. The `.wiI7pd` class is reused for the owner
 * response, so we only want the FIRST occurrence inside the review content
 * block (before any `.CDe7pd` owner-response wrapper).
 */
function extractReviewText(reviewBlock) {
  // Strip owner response section first
  const withoutOwner = reviewBlock.replace(/<div class="CDe7pd">[\s\S]*$/, '');
  const match = withoutOwner.match(/<span class="wiI7pd">([\s\S]*?)<\/span>/);
  if (!match) return null;
  // Clean up HTML entities and extra whitespace
  return match[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Extract URLs for review photos attached by the user.
 * These appear inside review buttons with class "Tya61d" as a CSS
 * background-image URL in the style attribute.
 */
function extractImageLinks(reviewBlock) {
  const links = [];
  const imageRegex = /<button class="Tya61d"[\s\S]*?style="[^"]*background-image:\s*url\(&quot;([^&]+?)&quot;\)[^"]*"/g;

  for (const match of reviewBlock.matchAll(imageRegex)) {
    const url = match[1].trim();
    if (url && !links.includes(url)) {
      links.push(url);
    }
  }

  return links;
}

// Split into individual review blocks by the outer review wrapper class
// Each review starts with <div class="jftiEf fontBodyMedium "
const reviewBlockRegex = /<div class="jftiEf fontBodyMedium [^"]*"[\s\S]*?(?=<div class="jftiEf fontBodyMedium |<div class="AyRUI" aria-hidden="true" style="height: 16px;">&nbsp; <\/div><\/div><\/div><\/div><\/div><\/div><\/div>)/g;

const blocks = [...input.matchAll(reviewBlockRegex)].map(m => m[0]);

const reviews = blocks.map(block => {
  // --- Author ---
  const authorMatch = block.match(/<div class="d4r55 fontTitleMedium">([^<]+)<\/div>/);
  const author = authorMatch ? authorMatch[1].trim() : null;

  // --- Reviewer badge image src ---
  const imgMatch = block.match(/<img class="NBa7we"[^>]*src="([^"]+)"/);
  const imgSrc = imgMatch ? imgMatch[1] : '';
  const google_reviewer_level = extractLocalGuideLevel(imgSrc);
  const reviewer_image_link = imgSrc || null;

  // --- Reviewer profile link ---
  const reviewerProfileMatch = block.match(/data-href="(https:\/\/www\.google\.com\/maps\/contrib\/[^"]+)"/);
  const reviewer_profile_link = reviewerProfileMatch ? reviewerProfileMatch[1] : null;

  // --- Review/listing identifiers ---
  const reviewIdMatch = block.match(/data-review-id="([^"]+)"/);
  const review_id = reviewIdMatch ? reviewIdMatch[1] : null;
  // Reliable public link: reviewer profile reviews page.
  const review_original_link = reviewer_profile_link;

  // --- Rating ---
  const ratingBlockMatch = block.match(/<span class="kvMYJc"[\s\S]*?<\/span>/);
  const rating = ratingBlockMatch ? extractRating(ratingBlockMatch[0]) : null;

  // --- Review date ---
  const dateMatch = block.match(/<span class="rsqaWe">([^<]+)<\/span>/);
  const review_date = dateMatch ? dateMatch[1].trim() : null;

  // --- Review text ---
  const review_text = extractReviewText(block);

  // --- Review image links ---
  const image_links = extractImageLinks(block);

  return {
    author,
    google_reviewer_level,
    reviewer_image_link,
    reviewer_profile_link,
    review_id,
    review_original_link,
    review_text,
    rating,
    review_date,
    image_links
  };
}).filter(r => {
  if (r.author === null) return false;
  if (r.rating !== 5) return false;
  if (!r.review_text || !r.review_text.trim()) return false;
  return true;
});

console.log(JSON.stringify(reviews, null, 2));
