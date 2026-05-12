import 'dotenv/config';
import { app } from './app';
import mongoose from 'mongoose';

const PORT = Number(process.env.PORT ?? 4000);
const MONGODB_URI =
	process.env.MONGODB_URI ?? 'mongodb://localhost:27017/api-test-runner';

async function bootstrap() {
	await mongoose.connect(MONGODB_URI);
	console.log(`Connected to MongoDB: ${MONGODB_URI}`);

	app.listen(PORT, () => {
		console.log(`\nAPI Test Runner listening on http://localhost:${PORT}`);
		console.log(`   Health check: GET  http://localhost:${PORT}/health`);
		console.log(`   Collections:  GET  http://localhost:${PORT}/collections`);
		console.log(
			`   Run suite:    POST http://localhost:${PORT}/run/:collectionId\n`,
		);
	});
}

bootstrap().catch((error) => {
	console.error('Failed to start server', error);
	process.exit(1);
});
