import { BaseResponse } from "../lib/baseresponse";
import { ReleaseYear } from "../model/releaseYear";
import { Request, Response } from 'express';
import { IReleaseYearService } from "../service/releaseYear.service.interface";

export class ReleaseYearController {
  private readonly releaseYearService: IReleaseYearService;
  constructor(releaseYearService: IReleaseYearService) {
    this.releaseYearService = releaseYearService;
  }

  async getAllReleaseYears(req: Request, res: Response) {
    try {
      const releaseYears = await this.releaseYearService.getAllReleaseYears();
      const response = new BaseResponse<ReleaseYear[]>()
        .setResponse(200)
        .setMessage("Release years fetched successfully")
        .setSuccess(true)
        .setData(releaseYears);
      res.json(response);
    } catch (error) {
      const response = new BaseResponse<null>()
        .setResponse(500)
        .setMessage("Error fetching release years")
        .setSuccess(false)
        .setData(null);
      res.status(500).json(response);
    }
  }
}