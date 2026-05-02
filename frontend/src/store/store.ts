import {
	Action,
	combineReducers,
	configureStore,
	ThunkAction,
} from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';

import { apiSlice } from './features/api/apiSlice';

const stripUnsupported = (value: unknown): unknown => {
	if (typeof File !== 'undefined' && value instanceof File) return undefined;
	if (typeof Blob !== 'undefined' && value instanceof Blob) return undefined;
	if (value instanceof ArrayBuffer) return undefined;
	if (value instanceof Date) return value.toISOString();
	if (value instanceof Set) return Array.from(value);
	if (value instanceof Map) return Object.fromEntries(value);
	if (typeof value === 'function') return undefined;
	if (Array.isArray(value)) {
		return value
			.map((item) => stripUnsupported(item))
			.filter((item) => item !== undefined);
	}
	if (value && typeof value === 'object') {
		return Object.entries(value as Record<string, unknown>).reduce(
			(acc, [key, val]) => {
				const sanitized = stripUnsupported(val);
				if (sanitized !== undefined) acc[key] = sanitized;
				return acc;
			},
			{} as Record<string, unknown>,
		);
	}
	return value;
};

const rootReducer = combineReducers({
	counter: counterReducer,
	[apiSlice.reducerPath]: apiSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
	const store = configureStore({
		reducer: rootReducer,
		devTools: process.env.NODE_ENV !== 'production',

		middleware: (getDefaultMiddleware) => {
			return getDefaultMiddleware({
				serializableCheck: false,
			}).concat(apiSlice.middleware);
		},
	});

	return store;
};

export type AppStore = ReturnType<typeof makeStore>;

export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
	ThunkReturnType,
	RootState,
	unknown,
	Action
>;
