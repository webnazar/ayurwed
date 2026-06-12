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

  // Find className="bg-brand-green-light ..." and replace it with a unified consistent class string
  // It usually starts with bg-brand-green-light rounded-3xl
  // We want to replace whatever follows `bg-brand-green-light` inside the quotes with the standard unified classes
  content = content.replace(
    /className="bg-brand-green-light(.*?)"/g,
    (match, p1) => {
      // Some files have p-8, some have p-6 sm:p-8. Let's keep the padding.
      let paddingMatch = p1.match(/p-\d+(\s+sm:p-\d+)?/);
      let padding = paddingMatch ? paddingMatch[0] : 'p-8';
      
      let flexMatch = p1.match(/flex items-center justify-between/);
      let flexClasses = flexMatch ? ' ' + flexMatch[0] : '';
      
      return `className="bg-brand-green-light rounded-3xl ${padding} text-brand-green border border-brand-green/10 shadow-sm relative overflow-hidden${flexClasses}"`;
    }
  );

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Unified header card classes');
