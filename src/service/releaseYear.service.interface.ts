import { ReleaseYear } from "../model/releaseYear";

export interface IReleaseYearService {
  getAllReleaseYears(): Promise<ReleaseYear[]>;
}