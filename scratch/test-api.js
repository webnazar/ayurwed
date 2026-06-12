async function run() {
  const res = await fetch('http://localhost:3000/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 1, quantity: 1, mrp: 100 }],
      shippingAddress: { city: 'Test' }
    })
  });
  
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}
run();
