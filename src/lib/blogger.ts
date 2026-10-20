// src/lib/blogger.ts

const BLOG_DOMAIN = 'ayurwedofficial.blogspot.com';

export interface BloggerPost {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  url: string;
  featuredImage: string;
  labels: string[];
  authorName: string;
}

export function extractFeaturedImage(
  entry: any,
  rawContent: string,
  labels: string[] = [],
  title: string = ''
): string {
  let featuredImage: string | null = entry?.media$thumbnail?.url || null;

  // 1. Check media$content array if present
  if (!featuredImage && Array.isArray(entry?.media$content)) {
    const firstMedia = entry.media$content.find((m: any) => m.url && (m.medium === 'image' || m.type?.startsWith('image/')));
    if (firstMedia) featuredImage = firstMedia.url;
  }

  // 2. Comprehensive HTML parsing for img tags, source srcset, background-image, or image hrefs
  if (!featuredImage && rawContent) {
    // Regex matching <img ... src="..."> or <img ... data-src="..."> or <img ... src='...'>
    const imgRegex = /<img[^>]+(?:src|data-src)=["']([^"']+)["']/i;
    const imgMatch = rawContent.match(imgRegex);
    if (imgMatch && imgMatch[1]) {
      featuredImage = imgMatch[1];
    } else {
      // Check background-image: url(...)
      const bgMatch = rawContent.match(/background-image\s*:\s*url\(["']?([^"'\)]+)["']?\)/i);
      if (bgMatch && bgMatch[1]) {
        featuredImage = bgMatch[1];
      } else {
        // Check direct image links <a href="...(.jpg|.png|.webp)">
        const aMatch = rawContent.match(/<a[^>]+href=["']([^"']+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^"']*)?)["']/i);
        if (aMatch && aMatch[1]) {
          featuredImage = aMatch[1];
        }
      }
    }
  }

  // 3. Upgrade low-res Blogger thumbnails to high-res (/s1600/ or /w1200/)
  if (featuredImage) {
    if (featuredImage.includes('/s72-c/')) {
      featuredImage = featuredImage.replace('/s72-c/', '/s1600/');
    } else if (featuredImage.includes('/s72-w')) {
      featuredImage = featuredImage.replace(/\/s72(-[a-z0-9]+)?\//i, '/s1600/');
    } else if (featuredImage.includes('/w72-h72/')) {
      featuredImage = featuredImage.replace('/w72-h72/', '/w1200-h800/');
    } else if (/\/[sw]\d+-[sw]\d+(-c)?\//i.test(featuredImage)) {
      featuredImage = featuredImage.replace(/\/[sw]\d+-[sw]\d+(-c)?\//i, '/s1600/');
    }
    return featuredImage;
  }

  // 4. Smart category & title keyword fallback system
  const lowerTitle = title.toLowerCase();
  const lowerLabels = labels.map(l => l.toLowerCase());

  if (lowerLabels.includes('academy') || lowerTitle.includes('academy') || lowerTitle.includes('certificate') || lowerTitle.includes('course')) {
    return 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80';
  }
  if (lowerLabels.includes('herb') || lowerLabels.includes('botanical') || lowerTitle.includes('herb') || lowerTitle.includes('plant')) {
    return 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=1200&q=80';
  }
  if (lowerLabels.includes('lifestyle') || lowerLabels.includes('yoga') || lowerTitle.includes('lifestyle') || lowerTitle.includes('routine')) {
    return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80';
  }
  if (lowerLabels.includes('diet') || lowerLabels.includes('nutrition') || lowerTitle.includes('food') || lowerTitle.includes('diet')) {
    return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80';
  }

  // Default fallback for general Ayurveda articles
  return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80';
}

export async function fetchBloggerPosts(category?: string, search?: string): Promise<{ posts: BloggerPost[], allLabels: string[] }> {
  try {
    let url = `https://${BLOG_DOMAIN}/feeds/posts/default?alt=json&max-results=50`;
    
    // Blogger allows filtering by category (label) directly via URL
    if (category) {
      url = `https://${BLOG_DOMAIN}/feeds/posts/default/-/${encodeURIComponent(category)}?alt=json&max-results=50`;
    }
    
    // Blogger allows search queries directly
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds
    if (!res.ok) {
      console.error('Failed to fetch from Blogger API:', res.statusText);
      return { posts: [], allLabels: [] };
    }

    const data = await res.json();
    const entries = data.feed?.entry || [];
    const feedCategories = data.feed?.category || [];
    
    const allLabels = feedCategories.map((c: any) => c.term);

    const posts: BloggerPost[] = entries.map((e: any) => {
      const link = e.link?.find((l: any) => l.rel === 'alternate')?.href || '#';
      
      const rawContent = e.content?.$t || e.summary?.$t || '';
      const textOnly = rawContent.replace(/<[^>]+>/g, '').trim();
      const excerpt = textOnly.length > 120 ? textOnly.substring(0, 120) + '...' : textOnly;
      const title = e.title?.$t || '';
      const labels = e.category?.map((c: any) => c.term) || [];

      const featuredImage = extractFeaturedImage(e, rawContent, labels, title);

      return {
        id: e.id.$t,
        title,
        excerpt,
        publishedAt: e.published.$t,
        url: link,
        featuredImage,
        labels,
        authorName: e.author?.[0]?.name?.$t || 'Ayurwed Team'
      };
    });

    return { posts, allLabels };
  } catch (error) {
    console.error('Blogger API fetch error:', error);
    return { posts: [], allLabels: [] };
  }
}
