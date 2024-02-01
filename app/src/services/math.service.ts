import { Injectable, Logger } from "@nestjs/common";
import { MathServiceIntrface } from "@app/services/interfaces/math.service.interface";

@Injectable()
export class MathSevice implements MathServiceIntrface {
  private readonly logger: Logger = new Logger(MathSevice.name);

  roundValue(value: number, round: number): number {
    return Number(value.toFixed(round));
  }

  powValue(value: number, pow: number): number {
    return Math.pow(value, pow);
  }
}
