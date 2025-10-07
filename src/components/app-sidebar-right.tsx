import { Utils } from '@secretarium/connector';
import {
    BadgeCheck,
    Cpu,
    FileDigit,
    Landmark,
    Lock,
    Settings2,
    SquareArrowOutUpRight,
    TriangleAlert
} from 'lucide-react';
import * as React from 'react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from '@/components/ui/sidebar';
import { useSecurityData } from '@/contexts/security-context';
import { KLAVE_AI_MULTIMODAL_FQDN } from '@/lib/constants';

export function AppSidebarRight({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { securityData } = useSecurityData();

    const currentTime = securityData?.currentTime ?? 0;
    const challenge = securityData?.challenge ?? [];
    const quote = securityData?.quote;
    const verification = securityData?.verification;

    if (!quote || !verification) {
        return (
            <Sidebar side="right" {...props}>
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-4 py-3">
                        <Settings2 className="h-5 w-5" />
                        <span className="font-semibold">Security</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                        No security information available.
                    </div>
                </SidebarContent>
                <SidebarRail side="right" />
            </Sidebar>
        );
    }

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

    return (
        <Sidebar side="right" {...props}>
            <SidebarHeader>
                <div className="flex flex-col gap-1 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        <span className="font-semibold">Security</span>
                    </div>
                    {/* <p className="text-xs text-muted-foreground">
                        View security details about your connection and hardware attestation.
                    </p> */}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="connection">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex gap-2 items-center">
                                <Lock className="size-4" />
                                <span>Connection is secure</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2">
                                    <BadgeCheck className="size-4 shrink-0 mt-1" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            Your connection is secure
                                        </span>
                                        <span>
                                            Your information is private when you
                                            use this app, no-one can see your
                                            data.
                                            {' '}
                                            <a
                                                href="https://docs.klave.com/learn/confidential-computing/tee"
                                                className="text-blue-400 hover:underline inline-flex align-middle items-center"
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
                                            .
                                            {' '}
                                            <a
                                                href="https://docs.klave.com/learn/confidential-computing/attestation"
                                                className="text-blue-400 hover:underline inline-flex align-middle items-center"
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            >
                                                Learn more.
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="attestation">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex gap-2 items-center">
                                <Cpu className="size-4" />
                                <span>Secure hardware attestation</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-4">
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
                                            .
                                            {' '}
                                            <a
                                                href="https://docs.klave.com/learn/confidential-computing/attestation"
                                                className="text-blue-400 hover:underline inline-flex align-middle items-center"
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
                                            download={`intel_quote_${KLAVE_AI_MULTIMODAL_FQDN}_${currentTime}.bin`}
                                            href={URL.createObjectURL(
                                                downloadableQuote
                                            )}
                                            className="text-blue-400 hover:underline inline-flex align-middle items-center"
                                        >
                                            Download Quote .bin
                                            {' '}
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
                                                    className="text-blue-400 hover:underline inline-flex align-middle items-center"
                                                >
                                                    {sa}
                                                    {' '}
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
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SidebarContent>

            <SidebarFooter className="px-4 py-2">
                <div className="text-xs text-muted-foreground">
                    Security attestation verified
                </div>
            </SidebarFooter>
            <SidebarRail side="right" />
        </Sidebar>
    );
}
