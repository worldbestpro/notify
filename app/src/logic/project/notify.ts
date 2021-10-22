import { deleteDeviceFromDatabase, getAllDevicesIDs, getDevice } from '../../databases/device';
import type { JWK } from '../../webpush/jwk';
import { generateWebPushMessage } from '../../webpush/webpush';
import { WebPushMessage, WebPushResult } from '../../webpush/webpushinfos';


export async function notifyAll(title: string, message: string, tags: string[], icon?: string): Promise<Promise<void>> {
    if (!SUB || !VAPID_SERVER_KEY) {
        throw new Error('No Subject or vapid server key please set your secret / env var (see readme)');
    }

    const data = JSON.stringify({ body: message, icon, title, tags });

    if (data.length > 4 * 1024 * 1024) {
        throw new Error('Message too long');
    }

    const deviceIds = await getAllDevicesIDs();
    const vapidKeys: Readonly<JWK> = JSON.parse(VAPID_SERVER_KEY);

    const webPushMessageInfo: WebPushMessage = {
        data,
        urgency: 'normal',
        sub: SUB,
        ttl: 60 * 24 * 7
    };

    const promises = deviceIds.map(async (deviceId): Promise<void> => {
        const device = await getDevice(deviceId);
        if (!device.pushData) {
            throw new Error('Device has no push data');
        }
        const result = await generateWebPushMessage(webPushMessageInfo, device.pushData, vapidKeys);
        if (result === WebPushResult.NotSubscribed) {
            await deleteDeviceFromDatabase(deviceId);
        }
    });

    return Promise.all(promises) as unknown as Promise<void>;
}