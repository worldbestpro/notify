import { FunctionalComponent, h } from 'preact';
import Switch from 'preact-material-components/Switch';
import 'preact-material-components/Switch/style.css';
import Snackbar from 'preact-material-components/Snackbar';
import 'preact-material-components/Snackbar/style.css';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useLogin } from '../../hooks/use-login';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import PasswordDialog from '../dialog/dialog';
import 'preact-material-components/LinearProgress/style.css';
import style from './register.css';

const Register: FunctionalComponent = () => {
    const snackbarRef = useRef<Snackbar>();

    const [isLoggedIn, setLoginState] = useLogin();

    const showSnackbar = useCallback((message: string, timeout: number = 7000) => {
        snackbarRef.current?.MDComponent.show({ message, timeout });
    }, [snackbarRef]);

    const [isLoading, setLoading] = useState<boolean>(false);
    const [showReloadButton, setShowReloadButton] = useState<boolean>(false);
    const [showDialog, setDialog] = useState<boolean>(false);

    const setLogin = useCallback(async (shouldDoLogin: boolean, password?: string) => {
        setLoading(true);
        try {
            const loginSuccess = await setLoginState(shouldDoLogin, password);
            if (!loginSuccess && shouldDoLogin) {
                setDialog(true);
            } else {
                setShowReloadButton(true);
            }
        } catch (e: any) {
            showSnackbar(`Login action failed: ${e}`);
            console.warn(e);
        }
        setLoading(false);
    }, [setLoginState, setLoading, setDialog]);

    const onDialogExit = useCallback((key?: string) => {
        setDialog(false);
        key && setLogin(true, key);
    }, [setLogin, setDialog]);

    return (
        <div>
            <div class={style.headline}>
                <Switch class={style.padding} onChange={(e: any) => setLogin(e.target.checked, undefined)} checked={isLoggedIn} />
                {isLoading && "loading"}
                {showReloadButton && <Button onClick={() => location.reload()}>reload please</Button>}
            </div>
            <PasswordDialog isOpened={showDialog} setPassword={onDialogExit} />
            <Snackbar ref={snackbarRef} />
        </div>
    );
};

export default Register;