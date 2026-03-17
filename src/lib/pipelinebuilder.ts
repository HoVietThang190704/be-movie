import { Path, PipelineStage } from "mongoose";

export class PipelineBuilder<T> {
    private pipeline: PipelineStage[];
    constructor(){
        this.pipeline = [];
    }

    sort(sortCriteria: Record<string, 1 | -1>): PipelineBuilder<T> {
        this.pipeline.push({ $sort: sortCriteria });
        return this;
    }

    limit(limitNumber: number): PipelineBuilder<T> {
        const maxLimit = 30;
        limitNumber = Math.min(limitNumber, maxLimit);
        this.pipeline.push({ $limit: limitNumber });
        return this;
    }

    in(field: string, values: unknown): PipelineBuilder<T> {
        this.pipeline.push({ $match: { [field]: { $in: values } } });
        return this;
    }

    project(projection: Partial<Record<keyof T, 0 | 1>>): PipelineBuilder<T> {
        this.pipeline.push({ $project: projection });
        return this;
    }

    match(filter: Record<string, unknown>): PipelineBuilder<T> {
        this.pipeline.push({ $match: filter });
        return this;    
    }

    unwind(path: string): PipelineBuilder<T> {
        this.pipeline.push({ $unwind: `$${path}` });
        return this;
    }

    regex(filed: keyof T, pattern: string, options?: string): PipelineBuilder<T> {
        this.pipeline.push({ $match: { [filed]: { $regex: pattern, $options: options || 'i' } } });
        return this;
    }

    build(): PipelineStage[] {
        return this.pipeline;
    }
}