async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/debug-logs");
    const json = await res.json();
    console.log("Local Server Debug Logs:", json);
  } catch (err) {
    console.error("Failed to query local logs:", err.message);
  }
}
run();
