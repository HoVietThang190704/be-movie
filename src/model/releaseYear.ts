import { InferSchemaType, model, Schema } from "mongoose";

export const yearSchema = new Schema(
  {
    items: [
      {
        year: { type: Number, required: true },
      }
    ]
  }
)

export const ReleaseYearModel = model('ReleaseYear', yearSchema);
export type ReleaseYear = InferSchemaType<typeof yearSchema>;