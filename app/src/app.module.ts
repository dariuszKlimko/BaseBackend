import { Module } from "@nestjs/common";
import { AppConfigModule } from "@app/modules/config/config.module";
import { DatabaseModule } from "@app/modules/database/database.module";
import { EmailModule } from "@app/modules/email/email.module";
import { UserModule } from "@app/modules/user/user.module";
import { AuthModule } from "@app/modules/auth/auth.module";
import { MeasurementModule } from "@app/modules/measurements/measuremants.module";

@Module({
  imports: [AppConfigModule, DatabaseModule, EmailModule, UserModule, AuthModule, MeasurementModule],
})
export class AppModule {}
