import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://sadiqimam404_db_user:Imam%402004@cluster0.6v4usao.mongodb.net/?appName=Cluster0";

// The hardcoded JSON has been removed per user request. 
// Recruitment data should be managed via the Admin Recruitment Manager 
// or by importing/pasting JSON directly into the database.

async function seed() {
  console.log("Seeding script is now empty. Use Admin portal to publish jobs.");
  process.exit(0);
}

seed();
