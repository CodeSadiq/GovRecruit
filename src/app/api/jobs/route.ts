import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

import fs from 'fs';
import path from 'path';

export async function GET() {
  await dbConnect();
  try {
    // Get DB Jobs - Strictly Database Source
    const allJobs = await Job.find({}).sort({ updatedAt: -1, createdAt: -1 }).lean();

    return NextResponse.json(allJobs);
  } catch (error) {
    console.error("API GET ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    console.log("Ingesting Recruitment Data:", body.title || body.id);

    // Ensure ID is generated if not provided
    if (!body.id) {
      body.id = Math.random().toString(36).substr(2, 9);
    }

    const job = await Job.findOneAndUpdate({ id: body.id }, body, { upsert: true, new: true, runValidators: true });
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN INJECTION FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
