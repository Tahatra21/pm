import { GET } from "../app/api/streams/[id]/tags/route";

async function run() {
    console.log("Testing GET route directly...");
    try {
        const req = new Request("http://localhost:3000/api/streams/st1/tags");
        const res = await GET(req, { params: { id: "st1" } });
        const data = await res.json();
        console.log("Response:", res.status, data);
    } catch (err) {
        console.error("Fatal Error:", err);
    }
}
run();
