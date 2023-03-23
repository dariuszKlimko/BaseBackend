import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { dataSourceFunc } from "@app/modules/database/data-source";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (serviceConfig: ConfigService) => dataSourceFunc(serviceConfig.get("NODE_ENV")),
    }),
  ],
})
export class DatabaseModule {}
