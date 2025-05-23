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
import { useLocalStorage } from 'usehooks-ts';
import { type KeyPair } from '@/lib/types';

export const Route = createFileRoute('/login/$keyname')({
    component: RouteComponent
});

function RouteComponent() {
    const { keyname } = Route.useParams();
    const router = useRouter();
    const navigate = useNavigate();
    const [keyPairs] = useLocalStorage<KeyPair[]>(LOC_KEY, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
            navigate({ to: '/' });
        } catch (e) {
            console.error(e);
            toast.error(`Failed to connect with ${key.name}.`);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Secretarium key
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
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
                                <Link to="/login">Go back</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
