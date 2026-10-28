import mongoose from "mongoose";

const BkashTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "current" },
    idToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    expiresAt: { type: Date, default: null },
    lockId: { type: String, default: "" },
    lockExpiresAt: { type: Date, default: null },
  },
  { versionKey: false }
);

export default mongoose.models.BkashToken || mongoose.model("BkashToken", BkashTokenSchema);
