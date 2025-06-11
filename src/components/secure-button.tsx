import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Lock,
    Cpu,
    ChevronRight,
    ChevronLeft,
    BadgeCheck,
    Landmark,
    TriangleAlert,
    FileDigit,
    SquareArrowOutUpRight,
    Unplug
} from 'lucide-react';
import { klaveKlaveAIContract } from '@/api';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Utils } from '@secretarium/connector';
import type { QuoteResponse, VerifyResponse } from '@/lib/types';

type SecureButtonProps = {
    currentTime: number;
    challenge: number[];
    quote?: QuoteResponse;
    verification?: VerifyResponse;
};

export const SecureButton: React.FC<SecureButtonProps> = ({
    currentTime,
    challenge,
    quote,
    verification
}) => {
    const [state, setState] = useState<
        'default' | 'connection' | 'attestation'
    >('default');

    if (!quote || !verification)
        return <Button
            variant="ghost"
            disabled={true}
            className="hover:cursor-pointer hover:bg-gray-200 bg-gray-300 border border-gray-500"
        >
            <Unplug className="h-4 w-4" />
            Disconnected
        </Button>

    const downloadableQuote = new Blob([new Uint8Array(quote?.quote_binary ?? [])], {
        type: 'application/octet-stream'
    });
    const mrEnclaveHash = Utils.toBase64(
        new Uint8Array(quote?.quote?.report_body?.mr_enclave?.m ?? [])
    );
    const mrSignedHash = Utils.toBase64(
        new Uint8Array(quote?.quote?.report_body?.mr_signer?.m ?? [])
    );
    const contractIntegrityHash = Utils.toBase64(
        new Uint8Array(quote?.quote?.report_body?.report_data ?? [])
    );

    const popoverContent = () => {
        switch (state) {
            case 'attestation':
                return (
                    <>
                        <span
                            className="pb-2 font-medium flex gap-1 items-center hover:text-accent-foreground hover:cursor-pointer"
                            onClick={() => setState('default')}
                        >
                            <ChevronLeft className="" />
                            Secure hardware attestation
                        </span>
                        <div className="border-t border-t-border -mx-4">
                            <div className="flex flex-col gap-4 p-4">
                                <div className="flex gap-2">
                                    <BadgeCheck className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            Hardware is up to date
                                        </span>
                                        <span>
                                            {
                                                verification?.quote_verification_result_description
                                            }
                                            .{' '}
                                            <a
                                                href="https://docs.klave.com/learn/confidential-computing/attestation"
                                                className="text-blue-400 hover:underline flex align-middle items-center"
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            >
                                                Learn more.
                                            </a>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Lock className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm overflow-auto whitespace-pre-wrap break-words">
                                        <span className="font-medium">
                                            Image measurements are correct
                                        </span>
                                        <span>
                                            MR Enclave is
                                            <pre className="text-xs p-1 overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                                                {mrEnclaveHash}
                                            </pre>
                                        </span>
                                        <span>
                                            MR Signer is
                                            <pre className="text-xs p-1 overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                                                {mrSignedHash}
                                            </pre>
                                        </span>
                                        <span>
                                            App Digest is
                                            <pre className="text-xs p-1 overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                                                {contractIntegrityHash}
                                            </pre>
                                        </span>
                                        <span>
                                            Challenge
                                            <pre className="text-xs p-1 overflow-auto whitespace-pre-wrap break-words border border-border rounded text-gray-400">
                                                {JSON.stringify(challenge)}
                                            </pre>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <FileDigit className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            Attestation
                                        </span>
                                        <a
                                            download={`intel_quote_${klaveKlaveAIContract}_${currentTime}.bin`}
                                            href={URL.createObjectURL(
                                                downloadableQuote
                                            )}
                                            className="text-blue-400 hover:underline flex align-middle items-center"
                                        >
                                            Download Quote .bin{' '}
                                            <SquareArrowOutUpRight className="ml-2 size-4" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <TriangleAlert className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            Applicable Security Advisories
                                        </span>
                                        {verification?.sa_list
                                            ?.split(',')
                                            ?.map((sa: string) => (
                                                <a
                                                    key={sa}
                                                    title={sa}
                                                    href={`https://www.intel.com/content/www/us/en/security-center/advisory/${sa.toLocaleLowerCase()}.html`}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="text-blue-400 hover:underline flex align-middle items-center"
                                                >
                                                    {sa}{' '}
                                                    <SquareArrowOutUpRight className="ml-2 size-4" />
                                                </a>
                                            ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Landmark className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            Relying Party
                                        </span>
                                        Secretarium DCAP
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'connection':
                return (
                    <>
                        <span
                            className="pb-2 font-medium flex gap-1 items-center hover:text-accent-foreground hover:cursor-pointer"
                            onClick={() => setState('default')}
                        >
                            <ChevronLeft className="" />
                            Connection is secure
                        </span>
                        <div className="border-t border-t-border -mx-4">
                            <div className="flex flex-col gap-4 p-4">
                                <div className="flex gap-2">
                                    <BadgeCheck className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            Your connection is secure
                                        </span>
                                        <span>
                                            Your information is private when you
                                            use this app, no-one can see your
                                            data.{' '}
                                            <a
                                                href="https://docs.klave.com/learn/confidential-computing/tee"
                                                className="text-blue-400 hover:underline flex align-middle items-center"
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            >
                                                Learn more.
                                            </a>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <BadgeCheck className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span>
                                            {
                                                verification?.quote_verification_result_description
                                            }
                                            .{' '}
                                            <a
                                                href="https://docs.klave.com/learn/confidential-computing/attestation"
                                                className="text-blue-400 hover:underline flex align-middle items-center"
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            >
                                                Learn more.
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            default:
                return (
                    <>
                        <h4 className="pb-2 font-medium">Security</h4>
                        <div className="border-t border-t-border -mx-4">
                            <div className="flex flex-col gap-2 p-2">
                                <span
                                    className="p-2 flex gap-1 items-center hover:text-accent-foreground hover:cursor-pointer"
                                    onClick={() => setState('connection')}
                                >
                                    <Lock className="size-4" />
                                    Connection is secure
                                    <ChevronRight className="ml-auto" />
                                </span>
                                <span
                                    className="p-2 flex gap-1 items-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                                    onClick={() => setState('attestation')}
                                >
                                    <Cpu className="size-4" />
                                    Secure hardware attestation
                                    <ChevronRight className="ml-auto" />
                                </span>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="hover:cursor-pointer hover:bg-green-200 bg-green-300 border border-green-500"
                >
                    <Lock className="h-4 w-4" />
                    Secured
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col w-96 border-green-500">
                {popoverContent()}
            </PopoverContent>
        </Popover>
    );
};
