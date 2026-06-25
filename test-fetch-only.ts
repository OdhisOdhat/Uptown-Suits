async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/orders?userEmail=fodhis1%40gmail.com");
    console.log("STATUS:", res.status);
    console.log("HEADERS:", Object.fromEntries(res.headers.entries()));
    const body = await res.text();
    console.log("BODY:", body);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
run();
