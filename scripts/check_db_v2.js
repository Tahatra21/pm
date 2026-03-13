require("dotenv").config();
const { db } = require("./lib/db");
const { projects } = require("./lib/db/schema");

async function check() {
    try {
        const list = await db.select().from(projects);
        console.log("PROJECTS IN DB:", list.length);
        console.log(JSON.stringify(list, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
