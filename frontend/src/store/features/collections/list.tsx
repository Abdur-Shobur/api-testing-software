'use client';
import { Loader5, Loader8 } from '@/components/dashboard';
import { Pagination1 } from '@/components/dashboard/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { badgeFormat, env, ErrorAlert, tableSrCount, textCount } from '@/lib';
import Link from 'next/link';
import { useState } from 'react';
import { useAdminViewBrandQuery } from './brand.api.slice';
import { BrandDelete } from './delete';
import { BrandEdit } from './edit';

export function BrandTable() {
	const [page, setPage] = useState(1);
	const {
		data: brands,
		isFetching,
		isLoading,
		isError,
	} = useAdminViewBrandQuery({ page });

	if (isError) {
		return <ErrorAlert />;
	}

	if (isLoading) {
		return (
			<>
				<Loader5 />
				<Loader5 />
				<Loader5 />
				<Loader5 />
			</>
		);
	}
	return (
		<div>
			<>
				<div className="border rounded-lg relative">
					{isFetching && <Loader8 />}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="bg-stone-100">#SL.</TableHead>
								<TableHead className="bg-stone-100">Profile </TableHead>
								<TableHead className="bg-stone-100">Name </TableHead>
								<TableHead className="bg-stone-100">Status </TableHead>
								<TableHead className="bg-stone-100">Action </TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{brands?.message?.data?.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-muted-foreground"
									>
										No Brand found matching your criteria
									</TableCell>
								</TableRow>
							) : (
								brands?.message.data?.map((category, i) => (
									<TableRow key={category.id}>
										<TableCell className="py-2 pl-4">
											{tableSrCount(page, i)}
										</TableCell>
										<TableCell className="py-2">
											<Link href={`/admin/users/${category.id}`}>
												<Avatar className="h-12 w-12 rounded-xl">
													<AvatarImage
														src={env.baseAPI + '/' + category.image}
														alt={category.name}
													/>
													<AvatarFallback className="rounded-xl bg-sky-100">
														{category.name.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
											</Link>
										</TableCell>

										<TableCell className="py-2">
											{textCount(category.name, 25)}
										</TableCell>

										<TableCell className="py-2">
											<Badge
												className="capitalize"
												variant={badgeFormat(category.status)}
											>
												{category.status}
											</Badge>
										</TableCell>
										<TableCell className="py-2 space-x-2">
											<BrandEdit editData={category} />
											<BrandDelete data={category} />
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
				{brands?.message && (
					<Pagination1 pagination={brands?.message} setPage={setPage} />
				)}
			</>
		</div>
	);
}
