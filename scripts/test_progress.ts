import { calculateProgress } from "../lib/utils";

const testTasks = [
    { status: "todo" },
    { status: "in-progress" },
    { status: "done" }
];

console.log("Progress with tasks:", calculateProgress(testTasks));
console.log("Progress with empty tasks:", calculateProgress([]));
console.log("Progress with invalid status:", calculateProgress([{ status: "unknown" }]));
