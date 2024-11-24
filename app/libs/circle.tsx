'use client'

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { Configs, LoginCompleteCallback, SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const getConfig = (): Configs => {
  return {
    appSettings: {
      appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '',
    },
  }
}

const initializeSdk = (
  onLoginComplete: LoginCompleteCallback,
) => {
  const w = new W3SSdk(getConfig(), onLoginComplete)
  return w
}

export const CircleSdkProviderContext = createContext({
  sdk: undefined as W3SSdk | undefined,
    login: () => {},
})

let webSdk: W3SSdk

export const CircleSdkProvider = ({ children }: {
    children: React.ReactNode
}) => {
  const [sdk, setSdk] = useState<W3SSdk|undefined>(webSdk)

  const onLoginComplete = useCallback((...args: Parameters<LoginCompleteCallback>) => {
      console.log("onLoginComplete", args)
    },
    [],
  )

  useEffect(() => {
    const sdk = initializeSdk(onLoginComplete)
    if (sdk) {
      webSdk = sdk
      setSdk(webSdk)
    }
    console.log("sdk", sdk)
  }, [setSdk, onLoginComplete])

  const login = useCallback(async () => {
    if (!sdk) return console.error('SDK is not ready')
    
    // generate device id    
    const deviceId = await sdk.getDeviceId()
    
    // generate social login from device id
    // in backend "/circle/create-device-token-for-social-login"
    // func: initiateUserControlledWalletsClient({ apiKey: 'xx' }).createDeviceTokenForSocialLogin({ deviceId: req.body.deviceId })
    const req = await fetch('http://localhost:3002/api/circle/create-device-token-for-social-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            deviceId,
        }),
    })
    const res = await req.json() as {
        data: {
            deviceEncryptionKey: string,
            deviceToken: string,
        }
    }

    // update configs to apply device token
    sdk.updateConfigs({
        appSettings: {
            appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '',
        },
        loginConfigs: {
            google: {
                clientId: process.env.NEXT_PUBLIC_CIRCLE_GOOGLE_KEY || '',
                redirectUri: window.location.origin,
            },
            deviceToken: res.data.deviceToken,
            deviceEncryptionKey: res.data.deviceEncryptionKey,
        }
    }, onLoginComplete)

    // execute login
    sdk.performLogin(SocialLoginProvider.GOOGLE)
  }, [sdk, onLoginComplete])

  const contextValues = useMemo(() => ({
    sdk,
    login,
  }), [
    sdk,
    login,
  ])

  return <CircleSdkProviderContext.Provider value={contextValues}>{children}</CircleSdkProviderContext.Provider>
}

export const useCircleSdk = () => {
  const context = useContext(CircleSdkProviderContext)
  if (!context) {
    throw new Error('useCircleSdk must be used within a CircleSdkProviderContext')
  }
  return context
}