#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { AppModule } from './app.module';
import { ScriptsService } from './modules/scripts/scripts.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const program = new Command();

  program.name('scripts-cli').description('CLI to run scripts, migrations, and other tasks').version('1.0.0');

  program
    .command('script:run <name>')
    .description('Run a specific script by name')
    .action(async (name: string) => {
      const scriptsService = app.get(ScriptsService);
      try {
        await scriptsService.runScript(name);
        console.log(`✅ Script "${name}" completed successfully`);
      } catch (error) {
        console.error(`❌ Script "${name}" failed:`, error);
        process.exit(1);
      }
    });

  program
    .command('script:list')
    .description('List all available scripts')
    .action(async () => {
      const scriptsService = app.get(ScriptsService);
      await scriptsService.listScripts();
    });

  await program.parseAsync(process.argv);
  await app.close();
}

bootstrap();
