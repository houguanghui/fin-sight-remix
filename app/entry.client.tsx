import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs'
import { StyleSheetManager, ThemeProvider } from 'styled-components'
import { ConfigProvider } from "antd/lib";

async function prepareApp() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser')
    return worker.start()
  }

  return Promise.resolve()
}
// async function prepareApp() {
//   const { worker } = await import('./mocks/browser')
//   return worker.start()
// }

prepareApp().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StyleSheetManager>
          <ThemeProvider theme={{}}>
            <StyleProvider transformers={[legacyLogicalPropertiesTransformer]}>
              <ConfigProvider>
                <HydratedRouter/>
              </ConfigProvider>
            </StyleProvider>
          </ThemeProvider>
        </StyleSheetManager>
      </StrictMode>,
    );
  });
})