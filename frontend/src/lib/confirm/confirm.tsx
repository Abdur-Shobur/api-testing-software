// import { Modal } from 'antd';

// export const alertConfirm = ({
// 	onOk,
// 	onCancel,
// 	title = 'Confirm',
// 	content = 'Are you sure you want to proceed?',
// }: {
// 	onOk: () => void;
// 	onCancel?: () => void;
// 	title?: string;
// 	content?: string;
// }) => {
// 	Modal.confirm({
// 		title,
// 		content,
// 		centered: true,
// 		onOk: () => {
// 			if (onOk) onOk();
// 		},
// 		onCancel: () => {
// 			if (onCancel) onCancel();
// 		},
// 	});
// };

'use client';

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Optional: use any spinner icon you prefer
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { cn } from '../utils';

export const alertConfirm = ({
	onOk,
	onCancel,
	title = 'Confirm',
	content = 'Are you sure you want to proceed?',
	confirmBtnText = 'Confirm',
	cancelBtnText = 'Cancel',
	className,
	clickOutSide = false,
	extraCleanup,
	extraCleanupText = 'Cancel',
}: {
	onOk: () => void | Promise<void>;
	onCancel?: () => void;
	title?: string;
	content?: string;
	confirmBtnText?: string;
	cancelBtnText?: string;
	className?: string;
	clickOutSide?: boolean;

	extraCleanup?: boolean;
	extraCleanupText?: string;
}) => {
	const div = document.createElement('div');
	document.body.appendChild(div);
	const root = ReactDOM.createRoot(div);
	const body = document.body;

	const cleanup = () => {
		body.style.pointerEvents = '';
		root.unmount();
		div.remove();
	};

	const ConfirmComponent = () => {
		const [open, setOpen] = useState(true);
		const [isLoading, setIsLoading] = useState(false);
		const contentRef = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (clickOutSide) {
				const handleClickOutside = (event: MouseEvent) => {
					if (
						contentRef.current &&
						!contentRef.current.contains(event.target as Node)
					) {
						handleCancel();
					}
				};
				document.addEventListener('mousedown', handleClickOutside);
				return () => {
					document.removeEventListener('mousedown', handleClickOutside);
				};
			}
		}, []);

		useEffect(() => {
			document.body.style.pointerEvents = open ? '' : 'none';
		}, [open]);

		const handleConfirm = async () => {
			try {
				setIsLoading(true);
				await onOk?.();
				cleanup(); // Close only after async logic finishes
			} catch (error) {
				console.error(error);
				// Optionally keep it open or show error
			} finally {
				setIsLoading(false);
			}
		};

		const handleCancel = () => {
			if (!isLoading) {
				onCancel?.();
				cleanup();
			}
		};

		return (
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent ref={contentRef} className={className}>
					<AlertDialogHeader className={cn('text-left')}>
						<AlertDialogTitle>{title}</AlertDialogTitle>
						<AlertDialogDescription>{content}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className={cn('flex-row justify-end')}>
						{extraCleanup && (
							<Button variant="destructive" type="button" onClick={cleanup}>
								{extraCleanupText}
							</Button>
						)}
						<AlertDialogCancel disabled={isLoading} onClick={handleCancel}>
							{cancelBtnText}
						</AlertDialogCancel>
						<Button onClick={handleConfirm} disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{confirmBtnText}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	root.render(<ConfirmComponent />);
};

/* How to use


 const onSubmit = async (values: any) => {
    // alertConfirm('Create', 'Are you sure?', () => {})
    
    alertConfirm({
      onOk: async () => {
        try {

          // try code 

        } catch (error) {
         
        // error code 

        }
      },

      // optional
      onCancel: () => {
      // 
       },
    })



  }

*/
