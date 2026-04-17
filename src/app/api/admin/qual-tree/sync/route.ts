import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Registry from '@/models/Registry';

export async function POST() {
  try {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

    // Only allow sync on Localhost (to protect the file system)
    if (!isDev) {
      return NextResponse.json({ error: "Sync only allowed in Localhost development mode." }, { status: 403 });
    }

    await dbConnect();
    // Fetch everything from DB - this is our new Source of Truth for edits
    const dbRegistry = await Registry.find({}).sort({ level: 1 }).lean();

    if (dbRegistry.length === 0) {
      return NextResponse.json({ error: "No registry data found in Database." }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'src', 'lib', 'constants.ts');

    // ── REBUILD THE CONSTANTS FILE CONTENT ──
    let newContent = `export interface QualNode {
  level: number;
  name: string;
  label: string;
  branches: { value: string; label: string }[];
}

export const QUAL_TREE: QualNode[] = ${JSON.stringify(dbRegistry.map(({ level, name, label, branches }) => ({
      level, name, label, branches: branches.map((b: any) => ({ value: b.value, label: b.label }))
    })), null, 2).replace(/"([^"]+)":/g, '$1:')};

export const LEVEL_GROUPS = [
  { id: 1, levels: [1], label: "10th / Matriculation" },
  { id: 2, levels: [2], label: "12th / Intermediate / HSC" },
  { id: 3, levels: [3], label: "ITI / Diploma / Nursing" },
  { id: 4, levels: [4], label: "Graduation / Bachelor's Degrees" },
  { id: 5, levels: [5], label: "Post-Graduation / Master's Degrees" }
];
`;

    fs.writeFileSync(filePath, newContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${dbRegistry.length} courses from Database to constants.ts. File completely rebuilt.`
    });

  } catch (error: any) {
    console.error("FULL SYNC API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
