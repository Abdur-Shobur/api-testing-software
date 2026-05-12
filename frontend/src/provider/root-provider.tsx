'use client';
import { setupListeners } from '@reduxjs/toolkit/query';

import { AuthGuard } from '@/components/AuthGuard';
import { AppStore, makeStore } from '@/store';
import React, { useEffect, useMemo, useRef } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
export const RootProviders = ({ children }: { children: React.ReactNode }) => {
	const storeRef = useRef<AppStore | null>(null);

	if (!storeRef.current) {
		// Create the store instance the first time this renders
		storeRef.current = makeStore();
	}

	useEffect(() => {
		if (storeRef.current != null) {
			// configure listeners using the provided defaults
			// optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
			const unsubscribe = setupListeners(storeRef.current.dispatch);
			return unsubscribe;
		}
	}, []);

	const contextValue = useMemo(() => ({ name: 'Ant Design' }), []);

	return (
		<Context.Provider value={contextValue}>
			<Toaster richColors position="top-right" />
			<Provider store={storeRef.current}>
				<AuthGuard>{children}</AuthGuard>
			</Provider>
		</Context.Provider>
	);
};

const Context = React.createContext({ name: 'Default' });
