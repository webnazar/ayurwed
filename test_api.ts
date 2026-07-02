import { POST } from './src/app/api/newsletter/route';

async function test() {
  const req = new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test3@example.com' })
  });
  
  const res = await POST(req);
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Body:", data);
}

test().catch(console.error);
