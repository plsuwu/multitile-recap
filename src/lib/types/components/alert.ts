export type AlertProps = {
	id: string;
    alertType: 'error' | 'sync';
	title: string;
	message: string;
	status: number;
};
