import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  organization: { type: String, required: true },
  department: { type: String },
  type: { type: String },
  postNames: [{ type: String }],
  totalVacancy: { type: Number },
  qualification: [{
    name: String,
    level: Number,
    branches: [String],
    extraConditions: [String]
  }],
  ageLimit: {
    min: Number,
    max: Number,
    relaxation: {
      obc: Number,
      sc: Number,
      st: Number,
      pwd: Number,
      exServiceman: Number,
    }
  },
  categoryEligibility: [String],
  pwdEligible: { type: Boolean },
  femaleOnly: { type: Boolean },
  exServicemanQuota: { type: Boolean },
  location: [String],
  salary: {
    payLevel: String,
    min: Number,
    max: Number,
    currency: String
  },
  applicationFee: {
    general: Number,
    obc: Number,
    sc: Number,
    showLastDate: Boolean,
    female: Number
  },
  importantDates: {
    notificationRelease: String,
    startDate: String,
    lastDate: { type: String },
    examDate: String,
    resultDate: String,
    interviewDate: String,
    documentVerificationDate: String
  },
  selectionProcess: [String],
  description: { type: String },
  officialWebsite: { type: String },
  applyLink: { type: String },
  notificationPdfLink: { type: String },
  source: { type: String },
  tags: [String],
  active: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
