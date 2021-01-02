import esbuild from 'esbuild';
import server from 'live-server';
import chokidar from 'chokidar';
import {
  SRC_PATH,
  buildOptions,
  prebuild,
} from './shared.js'; 

(async () => {
  await prebuild();
  const { rebuild } = await esbuild.build({
    ...buildOptions,
    incremental: true,
  }); 
  
  chokidar
    .watch(`${SRC_PATH}/**/*.{ts,tsx}`, { ignoreInitial: true })
    .on('all', rebuild);
    
  server.start({ root: 'dist' });
})();