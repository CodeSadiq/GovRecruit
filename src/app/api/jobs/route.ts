import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

import fs from 'fs';
import path from 'path';

export async function GET() {
  await dbConnect();
  try {
    // 1. Get DB Jobs
    const dbJobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    
    // 2. Get File Jobs
    const dataDir = path.join(process.cwd(), 'data');
    let fileJobs: any[] = [];
    if (fs.existsSync(dataDir)) {
      fileJobs = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf-8'));
            return { ...data, isFile: true };
          } catch(e) { return null; }
        })
        .filter(j => j !== null);
    }

    // Combine and sort
    const allJobs = [...fileJobs, ...dbJobs].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

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
    
    const job = await Job.create(body);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN INJECTION FAILED:", error);
    
    // Handle Duplicate Key Error (MongoDB Code 11000)
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: "Duplicate Identity Detected: A recruitment with this ID already exists in the repository." 
      }, { status: 400 });
    }
    
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
