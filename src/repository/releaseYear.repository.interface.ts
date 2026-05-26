import { ReleaseYear } from "../model/releaseYear";

export interface IReleaseYearRepository {
  getAllReleaseYears(): Promise<ReleaseYear[]>;
}