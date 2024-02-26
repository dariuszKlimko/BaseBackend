import { Test, TestingModule } from "@nestjs/testing";
import { MathServiceIntrface } from "@app/common/types/interfaces/services/math.service.interface";
import { MathSevice } from "@app/services/math.service";

describe("MathService", () => {
  let mathService: MathServiceIntrface;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({ 
        providers: [MathSevice],
    }).compile();

    mathService = module.get<MathServiceIntrface>(MathSevice);
  });

  it("mathService should be defined", () => {
    expect(mathService).toBeDefined();
  });

  describe("roundValue()", () => {
    it("should round value to 1 digits", async () => {
      const result: number = mathService.roundValue(3.2999, 1);
      return expect(result).toEqual(3.3);
    });

    it("should round value to 2 digits", async () => {
      const result: number = mathService.roundValue(3.2199, 2);
      return expect(result).toEqual(3.22);
    });
    it("should round value to 1 digits", async () => {
      const result: number = mathService.roundValue(3.21988, 4);
      return expect(result).toEqual(3.2199);
    });
  });

  describe("powValue()", () => {
    it("should return value to the power of 1", async () => {
      const result: number = mathService.powValue(3,1);
      return expect(result).toEqual(3);
    });

    it("should return value to the power of 2", async () => {
      const result: number = mathService.powValue(3,2);
      return expect(result).toEqual(9);
    });

    it("should return value to the power of 3", async () => {
      const result: number = mathService.powValue(3.14,3);
      return expect(result).toEqual(30.959144000000002);
    });

    it("should return value to the power of 0.5", async () => {
      const result: number = mathService.powValue(4,0.5);
      return expect(result).toEqual(2);
    });
  });

});