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
import { toast } from 'sonner';
import { useCreateCollectionMutation } from './api-slice';

// --- Zod Schema ---
export const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
});

export type ZodType = z.infer<typeof schema>;

export function Create({
	setOpen,
	parentId,
	projectId,
}: {
	setOpen?: iState<boolean>;
	parentId?: string | null;
	projectId?: string | null;
}) {
	const [store, { isLoading }] = useCreateCollectionMutation();

	const form = useForm<ZodType>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const onSubmit = async (data: ZodType) => {
		if (!projectId?.trim()) {
			toast.error('Select a project in the sidebar before creating a collection.');
			return;
		}
		try {
			const response = await store({
				...data,
				parentId,
				projectId,
			}).unwrap();

			if (response.success) {
				if (setOpen) {
					setOpen(false);
				}
				toast.success('Create success');
			} else {
				toast.error('Create failed');
			}
		} catch (error: any) {
			if (error) {
				toast.error('Create failed');
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
						{isLoading ? 'Creating...' : 'Create Collection'}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
