import { InferSchemaType, model, Schema } from "mongoose";

export const categorySchema = new Schema({
    id: { type: String },
    name: { type: String },
    slug: { type: String }
})

export const CategoryModel = model('Category', categorySchema)
export type Category = InferSchemaType<typeof categorySchema>