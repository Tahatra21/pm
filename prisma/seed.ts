import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function simpleHash(pwd: string): string {
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
        const char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(36)}`;
}

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Roles
    const roles = [
        { roleCode: "ADMIN", roleName: "Administrator", hierarchyLevel: "L1" },
        { roleCode: "MANAGER", roleName: "Managers", hierarchyLevel: "L2" },
        { roleCode: "ASMAN", roleName: "Asman", hierarchyLevel: "L3" },
        { roleCode: "USER", roleName: "Users", hierarchyLevel: "L4" },
    ];

    const roleMap: Record<string, number> = {};
    for (const r of roles) {
        const dbRole = await (prisma as any).tbl_lookup_roles.upsert({
            where: { roleCode: r.roleCode },
            update: { roleName: r.roleName, hierarchyLevel: r.hierarchyLevel },
            create: r,
        });
        roleMap[r.roleCode] = dbRole.id;
    }

    // 2. Permissions
    const permissions = [
        { permissionCode: "VIEW_DATA", permissionName: "View Data" },
        { permissionCode: "EDIT_DATA", permissionName: "Edit Data" },
        { permissionCode: "DELETE_DATA", permissionName: "Delete Data" },
        { permissionCode: "APPROVE_DATA", permissionName: "Approve Data" },
    ];

    const permMap: Record<string, number> = {};
    for (const p of permissions) {
        const dbPerm = await (prisma as any).tbl_permissions.upsert({
            where: { permissionCode: p.permissionCode },
            update: { permissionName: p.permissionName },
            create: p,
        });
        permMap[p.permissionCode] = dbPerm.id;
    }

    // 3. Mapping
    const mappings = [
        { roleCode: "ADMIN", permissions: ["VIEW_DATA", "EDIT_DATA", "DELETE_DATA", "APPROVE_DATA"] },
        { roleCode: "MANAGER", permissions: ["VIEW_DATA", "EDIT_DATA", "APPROVE_DATA"] },
        { roleCode: "ASMAN", permissions: ["VIEW_DATA", "EDIT_DATA"] },
        { roleCode: "USER", permissions: ["VIEW_DATA"] },
    ];

    for (const m of mappings) {
        const roleId = roleMap[m.roleCode];
        for (const pCode of m.permissions) {
            const permissionId = permMap[pCode];
            const existing = await (prisma as any).tbl_role_permissions.findFirst({
                where: { roleId, permissionId }
            });
            if (!existing) {
                await (prisma as any).tbl_role_permissions.create({
                    data: { roleId, permissionId, isAllowed: true }
                });
            }
        }
    }

    // 4. Create Users (L1, L2, L3, L4)
    const userIds = [
        randomUUID(), // L1 admin
        randomUUID(), // L2 manager
        randomUUID(), // L3 asman
        randomUUID(), // L4 staff 1
        randomUUID(), // L4 staff 2
        randomUUID(), // L4 staff 3
    ];
    const usersData = [
        { id: userIds[0], name: 'Ali Wijaya',    email: 'ali@example.com',    role: 'admin',   roleId: roleMap['ADMIN'],   color: '#f87171', organizationUnit: 'Executive' },
        { id: userIds[1], name: 'Budi Manager',  email: 'budi@example.com',   role: 'manager', roleId: roleMap['MANAGER'], color: '#60a5fa', organizationUnit: 'Engineering' },
        { id: userIds[2], name: 'Citra Asman',   email: 'citra@example.com',  role: 'asman',   roleId: roleMap['ASMAN'],   color: '#34d399', organizationUnit: 'Engineering' },
        { id: userIds[3], name: 'Dewi Staff',    email: 'dewi@example.com',   role: 'member',  roleId: roleMap['USER'],    color: '#fbbf24', organizationUnit: 'Engineering' },
        { id: userIds[4], name: 'Eko Staff',     email: 'eko@example.com',    role: 'member',  roleId: roleMap['USER'],    color: '#a78bfa', organizationUnit: 'Marketing' },
        { id: userIds[5], name: 'Fani Staff',    email: 'fani@example.com',   role: 'member',  roleId: roleMap['USER'],    color: '#fb923c', organizationUnit: 'Infrastructure' },
    ];

    const dbUsers = [];
    for (const u of usersData) {
        const user = await (prisma as any).tbl_users.upsert({
            where: { email: u.email },
            update: { roleId: u.roleId, role: u.role, organizationUnit: u.organizationUnit },
            create: {
                ...u,
                passwordHash: simpleHash('password123'),
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        dbUsers.push(user);
    }
    const finalUserIds = dbUsers.map(u => u.id);

    // 5. Create Streams
    const streamIds = ['st1', 'st2', 'st3'];
    const streamsData = [
        { id: 'st1', code: 'PROD', name: 'Production', description: 'Core product development' },
        { id: 'st2', code: 'MARKET', name: 'Marketing', description: 'User growth and brand' },
        { id: 'st3', code: 'INFRA', name: 'Infrastructure', description: 'Backend and cloud' },
    ];

    for (const s of streamsData) {
        await (prisma as any).tbl_streams.upsert({
            where: { id: s.id },
            update: {},
            create: { ...s, isActive: 'true', sortOrder: '0', createdAt: new Date(), updatedAt: new Date() },
        });
    }

    // 5b. Assign streams to users (user_streams)
    // L1 (Ali): all streams
    // L2 (Budi Manager): PROD + MARKET
    // L3 (Citra Asman): PROD
    // L4 Staff: individual streams
    const userStreamAssignments = [
        { userEmail: 'ali@example.com',   streamIds: ['st1','st2','st3'] },
        { userEmail: 'budi@example.com',  streamIds: ['st1','st2'] },
        { userEmail: 'citra@example.com', streamIds: ['st1'] },
        { userEmail: 'dewi@example.com',  streamIds: ['st1'] },
        { userEmail: 'eko@example.com',   streamIds: ['st2'] },
        { userEmail: 'fani@example.com',  streamIds: ['st3'] },
    ];

    for (const assignment of userStreamAssignments) {
        const user = dbUsers.find(u => u.email === assignment.userEmail);
        if (!user) continue;
        // Clear existing streams first
        await (prisma as any).tbl_user_streams.deleteMany({ where: { userId: user.id } });
        for (const sid of assignment.streamIds) {
            await (prisma as any).tbl_user_streams.create({
                data: {
                    id: randomUUID(),
                    userId: user.id,
                    streamId: sid,
                    createdAt: new Date(),
                }
            });
        }
    }

    // 6. Create Tags
    const tagsData = [
        { id: 't1', code: 'URGENT', name: 'Urgent', category: 'priority' },
        { id: 't2', code: 'BACKEND', name: 'Backend', category: 'tech' },
        { id: 't3', code: 'FRONTEND', name: 'Frontend', category: 'tech' },
        { id: 't4', code: 'DESIGN', name: 'Design', category: 'ui' },
    ];

    for (const t of tagsData) {
        await (prisma as any).tbl_project_tags.upsert({
            where: { id: t.id },
            update: {},
            create: { ...t, isActive: 'true', sortOrder: '0', createdAt: new Date(), updatedAt: new Date() },
        });
    }

    // 7. Create Projects
    const projectTitles = [
        'Website Redesign', 'Mobile App V2', 'API Migration', 'CRM Integration',
        'Cloud Infrastructure', 'Security Audit', 'Brand Refresh', 'Data Analytics'
    ];
    const projectColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    for (let i = 0; i < projectTitles.length; i++) {
        const projectId = `p${i + 1}`;
        const streamId = streamIds[i % streamIds.length];

        await (prisma as any).tbl_projects.upsert({
            where: { id: projectId },
            update: {},
            create: {
                id: projectId,
                title: projectTitles[i],
                description: `Description for ${projectTitles[i]}`,
                color: projectColors[i],
                streamId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // Add members to project
        for (const userId of finalUserIds) {
            await (prisma as any).tbl_project_members.create({
                data: {
                    id: randomUUID(),
                    projectId,
                    userId,
                }
            });
        }

        // Add some tags
        await (prisma as any).tbl_project_tag_relations.create({
            data: {
                id: randomUUID(),
                projectId,
                tagId: tagsData[i % tagsData.length].id,
            }
        });

        // 8. Create Tasks for each project
        const taskStatuses = ['todo', 'in-progress', 'review', 'done'];
        const taskPriorities = ['low', 'medium', 'high', 'urgent'];

        for (let j = 0; j < 5; j++) {
            const taskId = `t_${projectId}_${j}`;
            const status = taskStatuses[j % taskStatuses.length];
            const priority = taskPriorities[j % taskPriorities.length];
            const assigneeId = finalUserIds[j % finalUserIds.length];

            await (prisma as any).tbl_tasks.upsert({
                where: { id: taskId },
                update: {},
                create: {
                    id: taskId,
                    projectId,
                    title: `Task ${j + 1} for ${projectTitles[i]}`,
                    description: `Detailed description for task ${j + 1}`,
                    status,
                    priority,
                    assigneeId,
                    dueDate: new Date(Date.now() + j * 24 * 60 * 60 * 1000),
                    startDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // Create Subtasks
            for (let k = 0; k < 3; k++) {
                await (prisma as any).tbl_subtasks.create({
                    data: {
                        id: randomUUID(),
                        taskId,
                        title: `Subtask ${k + 1} for ${taskId}`,
                        completed: k % 2 === 0 ? 'true' : 'false',
                        sortOrder: k.toString(),
                        createdAt: new Date(),
                    }
                });
            }

            // Create some Comments
            await (prisma as any).tbl_comments.create({
                data: {
                    id: randomUUID(),
                    taskId,
                    userId: finalUserIds[(j + 1) % finalUserIds.length],
                    content: `This is a comment for ${taskId}`,
                    createdAt: new Date(),
                }
            });

            // Create Time Logs
            await (prisma as any).tbl_time_logs.create({
                data: {
                    id: randomUUID(),
                    taskId,
                    userId: assigneeId,
                    hours: (Math.random() * 4 + 1).toFixed(1),
                    date: new Date(),
                    description: 'Working on task',
                    createdAt: new Date(),
                }
            });
        }
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
