import './polyfills';

// import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { NgModuleRef } from '@angular/core';

interface Window {
  ngRef: NgModuleRef<AppModule>;
}
declare var window:Window;

platformBrowserDynamic().bootstrapModule(AppModule)
 .then((ref: NgModuleRef<AppModule>) => {
    // Ensure Angular destroys itself on hot reloads.
    if (window['ngRef']) {
      window['ngRef'].destroy();
    }
    window['ngRef'] = ref;
  })
  // Otherwise, log the boot error
  .catch(err => console.error(err));