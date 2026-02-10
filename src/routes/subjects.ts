import express from "express";
import { or, ilike, and, sql, eq, getTableColumns, desc } from "drizzle-orm";
import { subjects, departments } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// Get all subjects with pagination, sorting, and filtering
router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);

        const offset = (currentPage - 1) * pageSize;

        const filterConditions = [];

        // If search query is provided, add conditions to filter by name or code
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        // If department filter is provided, add condition to filter by department
        if (department) {
            filterConditions.push(ilike(departments.name, `%${department}%`));
        }

        // Combine all filter conditions using AND if any exist
        const whereClause =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(pageSize)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                total: totalCount,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    } catch (e) {
        console.error(`Error fetching subjects: ${e}`);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

export default router;
