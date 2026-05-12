"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTestCase = runTestCase;
const axios_1 = __importDefault(require("axios"));
function replaceEnvVars(value, env) {
    return value.replace(/\{\{([A-Z0-9_]+)\}\}/gi, (_match, key) => {
        return env[key] ?? env[key.toUpperCase()] ?? '';
    });
}
function substituteRequestEnv(request, env) {
    return {
        ...request,
        url: replaceEnvVars(request.url, env),
        headers: request.headers.map((header) => ({
            ...header,
            value: replaceEnvVars(header.value, env),
        })),
        queryParams: request.queryParams.map((param) => ({
            ...param,
            value: replaceEnvVars(param.value, env),
        })),
        body: request.body
            ? {
                ...request.body,
                content: replaceEnvVars(request.body.content, env),
            }
            : request.body,
    };
}
function tryParseJson(raw) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return raw;
    }
}
function toActiveMap(pairs) {
    return pairs
        .filter((p) => p.enabled)
        .reduce((acc, p) => {
        acc[p.key] = p.value;
        return acc;
    }, {});
}
function dot(obj, path) {
    return path.split('.').reduce((cur, key) => {
        if (cur != null && typeof cur === 'object') {
            return cur[key];
        }
        return undefined;
    }, obj);
}
// ─── Assertions ──────────────────────────────────────────────────────────────
function assertStatus(expected, actual) {
    const pass = expected === actual;
    return {
        field: 'status',
        status: pass ? 'pass' : 'fail',
        expected,
        actual,
        message: pass
            ? `Status ${actual} matches expected ${expected}`
            : `Expected status ${expected} but got ${actual}`,
    };
}
function assertHeaders(expected, actual) {
    return expected
        .filter((h) => h.enabled)
        .map((h) => {
        const actualVal = actual[h.key.toLowerCase()];
        const pass = actualVal !== undefined &&
            actualVal.toLowerCase().includes(h.value.toLowerCase());
        return {
            field: `headers.${h.key.toLowerCase()}`,
            status: (pass ? 'pass' : 'fail'),
            expected: h.value,
            actual: actualVal ?? null,
            message: pass
                ? `Header "${h.key}" matches`
                : `Header "${h.key}": expected "${h.value}", got "${actualVal ?? 'missing'}"`,
        };
    });
}
function deepContains(actual, expected, path = '') {
    const results = [];
    if (expected === null || expected === undefined)
        return results;
    if (typeof expected !== 'object' || Array.isArray(expected)) {
        const pass = JSON.stringify(actual) === JSON.stringify(expected);
        results.push({
            field: `body${path ? '.' + path : ''}`,
            status: pass ? 'pass' : 'fail',
            expected,
            actual,
            message: pass
                ? `Value matches`
                : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        });
        return results;
    }
    for (const key of Object.keys(expected)) {
        const newPath = path ? `${path}.${key}` : key;
        const expVal = expected[key];
        const actVal = actual && typeof actual === 'object'
            ? actual[key]
            : undefined;
        results.push(...deepContains(actVal, expVal, newPath));
    }
    return results;
}
// function deepContains(
// 	actual: unknown,
// 	expected: unknown,
// 	path = '',
// ): AssertionResult[] {
// 	const results: AssertionResult[] = [];
// 	if (expected === null || expected === undefined) return results;
// 	console.log({ actual, expected });
// 	if (typeof expected !== 'object' || Array.isArray(expected)) {
// 		const pass = JSON.stringify(actual) === JSON.stringify(expected);
// 		results.push({
// 			field: `body${path ? '.' + path : ''}`,
// 			status: pass ? 'pass' : 'fail',
// 			expected,
// 			actual,
// 			message: pass
// 				? `Value matches`
// 				: `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
// 		});
// 		return results;
// 	}
// 	for (const key of Object.keys(expected as object)) {
// 		const newPath = path ? `${path}.${key}` : key;
// 		const expVal = (expected as Record<string, unknown>)[key];
// 		const actVal = dot(actual, newPath);
// 		results.push(...deepContains(actVal, expVal, newPath));
// 	}
// 	return results;
// }
function assertBodyExact(expected, actual) {
    const pass = JSON.stringify(expected) === JSON.stringify(actual);
    return {
        field: 'body',
        status: pass ? 'pass' : 'fail',
        expected,
        actual,
        message: pass ? 'Body matches exactly' : 'Body does not match exactly',
    };
}
function assertBodySchema(expected, actual, path = '') {
    const results = [];
    if (typeof expected !== 'object' || expected === null) {
        const typeMatch = typeof actual === typeof expected;
        results.push({
            field: `body${path ? '.' + path : ''}`,
            status: typeMatch ? 'pass' : 'fail',
            expected: typeof expected,
            actual: typeof actual,
            message: typeMatch
                ? `Type matches (${typeof expected})`
                : `Type mismatch: expected ${typeof expected}, got ${typeof actual}`,
        });
        return results;
    }
    for (const key of Object.keys(expected)) {
        const newPath = path ? `${path}.${key}` : key;
        const expVal = expected[key];
        const actVal = dot(actual, newPath);
        results.push(...assertBodySchema(expVal, actVal, newPath));
    }
    return results;
}
function assertBody(mode, expectedRaw, actual) {
    if (mode === 'ignore') {
        return [
            {
                field: 'body',
                status: 'skip',
                expected: null,
                actual: null,
                message: 'Body check skipped',
            },
        ];
    }
    const expected = tryParseJson(expectedRaw);
    switch (mode) {
        case 'exact':
            return [assertBodyExact(expected, actual)];
        case 'contains':
            return deepContains(actual, expected);
        case 'schema':
            return assertBodySchema(expected, actual);
        default:
            return [];
    }
}
// ─── Runner ──────────────────────────────────────────────────────────────────
async function runTestCase(testCase, env = {}) {
    const request = substituteRequestEnv(testCase.request, env);
    const { expectedResponse } = testCase;
    const startTime = Date.now();
    // Build axios config
    const headers = toActiveMap(request.headers);
    const params = toActiveMap(request.queryParams);
    let data;
    if (request.body && request.body.type !== 'none') {
        if (request.body.type === 'json') {
            data = tryParseJson(request.body.content);
            if (!headers['content-type'])
                headers['content-type'] = 'application/json';
        }
        else {
            data = request.body.content;
        }
    }
    let response = null;
    let errorMessage;
    try {
        response = await (0, axios_1.default)({
            method: request.method,
            url: request.url,
            headers,
            params,
            data,
            timeout: request.timeoutMs ?? 10000,
            validateStatus: () => true, // never throw on HTTP error status
        });
    }
    catch (err) {
        if (err?.code === 'ECONNREFUSED') {
            errorMessage = 'Connection refused';
        }
        else {
            errorMessage = err instanceof Error ? err.message : String(err);
        }
    }
    const durationMs = Date.now() - startTime;
    if (!response) {
        return {
            testCaseId: testCase.id,
            testCaseName: testCase.name,
            status: 'error',
            durationMs,
            request: { method: request.method, url: request.url },
            actual: null,
            assertions: [],
            error: errorMessage,
        };
    }
    // Normalise actual response
    const actualHeaders = {};
    for (const [k, v] of Object.entries(response.headers)) {
        actualHeaders[k.toLowerCase()] = Array.isArray(v)
            ? v.join(', ')
            : String(v);
    }
    let actualBody = response.data;
    if (typeof actualBody === 'string')
        actualBody = tryParseJson(actualBody);
    // Run assertions
    const assertions = [];
    if (expectedResponse.status !== undefined) {
        assertions.push(assertStatus(expectedResponse.status, response.status));
    }
    if (expectedResponse.headers && expectedResponse.headers.length > 0) {
        assertions.push(...assertHeaders(expectedResponse.headers, actualHeaders));
    }
    if (expectedResponse.body) {
        assertions.push(...assertBody(expectedResponse.body.mode, expectedResponse.body.content, actualBody));
    }
    const hasFail = assertions.some((a) => a.status === 'fail');
    const status = hasFail ? 'fail' : 'pass';
    return {
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        status,
        durationMs,
        request: { method: request.method, url: request.url },
        actual: {
            status: response.status,
            headers: actualHeaders,
            body: actualBody,
        },
        assertions,
    };
}
//# sourceMappingURL=index.js.map