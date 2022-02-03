import { authFactory } from '../../src/middleware/auth';

describe('auth middleware', () => {
    
    test('check no auth header', async () => {
        const req = new Request('https://localhost/');
        const SERVERPWD = 'test_password';
        const authFn = authFactory(SERVERPWD);
        const res = await authFn(req);
        expect(res).toBeTruthy();
        expect(res).toBeTruthy();
        expect(res?.status).toBe(401);
        expect(await res?.json()).toMatchObject({ successful: false, error: { type: 'auth_required' } });
    });

    test('check no auth password', async () => {
        const req = new Request('https://localhost/');
        const authFn = authFactory(undefined);
        const res = await authFn(req);
        expect(res).toBe(undefined);
    });
    
    test('check no auth password with auth header', async () => {
        const password = 'password_1234154781247182734';
        const req = new Request('https://localhost/', { headers: { authorization: `Bearer ${password}` } });
        const authFn = authFactory(undefined);
        const res = await authFn(req);
        expect(res).toBe(undefined);
    });

    test('check correct password', async () => {
        const password = 'password_1234154781247182734';
        const req = new Request('https://localhost/', { headers: { authorization: `Bearer ${password}` } });
        const authFn = authFactory(password);
        const res = await authFn(req);
        expect(res).not.toBeTruthy();
    });

    test('check invalid password', async () => {
        const password = 'password_1234154781247182734';
        const req = new Request('https://localhost/', { headers: { authorization: 'Bearer invalid_password' } });
        const authFn = authFactory(password);
        const res = await authFn(req);
        expect(res).toBeTruthy();
        expect(res).toBeTruthy();
        expect(res?.status).toBe(401);
        expect(await res?.json()).toMatchObject({ successful: false, error: { type: 'auth_required' } });
    });
});
