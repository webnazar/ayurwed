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
  let lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    // Some are `<div className="dashboard-header-card">`, some are `<div className="dashboard-header-card ...">`
    if (lines[i].includes('dashboard-header-card')) {
      // Look ahead up to 10 lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        // If we hit the closing div, stop looking
        if (lines[j].includes('</div>')) break;
        
        if (lines[j].includes('<h1')) {
          lines[j] = lines[j].replace(/className="[^"]*"/, 'className="dashboard-header-title"');
        }
        
        // Match paragraph that isn't already the correct class
        if (lines[j].includes('<p') && !lines[j].includes('dashboard-header-subtitle')) {
          lines[j] = lines[j].replace(/className="[^"]*"/, 'className="dashboard-header-subtitle"');
        }
      }
    }
  }

  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}
console.log('Forcefully applied components to all headers');
