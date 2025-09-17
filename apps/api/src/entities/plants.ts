import { PlantDTO } from "@schemas/plants.schema";

export class Plant {
  constructor(public data: PlantDTO) {}

  public getData(): PlantDTO {
    return this.data;
  }

  public needWatering(): boolean {
    const currentDate = new Date();
    return currentDate.getDay() > this.data.wateringIntervalDays;
  }
}
