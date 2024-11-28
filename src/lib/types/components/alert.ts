export type AlertProps = {
	id: string;
    type: 'info' | 'success' | 'warning' | 'error';
	title: string;
	message: string;
};
