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

  // Replace the card container
  content = content.replace(
    /className="bg-brand-green-light rounded-3xl [^"]*border-brand-green\/10 shadow-sm relative overflow-hidden([^"]*)"/g,
    'className={`dashboard-header-card$1`}'
  );

  // Replace the card container where it didn't get unified perfectly
  content = content.replace(
    /className="bg-brand-green-light rounded-3xl p-8 text-brand-green"/g,
    'className="dashboard-header-card"'
  );

  // Clean up the string literal if it's empty in className={`dashboard-header-card`}
  content = content.replace(/className={`dashboard-header-card`}/g, 'className="dashboard-header-card"');

  // Replace the h1
  content = content.replace(
    /className="text-2xl font-extrabold"/g,
    'className="dashboard-header-title"'
  );
  
  // Replace the p
  content = content.replace(
    /className="text-brand-green\/70 mt-1 text-sm"/g,
    'className="dashboard-header-subtitle"'
  );

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Refactored classes to global components');
