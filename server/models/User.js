import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  [
    {
      email: {
        type: String,
        unique: true,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      passwordHash: {
        type: String,
        required: true,
      },
      avatar: String,
    },
  ],
  { timestamps: true },
);

export default mongoose.model('User', UserSchema);
