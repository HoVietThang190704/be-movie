import { InferSchemaType, Schema, model } from 'mongoose';

const actorSchema = new Schema(
  {
    tmdb_id: { type: Number, index: true },
    name: { type: String, required: true, index: true },
    original_name: { type: String },
    slug: { type: String, required: true, unique: true },
    thumb_url: { type: String, default: '' },
    gender: { type: Number },
    gender_name: { type: String },
    known_for_department: { type: String },
    also_known_as: [{ type: String }],
    content: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient searching
actorSchema.index({ tmdb_id: 1 });
actorSchema.index({ slug: 1 }, { unique: true });

export const ActorModel = model('Actor', actorSchema);
export type Actor = InferSchemaType<typeof actorSchema>;