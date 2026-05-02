'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { decrement, increment } from './counterSlice';

export function Counter() {
	// The `state` arg is correctly typed as `RootState` already
	const count = useAppSelector((state) => state.counter.value);
	const dispatch = useAppDispatch();

	return (
		<div className="text-center">
			<p className="text-9xl text-blue-500">{count}</p>
			<div className="flex gap-4">
				<button
					className="text-green-500 font-bold border border-green-500 px-4 py-2 rounded-lg"
					onClick={() => dispatch(increment())}
				>
					Increment
				</button>
				<button
					className="text-red-500 font-bold border border-red-500 px-4 py-2 rounded-lg"
					onClick={() => dispatch(decrement())}
				>
					Increment
				</button>
			</div>
		</div>
	);
}
