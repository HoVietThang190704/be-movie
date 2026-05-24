import { ReleaseYear } from "../model/releaseYear";
import { IReleaseYearRepository } from "../repository/releaseYear.repository.interface";
import { IReleaseYearService } from "./releaseYear.service.interface";

export class ReleaseYearService implements IReleaseYearService {
  private readonly releaseYearRepository: IReleaseYearRepository;
  constructor(releaseYearRepository: IReleaseYearRepository) {
    this.releaseYearRepository = releaseYearRepository;
  }

  async getAllReleaseYears(): Promise<ReleaseYear[]> {
    return this.releaseYearRepository.getAllReleaseYears();
  }
}