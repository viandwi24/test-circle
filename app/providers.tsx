'use client'

import { CircleSdkProvider } from './libs/circle'

export default function AppProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CircleSdkProvider>
            {children}
        </CircleSdkProvider>
    )
}
