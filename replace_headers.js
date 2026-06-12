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
    if (lines[i].includes('className="bg-brand-green-light') && lines[i].includes('text-brand-green')) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].includes('text-brand-green-light')) {
          lines[j] = lines[j].replace('text-brand-green-light', 'text-brand-green/70');
        }
      }
    }
  }

  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}
console.log('Fixed subtitle colors');
