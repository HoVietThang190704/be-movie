import { InferSchemaType, model, Schema } from "mongoose";

export const categorySchema = new Schema({
    id: { type: String },
    name: { type: String },
    slug: { type: String }
})

export const countrySchema = new Schema({
    id: { type: String },
    name: { type: String },
    slug: { type: String }
})

export const episodeSchema = new Schema({
    server_name: { type: String, required: true },
    server_data: [
        {
            name: { type: String, required: true },
            slug: { type: String, required: true },
            filename: { type: String, required: true },
            link_embed: { type: String, required: true },
            link_m3u8: { type: String, required: true }
        }
    ]
})

export const movieSchema = new Schema({
    tmdb: {
        type: {
            type: String,
            default: null
        },
        id: { type: String, default: '' },
        season: { type: Number, default: null },
        vote_average: { type: Number, default: 0 },
        vote_count: { type: Number, default: 0 }
    },
    imdb: {
        id: { type: String, default: '' }
    },
    created: {
        time: { type: Date, default: Date.now }
    },
    modified: {
        time: { type: Date, default: Date.now }
    },
    name: { type: String, required: true },
    origin_name: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'series' },
    status: { type: String, default: 'completed' },
    thumb_url: { type: String, default: '' },
    trailer_url: { type: String, default: '' },
    time: { type: String, default: '60 phút/tập' },
    episode_current: { type: String, default: 'Hoàn Tất (12/12)' },
    episode_total: { type: String, default: '12 Tập' },
    quality: { type: String, default: 'FHD' },
    lang: { type: String, default: 'Vietsub' },
    notify: { type: String, default: '' },
    showtimes: { type: String, default: '' },
    slug: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    view: { type: Number, default: 0 },
    actor: [{ type: String }],
    director: [{ type: String }],
    category: [categorySchema],
    country: [countrySchema],
    is_copyright: { type: Boolean, default: false },
    chieurap: { type: Boolean, default: false },
    poster_url: { type: String, default: '' },
    sub_docquyen: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    episodes: [episodeSchema]
})

export const MovieModel = model('Movie', movieSchema);
export type Movie = InferSchemaType<typeof movieSchema>;
export type Episode = InferSchemaType<typeof episodeSchema>;
export type Category = InferSchemaType<typeof categorySchema>;
export type Country = InferSchemaType<typeof countrySchema>;

