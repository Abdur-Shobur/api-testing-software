import { app } from './app';

const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
	console.log(`\n🚀  API Test Runner listening on http://localhost:${PORT}`);
	console.log(`   Health check: GET  http://localhost:${PORT}/health`);
	console.log(`   Collections:  GET  http://localhost:${PORT}/collections`);
	console.log(
		`   Run suite:    POST http://localhost:${PORT}/run/:collectionId\n`,
	);
});
