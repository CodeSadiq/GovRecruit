import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bulletin from '@/models/Bulletin';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const bulletin = await Bulletin.findOne({ id }).lean();
      if (!bulletin) return NextResponse.json({ success: false, error: "Bulletin not found" }, { status: 404 });
      return NextResponse.json(bulletin);
    }

    const allBulletins = await Bulletin.find({ active: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(allBulletins);
  } catch (error) {
    console.error("BULLETIN GET ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bulletins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    
    if (!body.id) {
      body.id = 'b-' + Math.random().toString(36).substr(2, 9);
    }

    const bulletin = await Bulletin.findOneAndUpdate(
      { id: body.id }, 
      body, 
      { upsert: true, new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: bulletin }, { status: 201 });
  } catch (error: any) {
    console.error("BULLETIN SYNC FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });

    const deleted = await Bulletin.findOneAndDelete({ id });
    if (!deleted) return NextResponse.json({ success: false, error: "Bulletin not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Bulletin deleted successfully" });
  } catch (error: any) {
    console.error("BULLETIN DELETE FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
