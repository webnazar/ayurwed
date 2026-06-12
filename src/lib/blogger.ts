// src/lib/blogger.ts

const BLOG_DOMAIN = 'ayurwedofficial.blogspot.com';

export interface BloggerPost {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  url: string;
  featuredImage: string | null;
  labels: string[];
  authorName: string;
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
    
    // Extract global labels available on the blog
    const allLabels = feedCategories.map((c: any) => c.term);

    const posts: BloggerPost[] = entries.map((e: any) => {
      const link = e.link?.find((l: any) => l.rel === 'alternate')?.href || '#';
      
      // Extract a clean excerpt from the HTML content
      const rawContent = e.content?.$t || e.summary?.$t || '';
      const textOnly = rawContent.replace(/<[^>]+>/g, '').trim();
      const excerpt = textOnly.length > 120 ? textOnly.substring(0, 120) + '...' : textOnly;

      // Look for a thumbnail, fallback to first image in content if possible
      let featuredImage = e.media$thumbnail?.url || null;
      if (!featuredImage && rawContent.includes('<img')) {
        const match = rawContent.match(/src="([^"]+)"/);
        if (match && match[1]) featuredImage = match[1];
      }

      // If thumbnail is low res (default 72-c), try to get a larger version
      if (featuredImage && featuredImage.includes('/s72-c/')) {
        featuredImage = featuredImage.replace('/s72-c/', '/s1600/');
      } else if (featuredImage && featuredImage.includes('/s72-w')) {
        // Some feeds use w/h tags
        featuredImage = featuredImage.replace(/\/s72(-[a-z0-9]+)?\//, '/s1600/');
      }

      return {
        id: e.id.$t,
        title: e.title.$t,
        excerpt,
        publishedAt: e.published.$t,
        url: link,
        featuredImage,
        labels: e.category?.map((c: any) => c.term) || [],
        authorName: e.author?.[0]?.name?.$t || 'Ayurwed Team'
      };
    });

    return { posts, allLabels };
  } catch (error) {
    console.error('Blogger API fetch error:', error);
    return { posts: [], allLabels: [] };
  }
}
