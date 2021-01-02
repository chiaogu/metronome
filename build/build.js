import esbuild from 'esbuild';
import { buildOptions, prebuild } from './shared.js'; 

(async () => {
  await prebuild();
  await esbuild.build({
    ...buildOptions,
    minify: true,
  }); 
})();