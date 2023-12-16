import path from "path";
import { DataSource } from "typeorm";
import { Builder, fixturesIterator, IEntity, Loader, Parser, Resolver } from "typeorm-fixtures-cli";
import { dataBaseConfig } from "@app/data.source";

const FIXTURES_PATH = "./test/helpers/fixtures/";

export interface FixtureFactory {
  get: <T extends IEntity>(key: string) => T;
}

export interface CreatedFixtures {
  [key: string]: IEntity;
}

const loadFixtures = async (): Promise<FixtureFactory> => {
  const createdFixtures: CreatedFixtures = {};
  try {
    const dataSource: DataSource = new DataSource(dataBaseConfig(process.env.NODE_ENV));
    await dataSource.initialize();
    await dataSource.dropDatabase();
    await dataSource.runMigrations();

    const loader = new Loader();
    loader.load(path.resolve(FIXTURES_PATH));
    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(dataSource, new Parser(), false);

    for (const fixture of fixturesIterator(fixtures)) {
      const entity = await builder.build(fixture);
      createdFixtures[fixture.name] = await dataSource.getRepository(fixture.entity).save(entity);
    }

    await dataSource.destroy();
    return {
      get: <T extends IEntity>(key: string) => {
        return createdFixtures[key] as T;
      },
    };
  } catch (error) {
    console.log("loadFixture error: ", error);
  }
};

export default loadFixtures;
