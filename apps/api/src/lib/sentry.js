const noop = () => {};

const sentryFacade = {
  init: noop,
  captureException: noop
};

let sdkPromise;

function loadSdk() {
  if (!sdkPromise) {
    sdkPromise = import("@sentry/node")
      .then((sdk) => {
        sentryFacade.init = sdk.init;
        sentryFacade.captureException = sdk.captureException;
        return sdk;
      })
      .catch(() => null);
  }

  return sdkPromise;
}

export const Sentry = {
  init(options) {
    if (process.env.NODE_ENV === "test") return;
    loadSdk().then((sdk) => {
      if (sdk) {
        sdk.init(options);
      }
    });
  },
  captureException(error) {
    sentryFacade.captureException(error);
  }
};
