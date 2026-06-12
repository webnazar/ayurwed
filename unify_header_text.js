const fs = require('fs');

const files = [
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consumer/appointments/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/products/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/testimonials/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/orders/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consultant/plans/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/carousels/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/stats/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/enquiries/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/indications/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/featured/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/users/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/users/[id]/edit-profile/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/categories/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consultant/schedule/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consultant/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consumer/profile/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consumer/courses/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consultant/profile/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consumer/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/admin/approvals/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/consultant/availability/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/manufacturer/enquiries/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/manufacturer/profile/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/manufacturer/plans/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/manufacturer/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/dashboard/manufacturer/products/page.tsx",
  "/home/webnazar/.gemini/antigravity/scratch/ayurwed/src/app/(main)/manufacturers/[slug]/page.tsx"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Locate the header card
    if (lines[i].includes('className="bg-brand-green-light rounded-3xl p-8 text-brand-green border border-brand-green/10 shadow-sm relative overflow-hidden"')) {
      // It's a match! Now fix the h1 and p in the next few lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('<h1')) {
          lines[j] = lines[j].replace(/className="[^"]*"/, 'className="text-2xl font-extrabold"');
        }
        if (lines[j].includes('<p') && lines[j].includes('text-brand-green/70')) {
          lines[j] = lines[j].replace(/className="[^"]*"/, 'className="text-brand-green/70 mt-1 text-sm"');
        }
      }
    }
    // Handle the ones that have "flex items-center justify-between"
    if (lines[i].includes('className="bg-brand-green-light rounded-3xl') && lines[i].includes('shadow-sm relative overflow-hidden flex items-center justify-between"')) {
      // In these, the h1 and p are often wrapped in a div. We need to find them.
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        if (lines[j].includes('<h1')) {
          lines[j] = lines[j].replace(/className="[^"]*"/, 'className="text-2xl font-extrabold"');
        }
        if (lines[j].includes('<p') && lines[j].includes('text-brand-green/70')) {
          lines[j] = lines[j].replace(/className="[^"]*"/, 'className="text-brand-green/70 mt-1 text-sm"');
        }
      }
    }
  }

  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}
console.log('Unified header font sizes');
