import RedisCacheWorker from '@server/cache';

const assert = (input: any, result: any) => {
	const inString = JSON.stringify(input);
	const resString = JSON.stringify(result);

	console.assert(
		result && inString === resString,

		// otherwise print an assertion error
		'\n[!] Input-result values do not match:' + '\n[!] Expected:',
		inString,
		'\n[!] Received:',
		resString,
		'\n'
	);
};

interface TestUserKV {
	id: string;
	login: string;
	access: string;
}

interface TestDataKV {
	id: string;
	data: {
		following: any;
		subscriptions: any;
		recaps: any;
	};
}

async function testCacheRw() {
	// dont run this in prod
	if (!import.meta.env.DEV) {
		return;
	}

	try {
		// clear existing test data
		const worker = new RedisCacheWorker({});
		const userExists = await worker.readUser<TestUserKV>('01234');
		const dataExists = await worker.readData<TestDataKV>('01234');

		if (userExists || dataExists) {
			await worker.delete('01234');
		}

		// user worker cache read/write
		const testUser = { id: '01234', login: 'pls_uwu', access: '00000000' };
		await worker.writeUser<TestUserKV>('01234', testUser);
		const userRes = (await worker.readUser('01234')) as TestUserKV;

		assert(testUser, userRes);

		// data worker cache read/write test
		const following = [
			{ broadcaster_id: '01235', broadcaster_name: 'kori' },
			{ broadcaster_id: '01236', broadcaster_name: 'khiren' },
			{ broadcaster_id: '01237', broadcaster_name: 'kitaarias' },
		];
		const subscriptions = [
			{ broadcaster_id: '01235', broadcaster_name: 'kori' },
		];
		const recaps = [
			{
				broadcaster_id: '01235',
				minutes_watched: '1',
				chats_sent: '4294967296',
			},
		];

		const testData: TestDataKV = {
			id: '01234',
			data: {
				following,
				subscriptions,
				recaps,
			},
		};

		await worker.writeData<TestDataKV>('01234', testData);
		const dataRes = await worker.readData<TestDataKV>('01234');

		assert(testData, dataRes);

		worker.close();
	} catch (err) {
		console.error('[!] Error thrown during cache testing:', err);
	}
}

export { testCacheRw };
