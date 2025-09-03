import type { PgsqlCreateInput } from '@/lib/types';

import { klaveKlaveAIContract, waitForConnection } from '@/api';
import secretariumHandler from '@/lib/secretarium-handler';

export async function pgsqlCreate(args: PgsqlCreateInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'pgsql_create',
                args,
                `pgsql_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function pgsqlList(): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'pgsql_list',
                '',
                `pgsql_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
