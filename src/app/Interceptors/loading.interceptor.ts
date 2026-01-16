import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../services/loader.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // 1. Check for the 'load' parameter. Default is true if not provided.
  const shouldLoad = req.params.get('load') !== 'false';

  if (!shouldLoad) {
    // 2. If load=false, remove the param so the backend doesn't see it and skip logic
    const cleanReq = req.clone({ params: req.params.delete('load') });
    return next(cleanReq);
  }

  // 3. Otherwise, show the loader
  loadingService.show();

  // 4. Remove the 'load' param before sending to server (optional but recommended)
  const finalReq = req.clone({ params: req.params.delete('load') });

  return next(finalReq).pipe(
    finalize(() => loadingService.hide()) // Hide when request completes or fails
  );
};