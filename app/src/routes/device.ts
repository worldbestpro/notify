import { Request, Router } from 'itty-router';
import { checkDevice } from '../logic/device/check';
import { create } from '../logic/device/create';
import { deleteDevice } from '../logic/device/delete';
import { update } from '../logic/device/update';
import { authFactory } from '../middleware/auth';
import { failure, success } from '../types/apiresponse';
import type { WebPushInfos } from '../webpush/webpushinfos';

export const deviceRouter = Router({ base: '/api/device' });

deviceRouter.post('/', authFactory(SERVERPWD),
    async (request: Request): Promise<Response> => {
        const { web_push_data } = await request.json?.()
            .catch(() => ({ web_push_data: {} })) as { web_push_data: Partial<WebPushInfos> };

        if (!web_push_data || !web_push_data.endpoint || !web_push_data.key || !web_push_data.auth) {
            return failure({ type: 'missing_data', message: 'missing web_push_data' }, { status: 400 });
        }

        const { endpoint, key, auth } = web_push_data;

        if (String(endpoint).length > 1024
            || String(key).length > 256
            || String(auth).length > 64) {
            return failure({ type: 'invalid_data', message: 'web_push_data member too long' }, { status: 400 });
        }

        try {
            new URL(endpoint);
        } catch (e: unknown) {
            return failure({ type: 'invalid_data', message: 'invalid endpoint' }, { status: 400 });
        }

        return await create({
            auth: String(auth),
            endpoint: String(endpoint),
            key: String(key)
        })
            .then((device) => success<{ id: string, secret: string }>({ id: device.id, secret: device.secret }))
            .catch((error: Error) => failure({ type: 'internal_error', message: error.message }));
    });


deviceRouter.get('/:device_id', /* this endpoint is not authenticated */
    async (request: Required<Request>): Promise<Response> => {
        const { device_id } = request.params as { device_id: string };
        const deviceId = String(device_id);
        if (deviceId.length !== 32) {
            return failure({ type: 'invalid_data', message: 'invalid device_id' }, { status: 400 });
        }

        // todo set auth header to device secret -> add middleware

        return await checkDevice(deviceId)
            .then((exists) => success<boolean>(exists))
            .catch((error: Error) => failure({ type: 'internal_error', message: error.message }));
    });

deviceRouter.patch('/:device_id', /* this endpoint is not authenticated */
    async (request: Required<Request>): Promise<Response> => {
        const { device_id } = request.params as { device_id: string };
        const deviceId = String(device_id);
        if (deviceId.length !== 32) {
            return failure({ type: 'invalid_data', message: 'invalid device_id' }, { status: 400 });
        }

        const { web_push_data, secret } = await request.json?.().catch(() => ({ web_push_data: {} })) as { web_push_data: Partial<WebPushInfos>, secret: string };

        if (!secret) {
            return failure({ type: 'missing_data', message: 'missing secret' }, { status: 400 });
        }

        const deviceSecret = String(secret);
        if (deviceSecret.length !== 32) {
            return failure({ type: 'invalid_data', message: 'invalid secret' }, { status: 400 });
        }

        if (!web_push_data || !web_push_data.endpoint || !web_push_data.key || !web_push_data.auth) {
            return failure({ type: 'missing_data', message: 'missing web_push_data' }, { status: 400 });
        }

        const { endpoint, key, auth } = web_push_data;

        if (String(endpoint).length > 1024
            || String(key).length > 256
            || String(auth).length > 64) {
            return failure({ type: 'invalid_data', message: 'web_push_data member too long' }, { status: 400 });
        }

        try {
            new URL(endpoint);
        } catch (e: unknown) {
            return failure({ type: 'invalid_data', message: 'invalid endpoint' }, { status: 400 });
        }

        return await update(deviceId, deviceSecret, {
            auth: String(auth),
            endpoint: String(endpoint),
            key: String(key)
        })
            .then(() => success<boolean>(true))
            .catch((error: Error) => failure({ type: 'internal_error', message: error.message }));
    });


deviceRouter.delete('/:device_id',
    async (request: Required<Request>): Promise<Response> => {
        const { device_id } = request.params as { device_id: string };
        const deviceId = String(device_id);
        if (deviceId.length !== 32) {
            return failure({ type: 'invalid_data', message: 'invalid device_id' }, { status: 400 });
        }

        const { secret } = await request.json() as { secret: string };

        if (!secret) {
            return failure({ type: 'missing_data', message: 'missing secret' }, { status: 400 });
        }

        const deviceSecret = String(secret);
        if (deviceSecret.length !== 32) {
            return failure({ type: 'invalid_data', message: 'invalid secret' }, { status: 400 });
        }

        return await deleteDevice(deviceId, deviceSecret)
            .then(() => success<string>('deleted'))
            .catch((error: Error) => failure({ type: 'internal_error', message: error.message }));
    });