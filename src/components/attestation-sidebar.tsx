import { Utils } from '@secretarium/connector';
import {
    BadgeCheck,
    Cpu,
    FileDigit,
    Landmark,
    Lock,
    Settings2,
    ShieldCheck,
    SquareArrowOutUpRight,
    TriangleAlert,
    Workflow,
    X
} from 'lucide-react';
import * as React from 'react';

import type { AttestationComponent } from '@/lib/types';

// TODO: Replace with API call in the future
// Example: const attestationData = await fetchAttestationData();
import attestationData from '@/assets/attestation.json';
import { AttestationFlow } from '@/components/attestation-flow';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { useSecurityData } from '@/contexts/security-context';
import { useSidebar } from '@/hooks/use-sidebar';
import { KLAVE_AI_MULTIMODAL_FQDN } from '@/lib/constants';

export function AttestationSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { toggleSidebar } = useSidebar('right');
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
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-6" />
                                <span className="text-lg font-medium font-owners tracking-wide">
                                    Verification Center
                                </span>
                            </div>
                            <Button size="icon" variant="ghost" onClick={toggleSidebar}>
                                <X className="size-6" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-4">
                <p className="text-xs text-muted-foreground pb-2">
                    View security details about your connection and hardware attestation.
                </p>
                <Accordion type="multiple" className="w-full space-y-4">
                    <AccordionItem value="connection" className="border rounded-md p-2">
                        <AccordionTrigger>
                            <div className="flex gap-2 items-center">
                                <Lock className="size-4" />
                                <span>Connection is secure</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
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

                    <AccordionItem value="attestation" className="border rounded-md p-2">
                        <AccordionTrigger>
                            <div className="flex gap-2 items-center">
                                <Cpu className="size-4" />
                                <span>Secure hardware attestation</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
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
                                    <div className="flex flex-col gap-2 text-sm overflow-auto whitespace-pre-wrap break-words">
                                        <span className="font-medium">
                                            Image measurements are correct
                                        </span>
                                        <span>
                                            MR Enclave is
                                            <pre className="text-xs p-2 overflow-auto whitespace-pre-wrap break-words border border-border rounded bg-muted">
                                                {mrEnclaveHash}
                                            </pre>
                                        </span>
                                        <span>
                                            MR Signer is
                                            <pre className="text-xs p-2 overflow-auto whitespace-pre-wrap break-words border border-border rounded bg-muted">
                                                {mrSignedHash}
                                            </pre>
                                        </span>
                                        <span>
                                            App Digest is
                                            <pre className="text-xs p-2 overflow-auto whitespace-pre-wrap break-words border border-border rounded bg-muted">
                                                {contractIntegrityHash}
                                            </pre>
                                        </span>
                                        <span>
                                            Challenge
                                            <pre className="text-xs p-2 overflow-auto whitespace-pre-wrap break-words border border-border rounded bg-muted">
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

                    <AccordionItem value="verification-flow-diagram" className="border rounded-md p-2">
                        <AccordionTrigger>
                            <div className="flex gap-2 items-center">
                                <Workflow className="size-4" />
                                <span>Verification Flow Diagram</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground w-full h-[500px]">
                            {/* Pass attestation data from API or JSON file */}
                            <AttestationFlow data={attestationData as AttestationComponent} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SidebarContent>

            <SidebarFooter className="px-4 py-2 bg-green-100 border-t">
                <div className="text-xs flex items-center gap-2 text-green-600">
                    <BadgeCheck className="size-3" />
                    Security attestation verified
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
