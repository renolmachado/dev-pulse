import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';

import * as fs from 'fs';
import * as path from 'path';

export interface Script {
  name: string;
  description: string;
  execute: (context: ScriptContext) => Promise<void>;
}

export interface ScriptContext {
  prisma: PrismaService;
  logger: Logger;
}

@Injectable()
export class ScriptsService {
  private readonly logger = new Logger(ScriptsService.name);
  private scripts: Map<string, Script> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.loadScripts();
  }

  private loadScripts() {
    const scriptsDir = path.join(__dirname, 'data');

    if (!fs.existsSync(scriptsDir)) {
      this.logger.warn('Scripts directory does not exist. Creating it...');
      fs.mkdirSync(scriptsDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(scriptsDir).filter((f) => (f.endsWith('.ts') || f.endsWith('.js')) && !f.endsWith('.d.ts'));

    for (const file of files) {
      try {
        const script = require(path.join(scriptsDir, file));
        if (script.default) {
          const scriptDef = script.default as Script;
          this.scripts.set(scriptDef.name, scriptDef);
        }
      } catch (error) {
        this.logger.error(`Failed to load script ${file}:`, error);
      }
    }
  }

  /**
   * Run a specific script by name
   */
  async runScript(name: string) {
    const script = this.scripts.get(name);

    if (!script) {
      throw new Error(`Script "${name}" not found`);
    }

    this.logger.log(`Running script: ${script.name}`);
    this.logger.log(`Description: ${script.description}`);

    const context: ScriptContext = {
      prisma: this.prisma,
      logger: this.logger,
    };

    try {
      await script.execute(context);
      this.logger.log(`✅ Script ${name} completed successfully`);
    } catch (error) {
      this.logger.error(`❌ Script ${name} failed:`, error);
      throw error;
    }
  }

  /**
   * List all available scripts
   */
  async listScripts() {
    if (this.scripts.size === 0) {
      console.log('No scripts found');
      return;
    }

    console.log('\nAvailable scripts:');
    console.log('─────────────────────────────────────');
    this.scripts.forEach((script) => {
      console.log(`  ${script.name}`);
      console.log(`    ${script.description}`);
    });
    console.log('─────────────────────────────────────\n');
  }
}
