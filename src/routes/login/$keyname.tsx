import {
    Link,
    createFileRoute,
    useRouter,
    useNavigate
} from '@tanstack/react-router';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    LOC_KEY,
    KLAVE_CONNECTION_KEYPAIR_PWD,
    CUR_USER_KEY
} from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';
import { toast } from 'sonner';
import { Key, Utils } from '@secretarium/connector';
import { type KeyPair } from '@/lib/types';
import { useCallback, useEffect, useState, useRef } from 'react';
import { Logo } from '@/components/logo';
import { LoadingDots } from '@/components/loading-dots';

export const Route = createFileRoute('/login/$keyname')({
    component: RouteComponent
});

function RouteComponent() {
    const { keyname } = Route.useParams();
    const hasSubmitted = useRef(false);
    const router = useRouter();
    const navigate = useNavigate();
    const [keyPairs, setKeyPairs] = useState<KeyPair[]>([]);

    // Load key pairs from localStorage on component mount
    useEffect(() => {
        const storedKeyPairs = localStorage.getItem(LOC_KEY);
        if (storedKeyPairs) {
            try {
                setKeyPairs(JSON.parse(storedKeyPairs));
            } catch (error) {
                console.error('Failed to parse stored key pairs:', error);
                setKeyPairs([]);
            }
        }
    }, []);

    const handleLogin = useCallback(
        async (e?: React.FormEvent<HTMLFormElement>) => {
            if (hasSubmitted.current) return false;

            hasSubmitted.current = true;
            if (e) {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.stopPropagation();
                e.nativeEvent.preventDefault();
            }

            const decodedKeyname = decodeURIComponent(keyname);
            const key = keyPairs.find((kp) => kp.name === decodedKeyname);
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

                // Show loading toast and keep its ID
                const toastId = toast.loading('Connecting...');

                await secretariumHandler.connect();

                // Replace loading toast with success
                toast.success(`Connected with ${key.name}.`, { id: toastId });
                localStorage.setItem(CUR_USER_KEY, key.name);
                router.invalidate();
                navigate({ to: '/', search: true });
            } catch (e) {
                console.error(e);
                toast.error(`Failed to connect with ${key.name}.`);
                hasSubmitted.current = false;
            }
            return false;
        },
        [keyname, keyPairs, router, navigate]
    );

    useEffect(() => {
        if (hasSubmitted.current) return;
        handleLogin();
    }, [handleLogin, hasSubmitted]);

    const hasLoadedKeys = keyPairs.length > 0;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl mb-5">
                        <Logo className="mb-8" />
                        <span className="text-gray-400">
                            Welcome{hasLoadedKeys ? ' back' : ''}!
                        </span>
                        <br />
                        <span>Loggin you in</span>
                    </CardTitle>
                    <CardDescription>
                        It will only take a few seconds, please wait...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col justify-center items-center text-center mb-4">
                        <LoadingDots />
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
