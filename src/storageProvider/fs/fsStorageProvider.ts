import { promises as fsp} from 'fs';
import { join as pathJoin } from 'path';
import { inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import { IConfig } from '../../common/interfaces';
import { IStorageProvider } from '../iStorageProvider';

export class FsStorageProvider implements IStorageProvider{
  private readonly basePath: string;
  public constructor(@inject(SERVICES.CONFIG) private readonly config: IConfig){
    this.basePath = pathJoin(config.get('fs.mountDir'),config.get('fs.subPath'));
  };

   public async delete(path: string):Promise<void>{
    const fullPath = pathJoin(this.basePath,path);
    try{
      await fsp.unlink(fullPath);
    } catch(err){
      const error = err as NodeJS.ErrnoException;
      //ignore file not found error
      if(error.code !== 'ENOENT'){
        throw error;
      }
    }
   }

}
