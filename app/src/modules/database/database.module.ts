import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { dataSourceFunc } from "@app/modules/database/data-source";

const config = new ConfigService();

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceFunc(config.get("NODE_ENV")))],
})
export class DatabaseModule {}
