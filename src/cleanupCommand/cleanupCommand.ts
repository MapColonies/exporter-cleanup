import { injectable } from 'tsyringe';
import { Argv, CommandModule } from 'yargs';
import { CleanupManager } from './cleanupManager';

@injectable()
export class CleanupCommand implements CommandModule {
  public deprecated = false;
  public command = '$0';
  public describe = 'clean old files from storage';
  public aliases = ['cleanup'];

  public constructor(private readonly manager: CleanupManager) {}

  public builder = (yargs: Argv): Argv => {
    return yargs;
  };

  public handler = async (): Promise<void> => {
    await this.manager.cleanPackages();
  };
}
