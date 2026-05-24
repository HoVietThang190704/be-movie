import { ReleaseYear, ReleaseYearModel } from "../model/releaseYear";
import { IReleaseYearRepository } from "./releaseYear.repository.interface";

export class ReleaseYearRepository implements IReleaseYearRepository {
  constructor() {}

  async getAllReleaseYears(): Promise<ReleaseYear[]> {
    const releaseYears = await ReleaseYearModel.find().exec();
    return releaseYears;
  }
}