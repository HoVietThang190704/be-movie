import mongoose from 'mongoose';

import { config } from '../lib/utils/config/db.config';
import { CategoryModel } from '../model/Category';

const CATEGORY_URL = 'https://ophim1.com/v1/api/the-loai';

type OphimCategoryDto = {
  _id: string;
  slug: string;
  name: string;
};

type OphimCategoryResponse = {
  status: 'success' | 'error' | string;
  message?: string;
  data: { items: OphimCategoryDto[] };
};

async function seedCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);

    console.log(`Fetching categories from ${CATEGORY_URL}`);
    const response = await fetch(CATEGORY_URL, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch category API failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as OphimCategoryResponse;
    if (!body || !body.data || !Array.isArray(body.data.items)) {
      throw new Error('Invalid category data format from API');
    }

    const categories = body.data.items;
    let upserted = 0;

    for (const category of categories) {
      const { _id, slug, name } = category;
      if (!slug || !name) continue;

      const result = await CategoryModel.findOneAndUpdate(
        { slug },
        {
          id: _id || null,
          slug,
          name,
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        }
      );

      if (result) upserted++;
    }

    console.log(`Seed complete: processed ${categories.length} categories, upserted ${upserted} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedCategories();
