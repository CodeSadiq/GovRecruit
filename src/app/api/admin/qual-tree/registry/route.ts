import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registry from '@/models/Registry';
import { QUAL_TREE } from '@/lib/constants';

// Seeding logic: If DB is empty, push everything from constants.ts
async function seedIfNeeded() {
  const count = await Registry.countDocuments();
  if (count === 0) {
    console.log("Seeding Registry from constants.ts...");
    // InsertMany will handle the array
    await Registry.insertMany(QUAL_TREE);
  }
}

export async function GET() {
  try {
    await dbConnect();
    await seedIfNeeded();
    const registry = await Registry.find({}).sort({ level: 1 });
    return NextResponse.json(registry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, label, level, branches } = await request.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    await dbConnect();
    
    // UPSERT: Create if doesn't exist, update if it does
    const updated = await Registry.findOneAndUpdate(
      { name },
      { label, level, branches },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ error: "Course name required" }, { status: 400 });

    await dbConnect();
    await Registry.deleteOne({ name });
    
    return NextResponse.json({ success: true, message: `Course ${name} deleted from registry.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
