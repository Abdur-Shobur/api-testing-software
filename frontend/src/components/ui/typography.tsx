import { cn } from '@/lib/utils';
import React from 'react';

function TypographyH1({
	children,
	className,
	...props
}: React.ComponentProps<'h1'>) {
	return (
		<h1
			{...props}
			className={cn(
				'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
				className,
			)}
		>
			{children}
		</h1>
	);
}

function TypographyH2({
	children,
	className,
	...props
}: React.ComponentProps<'h2'>) {
	return (
		<h2
			className={cn(
				'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
				className,
			)}
			{...props}
		>
			{children}
		</h2>
	);
}

function TypographyH3({
	children,
	className,
	...props
}: React.ComponentProps<'h3'>) {
	return (
		<h3
			className={cn(
				'scroll-m-20 text-2xl font-semibold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h3>
	);
}

function TypographyH4({
	children,
	className,
	...props
}: React.ComponentProps<'h4'>) {
	return (
		<h4
			className={cn(
				'scroll-m-20 text-xl font-semibold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h4>
	);
}

function TypographyBlockquote({
	children,
	className,
	...props
}: React.ComponentProps<'blockquote'>) {
	return (
		<blockquote
			className={cn('mt-6 border-l-2 pl-6 italic', className)}
			{...props}
		>
			{children}
		</blockquote>
	);
}

function TypographyList({
	children,
	className,
	...props
}: React.ComponentProps<'ul'>) {
	return (
		<ul className={cn(className)} {...props}>
			{children}
		</ul>
	);
}

function TypographyLead({
	children,
	className,
	...props
}: React.ComponentProps<'p'>) {
	return (
		<p className={cn('text-xl text-muted-foreground', className)} {...props}>
			{children}
		</p>
	);
}

function TypographyMuted({
	children,
	className,
	...props
}: React.ComponentProps<'p'>) {
	return (
		<p className={cn('text-sm text-muted-foreground', className)} {...props}>
			{children}
		</p>
	);
}

export {
	TypographyBlockquote,
	TypographyH1,
	TypographyH2,
	TypographyH3,
	TypographyH4,
	TypographyLead,
	TypographyList,
	TypographyMuted,
};
