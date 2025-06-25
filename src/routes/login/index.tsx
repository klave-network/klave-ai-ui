import {
    createFileRoute,
    useRouter,
    useNavigate,
    Link
} from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    LOC_KEY,
    KLAVE_CONNECTION_KEYPAIR_PWD,
    CUR_USER_KEY
} from '@/lib/constants';
import { useState, useEffect } from 'react';
import { type KeyPair } from '@/lib/types';
import secretariumHandler from '@/lib/secretarium-handler';
import { Key, Utils } from '@secretarium/connector';
import { toast } from 'sonner';
import { KeyDropzone } from '@/components/key-dropzone';
import { KeyRound } from 'lucide-react';
import { Logo } from '@/components/logo';

export const Route = createFileRoute('/login/')({
    component: RouteComponent
});

function RouteComponent() {
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
                // Initialize with empty array if parsing fails
                localStorage.setItem(LOC_KEY, JSON.stringify([]));
            }
        } else {
            // Initialize with empty array if no key pairs are stored
            localStorage.setItem(LOC_KEY, JSON.stringify([]));
        }
    }, []);

    const handleFileUpload = async (key: KeyPair | null) => {
        if (key) {
            // Update state
            const updatedKeyPairs = [...keyPairs, key];
            setKeyPairs(updatedKeyPairs);

            // Update localStorage directly
            localStorage.setItem(LOC_KEY, JSON.stringify(updatedKeyPairs));

            await secretariumHandler.disconnect();
            const promise = secretariumHandler
                .use(key, KLAVE_CONNECTION_KEYPAIR_PWD)
                .then(Key.importKey)
                .then((key) => key.getRawPublicKey())
                .then((rawPublicKey) => Utils.hash(rawPublicKey))
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

            await promise; // Wait for the connection to complete
            localStorage.setItem(CUR_USER_KEY, key.name);
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
                        <Logo className='mb-8' />
                        <span className='text-gray-400'>Welcome{hasLoadedKeys ? ' back' : ''}!</span><br />
                        <span>Please log in</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-6">
                            {hasLoadedKeys
                                ? <>
                                    <CardDescription className='text-center'>
                                        You've already logged in with {hasManyLoadedKeys ? 'one of these keys' : 'this key'} before:
                                    </CardDescription>
                                    {keyPairs.map((keyPair) => (
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
                                : null}
                            {hasLoadedKeys ? <><hr /></> : null}
                            <CardDescription className='text-center'>
                                {hasLoadedKeys ? 'You can also upload' : 'Upload'} a new key to log in.
                            </CardDescription>
                            <KeyDropzone onFileUpload={handleFileUpload} />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
