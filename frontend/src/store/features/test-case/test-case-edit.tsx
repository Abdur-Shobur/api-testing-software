'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
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
import { toast } from 'sonner';

import KeyValueEditor from '@/components/ui/key-value-editor';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ArrowDown, ArrowUp, BookCheck, FileText } from 'lucide-react';
const methodColor: Record<string, string> = {
	GET: '#4fffb0',
	POST: '#00d4ff',
	PUT: '#ffb347',
	PATCH: '#c87fff',
	DELETE: '#ff4f6b',
	HEAD: '#7fc8ff',
	OPTIONS: '#aaa',
};
// ==================
// ✅ Schema
// ==================
const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),

	request: z.object({
		method: z.enum(METHODS),
		url: z.string().min(1, 'URL is required'),
		timeoutMs: z.number(),

		headers: z.array(
			z.object({
				key: z.string(),
				value: z.string(),
				enabled: z.boolean(),
			}),
		),

		queryParams: z.array(
			z.object({
				key: z.string(),
				value: z.string(),
				enabled: z.boolean(),
			}),
		),

		body: z.object({
			type: z.enum(['none', 'json', 'form', 'text']),
			content: z.string(),
		}),
	}),

	expectedResponse: z.object({
		status: z.number(),

		headers: z.array(
			z.object({
				key: z.string(),
				value: z.string(),
				enabled: z.boolean(),
			}),
		),

		body: z.object({
			mode: z.enum(['exact', 'contains', 'schema', 'ignore']),
			content: z.string(),
		}),
	}),
});

import { iState, METHODS } from '@/type';
import { useEffect } from 'react';
import { useUpdateTestCaseMutation } from './test-case-api-slice';
import { iTestCase } from './type';

export type ZodType = z.infer<typeof schema>;

export function Edit({
	setOpen,
	data,
	colId,
}: {
	setOpen?: iState<boolean>;
	data: iTestCase;
	colId: string;
}) {
	const [update, { isLoading }] = useUpdateTestCaseMutation();
	const [tab, setTab] = useState<'request' | 'expected'>('request');
	const [mode, setMode] = useState<'params' | 'headers' | 'body'>('params');

	const form = useForm<ZodType>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: data.name ?? '',
			description: data.description ?? '',

			request: {
				method: data.request?.method ?? 'GET',
				url: data.request?.url ?? '',
				timeoutMs: data.request?.timeoutMs ?? 10000,
				headers: data.request?.headers ?? [],
				queryParams: data.request?.queryParams ?? [],
				body: {
					type: data.request?.body?.type ?? 'none',
					content: data.request?.body?.content ?? '',
				},
			},

			expectedResponse: {
				status: data.expectedResponse?.status ?? 200,
				headers: data.expectedResponse?.headers ?? [],
				body: {
					mode: (data.expectedResponse?.body?.mode as any) ?? 'contains',
					content: data.expectedResponse?.body?.content ?? '{}',
				},
			},
		},
	});
	const methodWatch = form.watch('request.method');
	const reqBodyTab = form.watch('request.body.type'); // reqBodyTab, setReqBodyTab
	const bodyTab = form.watch('expectedResponse.body.mode'); // bodyTab, setBodyTab

	useEffect(() => {
		form.reset({
			name: data.name ?? '',
			description: data.description ?? '',

			request: {
				method: data.request?.method ?? 'GET',
				url: data.request?.url ?? '',
				timeoutMs: data.request?.timeoutMs ?? 10000,
				headers: data.request?.headers ?? [],
				queryParams: data.request?.queryParams ?? [],
				body: {
					type: data.request?.body?.type ?? 'none',
					content: data.request?.body?.content ?? '',
				},
			},

			expectedResponse: {
				status: data.expectedResponse?.status ?? 200,
				headers: data.expectedResponse?.headers ?? [],
				body: {
					mode: (data.expectedResponse?.body?.mode as any) ?? 'contains',
					content: data.expectedResponse?.body?.content ?? '{}',
				},
			},
		});
	}, [data]);

	const onSubmit = async (iData: ZodType) => {
		if (!colId) {
			toast.error('Collection ID not found');
			return;
		}
		if (!data.id) {
			toast.error('Test ID not found');
			return;
		}
		try {
			const response = await update({
				colId,
				testId: data.id,
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
				{/* ================= BASIC INFO ================= */}
				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Test Name *</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Get user by ID" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Test Description</FormLabel>
								<FormControl>
									<Input {...field} placeholder="Optional notes" />
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				{/* ================= TABS ================= */}
				<div className="flex gap-2 border-b pb-2">
					<Button
						variant={tab === 'request' ? 'outline' : 'ghost'}
						size="sm"
						type="button"
						onClick={() => setTab('request')}
					>
						<ArrowUp className="size-3" />
						Request
					</Button>
					<Button
						variant={tab === 'expected' ? 'outline' : 'ghost'}
						size="sm"
						type="button"
						onClick={() => setTab('expected')}
					>
						<ArrowDown className="size-3" />
						Expected Response
					</Button>
				</div>

				{/* ================= REQUEST ================= */}
				{tab === 'request' && (
					<div className="space-y-4">
						{/* Method + URL */}
						<div className="flex gap-2">
							<FormField
								control={form.control}
								name="request.method"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger
											className={`text-[${methodColor[methodWatch]}]`}
											style={{ color: methodColor[methodWatch] }}
										>
											<SelectValue placeholder={field.value} />
										</SelectTrigger>
										<SelectContent position="popper" align="start">
											{['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
												<SelectItem
													style={{ color: methodColor[m] }}
													key={m}
													value={m}
												>
													{m}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>

							<FormField
								control={form.control}
								name="request.url"
								render={({ field }) => (
									<Input
										className="w-full"
										{...field}
										placeholder="https://api..."
									/>
								)}
							/>

							<FormField
								control={form.control}
								name="request.timeoutMs"
								render={({ field }) => (
									<Input className="w-auto" type="number" {...field} />
								)}
							/>
						</div>

						{/* ================= TABS ================= */}
						<div className="flex gap-2 border-b pb-2">
							<Button
								variant={mode === 'params' ? 'outline' : 'ghost'}
								size="sm"
								type="button"
								onClick={() => setMode('params')}
							>
								<FileText className="size-3" />
								Params
							</Button>
							<Button
								variant={mode === 'headers' ? 'outline' : 'ghost'}
								size="sm"
								type="button"
								onClick={() => setMode('headers')}
							>
								<FileText className="size-3" />
								Headers
							</Button>
							<Button
								variant={mode === 'body' ? 'outline' : 'ghost'}
								size="sm"
								type="button"
								onClick={() => setMode('body')}
							>
								<FileText className="size-3" />
								Body
							</Button>
						</div>

						{/* Headers */}
						<div hidden={mode !== 'headers'}>
							<p className="text-sm text-zinc-300">Request Headers</p>
							<FormField
								control={form.control}
								name="request.headers"
								render={({ field }) => (
									<KeyValueEditor
										pairs={field.value}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>

						{/* Params */}
						<div hidden={mode !== 'params'}>
							<p className="text-sm text-zinc-300">Query Parameters</p>

							<FormField
								control={form.control}
								name="request.queryParams"
								render={({ field }) => (
									<KeyValueEditor
										pairs={field.value}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>

						{/* Body */}
						<div hidden={mode !== 'body'}>
							<div className="flex items-center gap-2 mb-3">
								<p className="text-sm text-zinc-300">Body type:</p>
								<div className="flex gap-2">
									<Button
										variant={reqBodyTab === 'none' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() => form.setValue('request.body.type', 'none')}
									>
										<BookCheck className="size-3" />
										none
									</Button>
									<Button
										variant={reqBodyTab === 'json' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() => form.setValue('request.body.type', 'json')}
									>
										<BookCheck className="size-3" />
										json
									</Button>
									<Button
										variant={reqBodyTab === 'form' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() => form.setValue('request.body.type', 'form')}
									>
										<BookCheck className="size-3" />
										form
									</Button>
									<Button
										variant={reqBodyTab === 'text' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() => form.setValue('request.body.type', 'text')}
									>
										<BookCheck className="size-3" />
										text
									</Button>
								</div>
							</div>

							<div hidden={reqBodyTab === 'none'} className="space-y-2">
								<FormField
									control={form.control}
									name="request.body.content"
									render={({ field }) => (
										<Textarea
											{...field}
											placeholder={
												reqBodyTab === 'json'
													? '{\n  "key": "value"\n}'
													: 'Request body'
											}
										/>
									)}
								/>
							</div>
						</div>
					</div>
				)}

				{/* ================= EXPECTED ================= */}
				{tab === 'expected' && (
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="expectedResponse.status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Expected Status</FormLabel>
									<FormControl>
										<Input type="number" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="space-y-1.5">
							<p className="text-sm text-zinc-300">Expected Headers</p>
							<FormField
								control={form.control}
								name="expectedResponse.headers"
								render={({ field }) => (
									<KeyValueEditor
										pairs={field.value}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>

						{/* Body */}
						<div>
							<div className="flex items-center gap-2 mb-3">
								<p className="text-sm text-zinc-300">Body type:</p>
								<div className="flex gap-2">
									<Button
										variant={bodyTab === 'contains' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() =>
											form.setValue('expectedResponse.body.mode', 'contains')
										}
									>
										<BookCheck className="size-3" />
										Contains
									</Button>
									<Button
										variant={bodyTab === 'exact' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() =>
											form.setValue('expectedResponse.body.mode', 'exact')
										}
									>
										<BookCheck className="size-3" />
										Exact
									</Button>
									<Button
										variant={bodyTab === 'schema' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() =>
											form.setValue('expectedResponse.body.mode', 'schema')
										}
									>
										<BookCheck className="size-3" />
										Schema
									</Button>
									<Button
										variant={bodyTab === 'ignore' ? 'outline' : 'ghost'}
										size="sm"
										type="button"
										onClick={() =>
											form.setValue('expectedResponse.body.mode', 'ignore')
										}
									>
										<BookCheck className="size-3" />
										Ignore
									</Button>
								</div>
							</div>

							<div hidden={bodyTab === 'ignore'} className="space-y-2">
								<FormField
									control={form.control}
									name="expectedResponse.body.content"
									render={({ field }) => (
										<Textarea {...field} placeholder="Expected..." />
									)}
								/>
								{bodyTab === 'contains' && (
									<p className="text-sm text-zinc-300">
										Actual body must contain all keys/values from expected
									</p>
								)}
								{bodyTab === 'exact' && (
									<p className="text-sm text-zinc-300">
										Actual body must deep-equal expected
									</p>
								)}
								{bodyTab === 'schema' && (
									<p className="text-sm text-zinc-300">
										{' '}
										Actual body must have the same keys and value types
									</p>
								)}
								{bodyTab === 'ignore' && (
									<p className="text-sm text-zinc-300"> Body is not checked</p>
								)}
							</div>
						</div>
					</div>
				)}

				{/* ================= ACTIONS ================= */}
				<DialogFooter>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? 'Updating...' : 'Update Test Case'}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
