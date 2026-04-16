import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { notifyEligibleCandidates } from '@/lib/notification-service';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });

    const job = await Job.findOne({ id }).lean();
    if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    // Ensure notification completes before response
    try {
      await notifyEligibleCandidates(job);
      return NextResponse.json({ success: true, message: "Notifications dispatched successfully" });
    } catch (err) {
      console.error("Manual Notification Failed:", err);
      return NextResponse.json({ success: false, error: "Failed to dispatch emails" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("NOTIFY API FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
