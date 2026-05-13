'use client';

import { DialogFooter } from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { iState } from '@/type';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUpdateCollectionMutation } from './api-slice';
import { Collection } from './type';

// --- Zod Schema ---
export const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
});

export type ZodType = z.infer<typeof schema>;

export function Edit({
	setOpen,
	data,
}: {
	setOpen?: iState<boolean>;
	data: Collection;
}) {
	const [store, { isLoading }] = useUpdateCollectionMutation();

	const form = useForm<ZodType>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: data.name || '',
			description: data.description || '',
		},
	});

	useEffect(() => {
		form.reset({
			name: data.name || '',
			description: data.description || '',
		});
	}, [data]);

	const onSubmit = async (iData: ZodType) => {
		try {
			const response = await store({
				id: data.id,
				body: iData,
			}).unwrap();

			if (response.success) {
				if (setOpen) {
					setOpen(false);
				}
				toast.success('Update success');
			} else {
				toast.error('Update failed');
			}
		} catch (error: any) {
			if (error) {
				toast.error('Update failed');
			} else {
				toast.error('Something went wrong');
			}
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} placeholder="EX: Category, Brand..." />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* Name */}
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea {...field} placeholder="Ex: Product Category..." />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button type="submit" disabled={isLoading}>
						{isLoading && (
							<LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isLoading ? 'Updating...' : 'Edit Collection'}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
