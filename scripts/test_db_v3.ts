import { db } from "../lib/db/index";

async function test() {
  try {
    console.log("Checking db properties...");
    const keys = Object.keys(db).filter(k => !k.startsWith('_'));
    console.log("Keys in db:", keys);
    console.log("db.tbl_projects:", typeof (db as any).tbl_projects);
    const count = await (db as any).tbl_projects.count();
    console.log("Projects count:", count);
  } catch (e) {
    console.error("Error:", e.message);
    console.log("Keys in db:", Object.keys(db).filter(k => !k.startsWith('_')));
  } finally {
    process.exit();
  }
}

test();
