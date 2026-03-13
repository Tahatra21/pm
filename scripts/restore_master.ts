import { db } from "../lib/db/index";

async function restoreMaster() {
    try {
        console.log("🌱 Restoring Master Streams and Tags...");

        // 1. Create Streams
        const streamsData = [
            { id: 'st1', code: 'PROD', name: 'Production', description: 'Core product development' },
            { id: 'st2', code: 'MARKET', name: 'Marketing', description: 'User growth and brand' },
            { id: 'st3', code: 'INFRA', name: 'Infrastructure', description: 'Backend and cloud' },
        ];

        for (const s of streamsData) {
            await db.tbl_streams.upsert({
                where: { id: s.id },
                update: {},
                create: { 
                    ...s, 
                    isActive: 'true', 
                    sortOrder: '0', 
                    createdAt: new Date(), 
                    updatedAt: new Date() 
                },
            });
            console.log(`Stream restored: \${s.name}`);
        }

        // 2. Create Tags
        const tagsData = [
            { id: 't1', code: 'URGENT', name: 'Urgent', category: 'priority' },
            { id: 't2', code: 'BACKEND', name: 'Backend', category: 'tech' },
            { id: 't3', code: 'FRONTEND', name: 'Frontend', category: 'tech' },
            { id: 't4', code: 'DESIGN', name: 'Design', category: 'ui' },
        ];

        for (const t of tagsData) {
            await db.tbl_project_tags.upsert({
                where: { id: t.id },
                update: {},
                create: { 
                    ...t, 
                    isActive: 'true', 
                    sortOrder: '0', 
                    createdAt: new Date(), 
                    updatedAt: new Date() 
                },
            });
            console.log(`Tag restored: \${t.name}`);
        }

        console.log("✅ Master Streams and Tags restored successfully!");
    } catch (error) {
        console.error("❌ Error restoring master data:", error);
    } finally {
        process.exit();
    }
}

restoreMaster();
