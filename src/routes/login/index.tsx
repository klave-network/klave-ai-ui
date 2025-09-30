import { Key, Utils } from '@secretarium/connector';
import {
    createFileRoute,
    Link,
    useNavigate,
    useRouter
} from '@tanstack/react-router';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import type { KeyPair } from '@/lib/types';

import { getUser } from '@/api/klave-drive';
import { KeyDropzone } from '@/components/key-dropzone';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { useKeyPairs } from '@/hooks/use-klave-ai-store';
import {
    KLAVE_CONNECTION_KEYPAIR_PWD
} from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';
import { storeActions } from '@/store';

export const Route = createFileRoute('/login/')({
    component: RouteComponent
});

function RouteComponent() {
    const router = useRouter();
    const navigate = useNavigate();
    const keyPairs = useKeyPairs();

    const handleFileUpload = async (key: KeyPair | null) => {
        if (key) {
            storeActions.addKeyPair(key);

            await secretariumHandler.disconnect();
            const promise = secretariumHandler
                .use(key, KLAVE_CONNECTION_KEYPAIR_PWD)
                .then(Key.importKey)
                .then(key => key.getRawPublicKey())
                .then(rawPublicKey => Utils.hash(rawPublicKey))
                .then((hashPublicKey) => {
                    (window as any).currentDevicePublicKeyHash = Utils.toBase64(
                        hashPublicKey,
                        true
                    );
                    return secretariumHandler.connect();
                })
                .catch((e) => {
                    console.error(e);
                });

            toast.promise(promise, {
                loading: 'Connecting...',
                success: `Connected with ${key.name}.`,
                error: `Failed to connect with ${key.name}.`
            });

            await promise;

            await getUser();

            // Set current user in store
            storeActions.setCurrentUser(key.name);

            router.invalidate();
            navigate({ to: '/', search: true });
        }
    };

    const hasLoadedKeys = keyPairs.length > 0;
    const hasManyLoadedKeys = keyPairs.length > 1;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl mb-5">
                        <Logo className="mb-8" />
                        <span className="font-owners font-medium tracking-wide text-gray-400">
                            Welcome
                            {hasLoadedKeys ? ' back' : ''}
                            !
                        </span>
                        <br />
                        <span className="font-owners font-medium tracking-wide">Please log in</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-6">
                            {hasLoadedKeys
                                ? (
                                        <>
                                            <CardDescription className="text-center">
                                                You've already logged in with
                                                {' '}
                                                {hasManyLoadedKeys
                                                    ? 'one of these keys'
                                                    : 'this key'}
                                                {' '}
                                                before:
                                            </CardDescription>
                                            {keyPairs.map(keyPair => (
                                                <Button
                                                    variant="outline"
                                                    key={keyPair.name}
                                                    className="hover:cursor-pointer"
                                                    asChild
                                                >
                                                    <Link
                                                        search
                                                        to="/login/$keyname"
                                                        params={{
                                                            keyname: encodeURIComponent(
                                                                keyPair.name
                                                            )
                                                        }}
                                                    >
                                                        <KeyRound />
                                                        {keyPair.name}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </>
                                    )
                                : null}
                            {hasLoadedKeys
                                ? (
                                        <>
                                            <hr />
                                        </>
                                    )
                                : null}
                            <CardDescription className="text-center">
                                {hasLoadedKeys
                                    ? 'You can also upload'
                                    : 'Upload'}
                                {' '}
                                a new key to log in.
                            </CardDescription>
                            <KeyDropzone onFileUpload={handleFileUpload} />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
