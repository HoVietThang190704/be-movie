import mongoose from 'mongoose';
import dns from 'dns';
import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';
import { MovieModel } from '../model/movie';
import { ActorModel } from '../model/actor';
import { config } from '../lib/utils/config/db.config';

// Set Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const PEOPLE_API_URL = 'https://ophim1.com/v1/api/phim/';
const REQUEST_TIMEOUT = 10000;
const PARALLEL_API_FETCHES = 20;

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
};

if (!isMainThread) {
  const runWorker = async () => {
    try {
      await mongoose.connect(config.MONGO_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 60000,
      });

      const { skip, limit } = workerData as { skip: number; limit: number };
      const movies = await MovieModel.find({}, 'slug').skip(skip).limit(limit).lean();

      let upsertedCount = 0;

      for (let i = 0; i < movies.length; i += PARALLEL_API_FETCHES) {
        const batch = movies.slice(i, i + PARALLEL_API_FETCHES);

        const results = await Promise.allSettled(
          batch.map(async (movie) => {
            const res = await fetchWithTimeout(`${PEOPLE_API_URL}${movie.slug}/peoples`);
            if (!res?.ok) return null;
            const json = (await res.json()) as any;
            return json.data;
          })
        );

        const actorOps: any[] = [];

        for (const result of results) {
          if (result.status === 'fulfilled' && result.value?.peoples) {
            const data = result.value;
            const profileBase = data.profile_sizes?.w185 || '';

            for (const person of data.peoples) {
              if (person.known_for_department === 'Acting') {
                const name = person.name;
                const slug = slugify(name);
                const thumb_url = person.profile_path ? `${profileBase}${person.profile_path}` : '';

                actorOps.push({
                  updateOne: {
                    filter: { slug },
                    update: {
                      $set: {
                        tmdb_id: person.tmdb_people_id,
                        name,
                        original_name: person.original_name,
                        slug,
                        thumb_url,
                        gender: person.gender,
                        gender_name: person.gender_name,
                        known_for_department: person.known_for_department,
                        also_known_as: person.also_known_as || [],
                      },
                    },
                    upsert: true,
                  },
                });
              }
            }
          }
        }

        if (actorOps.length > 0) {
          try {
            const res = await ActorModel.bulkWrite(actorOps, { ordered: false });
            upsertedCount += (res.upsertedCount || 0) + (res.modifiedCount || 0);
          } catch (err) {
            // BulkWrite might partially fail if there are duplicate slugs in the same batch
            // but ordered: false allows other operations to succeed
          }
        }
      }

      parentPort?.postMessage({ upsertedCount });
    } catch (error) {
      console.error('Worker error:', error);
      parentPort?.postMessage({ error: String(error) });
    } finally {
      await mongoose.disconnect();
    }
  };

  runWorker();
} else {
  async function seedActors() {
    console.log('🚀 Starting deep actor seeding with enhanced schema...');
    const startTime = Date.now();

    await mongoose.connect(config.MONGO_URI);
    const totalMovies = await MovieModel.countDocuments();
    await mongoose.disconnect();

    if (totalMovies === 0) {
      console.log('❌ No movies found. Seed movies first.');
      process.exit(0);
    }

    const moviesPerWorker = 200;
    const numWorkers = 4;
    const totalBatches = Math.ceil(totalMovies / moviesPerWorker);

    let activeWorkers = 0;
    let totalProcessed = 0;
    let totalUpserted = 0;

    const createWorker = (skip: number, limit: number): Promise<void> => {
      return new Promise((resolve) => {
        const worker = new Worker(__filename, {
          workerData: { skip, limit },
          execArgv: /\.ts$/.test(__filename) ? ['-r', 'ts-node/register'] : undefined,
        });

        worker.on('message', (msg) => {
          if (msg.upsertedCount) totalUpserted += msg.upsertedCount;
          resolve();
        });

        worker.on('error', (err) => {
          console.error('Worker error:', err);
          resolve();
        });

        worker.on('exit', () => resolve());
      });
    };

    for (let i = 0; i < totalBatches; i++) {
      while (activeWorkers >= numWorkers) {
        await new Promise((r) => setTimeout(r, 100));
      }

      activeWorkers++;
      const skip = i * moviesPerWorker;

      createWorker(skip, moviesPerWorker).then(() => {
        activeWorkers--;
        totalProcessed++;
        if (totalProcessed % 5 === 0 || totalProcessed === totalBatches) {
          console.log(`Progress: ${totalProcessed}/${totalBatches} movie batches processed...`);
        }
      });
    }

    while (activeWorkers > 0) {
      await new Promise((r) => setTimeout(r, 100));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `\n✅ Done! Processed ${totalMovies} movies and updated ${totalUpserted} actors in ${duration}s`
    );
    process.exit(0);
  }

  seedActors().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
