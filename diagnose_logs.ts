import { db } from "./lib/db";
import { timeLogs } from "./lib/db/schema";
import { format } from "date-fns";

async function diagnose() {
    console.log("🔍 Diagnosing Productivity Logs...");
    const logs = await db.select().from(timeLogs);
    console.log(`Total logs found: ${logs.length}`);
    
    logs.forEach(l => {
        console.log(`- ID: ${l.id}, Date: ${format(new Date(l.date), "yyyy-MM-dd HH:mm:ss")}, Hours: ${l.hours}`);
    });

    const now = new Date();
    // Monday of current week logic matching date-fns startOfWeek(now, { weekStartsOn: 1 })
    const startOfCurrentWeek = new Date(now);
    const day = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = (day === 0 ? -6 : 1 - day); // If Sunday, go back 6 days. Else go to Monday.
    startOfCurrentWeek.setDate(now.getDate() + diff);
    startOfCurrentWeek.setHours(0,0,0,0);
    
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23,59,59,999);

    console.log(`Current Week Range: ${format(startOfCurrentWeek, "yyyy-MM-dd")} to ${format(endOfCurrentWeek, "yyyy-MM-dd")}`);
    
    const currentWeekLogs = logs.filter(l => {
        const d = new Date(l.date);
        return d >= startOfCurrentWeek && d <= endOfCurrentWeek;
    });
    
    console.log(`Logs in current week: ${currentWeekLogs.length}`);
    process.exit(0);
}

diagnose().catch(err => {
    console.error(err);
    process.exit(1);
});
