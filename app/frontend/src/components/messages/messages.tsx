import { FunctionalComponent, h } from 'preact';
import 'preact-material-components/Theme/style.css';
import { useLastOpenTime } from '../../hooks/use-lastopen';
import { useMessageReceiver } from '../../hooks/use-messagereceiver';
import Message from '../message/message';
import style from './messages.css';
import { useEffect } from 'preact/hooks';

const Messages: FunctionalComponent = () => {
    const messages = useMessageReceiver();
    const lastOpenTime = useLastOpenTime();

    const newMessages = messages.filter(e => !(e.receivedAt <= lastOpenTime));
    const oldMessages = messages.filter(e => e.receivedAt <= lastOpenTime);

    useEffect(() => {
        if (navigator && (navigator as any).clearAppBadge) {
            (navigator as any).clearAppBadge();
        }
    }, [messages]);

    return (<div class={style.content}>
        <div class={style.main}>
            <ul class={style.messagelist}>
                {newMessages.map((message) => (
                    <li class={style.nobullet}>
                        <Message message={message} />
                    </li>)
                )}
            </ul>

            {(newMessages.length > 0) && <div class={style.divider}></div>}

            <ul class={style.messagelist}>
                {oldMessages.map((message) => (
                    <li class={style.nobullet}>
                        <Message message={message} />
                    </li>)
                )}
            </ul>
        </div>
    </div>)
}

export default Messages;