import mongoose from 'mongoose';
import dns from 'dns';
import { config } from '../lib/utils/config/db.config';
import { ReleaseYearModel } from '../model/releaseYear';

// Set Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const YEARS_URL = 'https://ophim1.com/v1/api/nam-phat-hanh';

type OphimYearDto = {
  _id?: string;
  slug?: string;
  name?: string;
};

type OphimYearResponse = {
  status: string;
  data: OphimYearDto[];
};

async function seedReleaseYears() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);

    console.log(`Fetching release years from ${YEARS_URL}`);
    const response = await fetch(YEARS_URL, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch years API failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as any;

    // debug preview to help diagnose response shape issues
    try {
      const previewItems = Array.isArray(body.data)
        ? body.data.slice(0, 5)
        : body?.data?.items?.slice(0, 5) || body?.items?.slice(0, 5) || [];
      console.log('API response keys:', Object.keys(body || {}));
      console.log('API preview items:', previewItems);
    } catch (e) {
      // ignore preview errors
    }

    // Normalize different possible API response shapes
    let entries: OphimYearDto[] = [];
    if (body && Array.isArray(body.data)) {
      entries = body.data;
    } else if (body && body.data && Array.isArray(body.data.items)) {
      entries = body.data.items;
    } else if (body && body.data && Array.isArray(body.data.data)) {
      entries = body.data.data;
    } else if (body && Array.isArray(body.items)) {
      entries = body.items;
    } else {
      throw new Error('Invalid years data format from API');
    }

    const years = entries
      .map((y) => {
        if (typeof (y as any).year === 'number') return (y as any).year;
        const raw = (y.name || y.slug || '').toString();
        const parsed = parseInt(raw, 10);
        return Number.isNaN(parsed) ? null : parsed;
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => b - a); // keep descending order similar to API display

    const items = years.map((year) => ({ year }));

    await ReleaseYearModel.findOneAndUpdate(
      {},
      { items },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Seed complete: processed ${years.length} release years.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding release years:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedReleaseYears();
