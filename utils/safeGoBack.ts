// utils/safeGoBack.ts
// Tránh lỗi React Navigation: The action 'GO_BACK' was not handled by any navigator

type BackCapableRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: '/(app)') => void;
};

export function safeGoBack(router: BackCapableRouter) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)');
}
