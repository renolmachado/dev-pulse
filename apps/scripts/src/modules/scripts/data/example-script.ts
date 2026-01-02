import { Script, ScriptContext } from '../scripts.service';

const script: Script = {
  name: 'example',
  description: 'An example script that demonstrates the structure',
  
  async execute(context: ScriptContext) {
    const { prisma, logger } = context;
    
    logger.log('Starting example script...');
    
    // Example: Count all articles
    const articleCount = await prisma.client.article.count();
    logger.log(`Total articles in database: ${articleCount}`);
    
    // Add your custom logic here
    logger.log('Example script logic executed');
  },
};

export default script;
