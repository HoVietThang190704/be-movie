import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';
import mongoose from 'mongoose';
import { MovieModel } from '../model/movie';
import { config } from '../lib/utils/config/db.config';

const LIST_URL = 'https://ophim1.com/danh-sach/phim-moi-cap-nhat';
const DETAIL_URL = 'https://ophim1.com/phim/';

/**
 * WORKER LOGIC
 */
if (!isMainThread) {
    const run = async () => {
        try {
            await mongoose.connect(config.MONGO_URI);

            const { startPage, offset } = workerData;
            let totalSaved = 0;

            for (let i = 0; i < offset; i++) {
                const page = startPage + i;
                try {
                    const response = await fetch(`${LIST_URL}?page=${page}`);
                    if (!response.ok) {
                        console.error(
                            `Worker ${startPage} failed to fetch list page ${page}: ${response.status}`
                        );
                        continue;
                    }

                    const data = (await response.json()) as any;
                    const items = data.items || [];

                    for (const item of items) {
                        try {
                            const detailRes = await fetch(`${DETAIL_URL}${item.slug}`);
                            if (!detailRes.ok) continue;

                            const detailData = (await detailRes.json()) as any;
                            if (detailData.status && detailData.movie) {
                                const { _id, ...movieInfo } = detailData.movie;
                                const episodes = detailData.episodes || [];

                                const payload = {
                                    ...movieInfo,
                                    episodes: episodes,
                                };

                                await MovieModel.findOneAndUpdate({ slug: payload.slug }, payload, {
                                    upsert: true,
                                    new: true,
                                    setDefaultsOnInsert: true,
                                });
                                totalSaved++;
                            }
                        } catch (movieErr) {
                            console.error(`Error processing movie details for ${item.slug}:`, movieErr);
                        }
                    }
                    console.log(`Worker starting at ${startPage} completed page ${page}`);
                } catch (pageErr) {
                    console.error(`Error processing list page ${page}:`, pageErr);
                }
            }

            parentPort?.postMessage({ totalSaved });
        } catch (error) {
            console.error(
                `Worker starting at page ${workerData.startPage} encountered a fatal error:`,
                error
            );
        } finally {
            await mongoose.disconnect();
        }
    };

    run();
} else {
    /**
     * MAIN THREAD LOGIC
     */
    const limit = 100; // Total number of pages to process from the API
    const pagesPerWorker = 10;

    const createWorker = (startPage: number, offset: number): Promise<{ totalSaved: number }> => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: { startPage, offset },
                execArgv: /\.ts$/.test(__filename) ? ['-r', 'ts-node/register'] : undefined,
            });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
            });
        });
    };

    async function seedMovies() {
        console.log('Starting movie seeding process...');
        console.log(`Targeting ${limit} pages with workers processing ${pagesPerWorker} pages each.`);

        const workerPromises: Promise<{ totalSaved: number }>[] = [];

        for (let i = 1; i <= limit; i += pagesPerWorker) {
            workerPromises.push(createWorker(i, pagesPerWorker));
        }

        const results = await Promise.all(workerPromises);
        const grandTotal = results.reduce((acc, curr) => acc + (curr?.totalSaved || 0), 0);
        return grandTotal;
    }

    seedMovies()
        .then((total) => {
            console.log(`\nSeeding completed successfully!`);
            console.log(`Total movies processed and saved: ${total}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('\nSeeding failed with error:');
            console.error(error);
            process.exit(1);
        });
}