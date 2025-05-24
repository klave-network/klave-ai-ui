import { createFileRoute } from '@tanstack/react-router';
import { getBackendVersion, getQuote, verifyQuote } from '@/api/klave';
import { Label } from '@/components/ui/label';
import { Utils } from '@secretarium/connector';
import { klaveKlaveAIContract } from '@/api';
import { SquareArrowOutUpRight } from 'lucide-react';

export const Route = createFileRoute('/_auth/chat/attest')({
    component: RouteComponent,
    loader: async () => {
        const challenge = Array.from(Utils.getRandomBytes(64));
        const currentTime = new Date().getTime();
        const quote = await getQuote({ challenge });
        const version = await getBackendVersion();
        const verification = await verifyQuote({
            quote: quote.quote_binary,
            current_time: currentTime
        });

        return {
            currentTime,
            challenge,
            quote,
            version,
            verification
        };
    },
    pendingComponent: () => (
        <div className="min-h-screen grid place-items-center">
            <div className="flex items-center gap-2">
                <span>Checking...</span>
            </div>
        </div>
    )
});

function RouteComponent() {
    const { currentTime, challenge, quote, version, verification } =
        Route.useLoaderData();

    const { wasm_version, core_version } = version;
    const secretariumCoreVersion = `${core_version.major}.${core_version.minor}.${core_version.patch}`;
    const secretariumWasmVersion = `${wasm_version.major}.${wasm_version.minor}.${wasm_version.patch}`;
    const downloadableQuote = new Blob([new Uint8Array(quote.quote_binary)], {
        type: 'application/octet-stream'
    });
    const mrEnclaveHash = Utils.toBase64(
        new Uint8Array(quote.quote?.report_body?.mr_enclave?.m ?? [])
    );
    const mrSignedHash = Utils.toBase64(
        new Uint8Array(quote.quote?.report_body?.mr_signer?.m ?? [])
    );
    const contractIntegrityHash = Utils.toBase64(
        new Uint8Array(quote.quote?.report_body?.report_data ?? [])
    );

    return (
        <div className="pt-4 space-y-4 w-1/2">
            <h3 className="text-xl pb-2">Intel SGX Attestation</h3>
            <div className="space-y-2">
                <Label>Enclave Verification Outcome</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    {verification.quote_verification_result_description}
                </pre>
            </div>
            <div className="space-y-2">
                <Label>Runtime</Label>
                <span className="font-bold">Secretarium Core :</span>{' '}
                <span className="text-gray-400">
                    v{secretariumCoreVersion} ({core_version.build_number})
                </span>
                <br />
                <span className="font-bold">Secretarium WASM :</span>{' '}
                <span className="text-gray-400">
                    v{secretariumWasmVersion} ({wasm_version.build_number})
                </span>
            </div>
            <div className="space-y-2">
                <Label>MRENCLAVE</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    {mrEnclaveHash}
                </pre>
            </div>
            <div className="space-y-2">
                <Label>MRSIGNER</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    {mrSignedHash}
                </pre>
            </div>
            <div className="space-y-2">
                <Label>Contract Integrity Digest</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    {contractIntegrityHash}
                </pre>
            </div>
            <div className="space-y-2">
                <Label>Challenge</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    {JSON.stringify(challenge) ?? ''}
                </pre>
            </div>
            <div className="space-y-2">
                <Label>Quote Information</Label>
                <a
                    download={`intel_quote_${klaveKlaveAIContract}_${currentTime}.bin`}
                    href={URL.createObjectURL(downloadableQuote)}
                    className="text-blue-400 hover:underline flex align-middle items-center"
                >
                    Download Quote .bin{' '}
                    <SquareArrowOutUpRight className="ml-2 size-4" />
                </a>
            </div>
            <div className="space-y-2">
                <Label>Applicable Intel Security Advisories</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    {verification.sa_list?.split(',')?.map((sa: string) => (
                        <a
                            key={sa}
                            title={sa}
                            href={`https://www.intel.com/content/www/us/en/security-center/advisory/${sa.toLocaleLowerCase()}.html`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex align-middle items-center"
                        >
                            {sa}{' '}
                            <SquareArrowOutUpRight className="ml-2 size-4" />
                        </a>
                    ))}
                </pre>
            </div>
            <div className="space-y-2">
                <Label>Relying Party</Label>
                <pre className="p-2 shadow-xs overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                    Secretarium DCAP
                </pre>
            </div>

            {/* <h3 className="mt-5 mb-3">Quote infromation</h3>
            <a
                download={`intel_quote_${address}_${verifyArgs.current_time}.bin`}
                href={URL.createObjectURL(downloadableQuote)}
                className="text-klave-light-blue hover:underline flex align-middle items-center"
            >
                Download Quote .bin{' '}
                <UilDownloadAlt className="inline-block h-4" />
            </a>
            <h3 className="mt-5 mb-3">Applicable Intel Security Advisories</h3>
            {verifyResult.sa_list?.split(',')?.map((sa: string) => (
                <a
                    key={sa}
                    title={sa}
                    href={`https://www.intel.com/content/www/us/en/security-center/advisory/${sa.toLocaleLowerCase()}.html`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-klave-light-blue hover:underline flex align-middle items-center"
                >
                    {sa} <UilExternalLinkAlt className="inline-block h-4" />
                </a>
            ))} */}
        </div>
    );
}
