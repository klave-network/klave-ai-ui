import { cn } from '@/lib/utils';
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
import { LOC_KEY, KLAVE_CONNECTION_KEYPAIR_PWD } from '@/lib/constants';
import { useLocalStorage } from 'usehooks-ts';
import { type KeyPair } from '@/lib/types';
import secretariumHandler from '@/lib/secretarium-handler';
import { Key, Utils } from '@secretarium/connector';
import { toast } from 'sonner';
import { useRouter, useNavigate } from '@tanstack/react-router';
import { KeyDropzone } from '@/components/key-dropzone';

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const router = useRouter();
    const navigate = useNavigate();
    const [keyPairs, setKeyPairs] = useLocalStorage<KeyPair[]>(LOC_KEY, []);

    const handleFileUpload = async (key: KeyPair | null) => {
        // Perform upload logic here (e.g., send files to server)
        if (key) {
            setKeyPairs((prevKeyPairs) => [...prevKeyPairs, key]);

            // need to disconnect first
            console.log('Disconnecting...');
            await secretariumHandler.disconnect();
            const promise = secretariumHandler
                .use(key, KLAVE_CONNECTION_KEYPAIR_PWD)
                .then(Key.importKey)
                .then((key) => key.getRawPublicKey())
                .then((rawPublicKey) => Utils.hash(rawPublicKey))
                .then((hashPublicKey) => {
                    console.log('Hashed public key:', hashPublicKey);
                    (window as any).currentDevicePublicKeyHash = Utils.toBase64(
                        hashPublicKey,
                        true
                    );
                    console.log('Connecting...');
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
            console.log('Waiting for connection...');
            await promise; // Wait for the connection to complete
            localStorage.setItem('currentUser', key.name);
            router.invalidate();
            navigate({ to: '/' });
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Secretarium key or create a new one
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                {keyPairs.length > 0 ? (
                                    keyPairs.map((keyPair, id) => (
                                        <div key={id}>{keyPair.name}</div>
                                    ))
                                ) : (
                                    <i className="text-center text-sm text-muted-foreground">
                                        There are currently no accounts setup on
                                        this device.
                                    </i>
                                )}
                                <KeyDropzone onFileUpload={handleFileUpload} />
                            </div>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-background text-muted-foreground relative z-10 px-2">
                                    Or continue with
                                </span>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Key Name</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{' '}
                                <a
                                    href="#"
                                    className="underline underline-offset-4"
                                >
                                    Sign up
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our{' '}
                <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
            </div> */}
        </div>
    );
}
