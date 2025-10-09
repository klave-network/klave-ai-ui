import { Key, Utils } from '@secretarium/connector';
import {
    createFileRoute,
    Link,
    useNavigate,
    useRouter
} from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { createUser, getUser } from '@/api/klave-drive';
import { Logo } from '@/components/logo';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKeyPair, useKeyPairs } from '@/hooks/use-klave-ai-store';
import {
    KLAVE_AI_DRIVE_NODE,
    KLAVE_AI_MCP_CLIENT_NODE,
    KLAVE_AI_MULTIMODAL_NODE,
    KLAVE_AI_RAG_MCP_SERVER_NODE,
    KLAVE_CONNECTION_KEYPAIR_PWD
} from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';
import { storeActions } from '@/store';

export const Route = createFileRoute('/login/$keyname')({
    component: RouteComponent
});

function RouteComponent() {
    const { keyname } = Route.useParams();
    const hasSubmitted = useRef(false);
    const router = useRouter();
    const navigate = useNavigate();
    const keyPairs = useKeyPairs();
    const decodedKeyname = decodeURIComponent(keyname);
    const key = useKeyPair(decodedKeyname);

    const handleLogin = useCallback(
        async (e?: React.FormEvent<HTMLFormElement>) => {
            if (hasSubmitted.current)
                return false;

            hasSubmitted.current = true;
            if (e) {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.stopPropagation();
                e.nativeEvent.preventDefault();
            }

            if (!key) {
                toast.error('A user with this key does not exist');
                return;
            }

            try {
                await secretariumHandler.disconnect();
                const importedKey = await secretariumHandler
                    .use(key, KLAVE_CONNECTION_KEYPAIR_PWD)
                    .then(Key.importKey);
                const rawPublicKey = await importedKey.getRawPublicKey();
                const hashPublicKey = await Utils.hash(rawPublicKey);

                (window as any).currentDevicePublicKeyHash = Utils.toBase64(
                    hashPublicKey,
                    true
                );

                const toastId = toast.loading('Connecting...');

                await secretariumHandler.connect(KLAVE_AI_MULTIMODAL_NODE);
                await secretariumHandler.connect(KLAVE_AI_MCP_CLIENT_NODE);
                await secretariumHandler.connect(KLAVE_AI_RAG_MCP_SERVER_NODE);
                await secretariumHandler.connect(KLAVE_AI_DRIVE_NODE);

                toast.success(`Connected with ${key.name}.`, { id: toastId });

                // @TODO: Fix user authentication with Klave Drive
                const result = await getUser();
                if (!result.success) {
                    await createUser({ driveId: '', role: 'user' });
                }

                // Set Klave Drive ID in store
                storeActions.addKlaveDriveId(result.result?.roles?.[0]?.driveId ?? null);
                // Set current user in store
                storeActions.setCurrentUser(key.name);

                router.invalidate();
                navigate({ to: '/', search: true });
            }
            catch (e) {
                console.error(e);
                toast.error(`Failed to connect with ${key.name}.`);
                hasSubmitted.current = false;
            }
            return false;
        },
        [key, router, navigate] // Update dependencies
    );

    useEffect(() => {
        if (hasSubmitted.current)
            return;
        if (keyPairs.length > 0) { // Only run when keyPairs are loaded
            handleLogin();
        }
    }, [handleLogin, keyPairs.length]);

    const hasLoadedKeys = keyPairs.length > 0;

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
                        <span className="font-owners font-medium tracking-wide">Logging you in</span>
                    </CardTitle>
                    <CardDescription>
                        It will only take a few seconds, please wait...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col justify-center items-center text-center mb-4">
                        <Spinner />
                    </div>
                    <form onSubmit={handleLogin} className="hidden">
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Key Name</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    defaultValue={decodeURIComponent(keyname)}
                                    disabled
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    defaultValue={KLAVE_CONNECTION_KEYPAIR_PWD}
                                    disabled
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full hover:cursor-pointer"
                            >
                                Login
                            </Button>
                            <Button
                                className="w-full hover:cursor-pointer"
                                variant="secondary"
                                asChild
                            >
                                <Link to="/login" search>
                                    Go back
                                </Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
